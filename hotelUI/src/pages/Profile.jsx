// src/pages/Profile.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Upload, Modal, message, Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { userServices } from "../services";
import { authAction } from "../store/auth/slice";
import { loyaltyService } from "../services/loyalty";

export const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const IMAGES_URL = import.meta.env.VITE_IMAGE_URL;

  const [changeInfo, setChangeInfo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState(""); // 🔒 locked
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState(""); // 🔒 locked
  const [gender, setGender] = useState("male");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");

  // Upload state
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const fullnameInputRef = useRef(null);
  const AVATAR_SIZE = 132;
  const [initialized, setInitialized] = useState(false);

  // Loyalty
  const [loyalty, setLoyalty] = useState({ points: 0, tier: "BRONZE" });

  const isEditing = changeInfo;

  // ========= helpers =========
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (e) => reject(e);
    });

  const toIsoDate = (raw) => {
    if (!raw) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    try {
      return new Date(raw).toISOString().slice(0, 10);
    } catch {
      return "";
    }
  };

  const getToken = () => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return u?.accessToken || u?.token || u?.jwt || null;
    } catch {
      return null;
    }
  };

  const persistMergedUser = (incomingUser) => {
    const prev = (() => {
      try {
        return JSON.parse(localStorage.getItem("user") || "{}");
      } catch {
        return {};
      }
    })();

    // ✅ luôn giữ token cũ nếu response không trả token
    const merged = {
      ...prev,
      ...(incomingUser || {}),
      accessToken: prev?.accessToken,
    };

    // ✅ cập nhật redux theo kiểu merge (không bao giờ mất token)
    dispatch(authAction.mergeUser(merged));
    // ✅ cập nhật localStorage
    try {
      localStorage.setItem("user", JSON.stringify(merged));
    } catch { }

    return merged;
  };

  // progress text
  const progressText = useMemo(() => {
    const p = Number(loyalty.points || 0);
    if (p < 10) return `Earn ${10 - p} more points to unlock SILVER rewards.`;
    if (p < 100) return `Earn ${100 - p} more points to unlock GOLD rewards.`;
    return "You’re enjoying GOLD rewards.";
  }, [loyalty.points]);

  // ========= init form from user =========
  useEffect(() => {
    if (!user || initialized) return;

    setFullName(user?.fullName || "");
    setUsername(user?.username || "");
    setAddress(user?.address || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setGender(String(user?.gender || "male").toLowerCase() === "female" ? "female" : "male");
    setBirthDate(toIsoDate(user?.birthDate));

    const ts = Date.now();
    setFileList(
      user?.image
        ? [
          {
            uid: "-1",
            name: user.image,
            status: "done",
            url: `${IMAGES_URL}/users/${user.image}?t=${ts}`,
          },
        ]
        : []
    );

    setInitialized(true);
  }, [user, initialized, IMAGES_URL]);

  // ========= load loyalty (only if token exists) =========
  useEffect(() => {
    if (!user) return;
    const token = getToken();
    if (!token) return;

    (async () => {
      try {
        const data = await loyaltyService.getMyLoyalty();
        const points = Number(data?.points ?? 0);
        const tier = String(data?.tier ?? "BRONZE").toUpperCase();
        setLoyalty({ points, tier });
      } catch (e) {
        console.error("Load loyalty failed:", e);
      }
    })();
  }, [user]);

  // ========= actions =========
  const handleChangeInfo = () => {
    setChangeInfo(true);
    setTimeout(() => fullnameInputRef.current?.focus(), 0);
  };

  const handleCancel = () => {
    if (!user) return;

    setFullName(user?.fullName || "");
    setUsername(user?.username || "");
    setAddress(user?.address || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setGender(String(user?.gender || "male").toLowerCase() === "female" ? "female" : "male");
    setBirthDate(toIsoDate(user?.birthDate));

    const ts = Date.now();
    setFileList(
      user?.image
        ? [
          {
            uid: "-1",
            name: user.image,
            status: "done",
            url: `${IMAGES_URL}/users/${user.image}?t=${ts}`,
          },
        ]
        : []
    );

    setChangeInfo(false);
  };

  const onUploadChange = async ({ fileList: newList }) => {
    const last = newList.slice(-1);
    setFileList(last);

    const file = last[0]?.originFileObj;
    if (file) {
      const b64 = await getBase64(file);
      setPreviewImage(b64);
    }
  };

  const onPreview = async () => {
    const url =
      fileList[0]?.url ||
      (fileList[0]?.originFileObj && (await getBase64(fileList[0].originFileObj)));
    if (url) {
      setPreviewImage(url);
      setPreviewOpen(true);
    }
  };

  const handleSaveInfo = async () => {
    if (!user?.id) return;
    setIsSaving(true);

    try {
      // ✅ Username + Email locked => không gửi
      const body = { fullName, phone, address, birthDate, gender };

      let finalUser = null;

      // 1) update text
      const resInfo = await userServices.editInfo(user.id, body);
      if (resInfo?.data) finalUser = resInfo.data;

      // 2) update avatar nếu có file mới
      const file = fileList[0]?.originFileObj;
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const resAvatar = await userServices.updateAvatar(user.id, fd);
        if (resAvatar?.data) finalUser = resAvatar.data;
      }

      // 3) merge vào redux + localStorage (GIỮ TOKEN)
      const merged = persistMergedUser(finalUser);

      // 4) refresh avatar UI ngay (chống cache)
      const ts = Date.now();
      setFileList(
        merged?.image
          ? [
            {
              uid: "-1",
              name: merged.image,
              status: "done",
              url: `${IMAGES_URL}/users/${merged.image}?t=${ts}`,
            },
          ]
          : []
      );

      message.success("Profile updated");
      setChangeInfo(false);
    } catch (e) {
      console.error(e);
      message.error("Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  // ========= styles =========
  const ringStyle = {
    width: AVATAR_SIZE + 8,
    height: AVATAR_SIZE + 8,
    padding: 4,
    borderRadius: "50%",
    background: "#fff",
    boxShadow: "0 0 0 2px rgba(0,0,0,.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const circleStyle = {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: "50%",
    overflow: "hidden",
    position: "relative",
    cursor: "pointer",
  };

  const imgStyle = {
    width: "100%",
    height: "100%",
    display: "block",
    objectFit: "cover",
    objectPosition: "center",
  };

  const overlayStyle = {
    position: "absolute",
    inset: 0,
    display: isEditing ? "flex" : "none",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,.25)",
    pointerEvents: "none",
  };

  return (
    <div className="container-xxl py-5">
      <div className="container">
        {/* ===== Title ===== */}
        <div className="text-center mb-4">
          <div className="sb-heading sb-heading--md mx-auto">
            <span className="sb-heading__lines sb-heading__lines--left">
              <span className="sb-heading__line sb-heading__line--long" />
              <span className="sb-heading__line sb-heading__line--short" />
            </span>

            <h6
              className="sb-heading__label"
              style={{ fontSize: "26px", fontWeight: 900, letterSpacing: "0.18em" }}
            >
              PROFILE
            </h6>

            <span className="sb-heading__lines sb-heading__lines--right">
              <span className="sb-heading__line sb-heading__line--long" />
              <span className="sb-heading__line sb-heading__line--short" />
            </span>
          </div>

          <h1 className="mb-4" style={{ fontSize: "28px" }}>
            Personalize it in your own way!
          </h1>
        </div>

        {/* ===== Loyalty Card ===== */}
        {user && (
          <div className="row justify-content-center mb-4">
            <div className="col-lg-8">
              <div
                className="h-full rounded-4 p-4 p-md-4 text-center shadow-sm"
                style={{
                  background: "rgba(255, 237, 160, 0.90)",
                  border: "1px solid rgba(252, 211, 77, 0.55)",
                }}
              >
                <h3
                  className="mb-2 text-primary text-uppercase"
                  style={{
                    fontSize: "22px",
                    fontWeight: 900,
                    letterSpacing: "0.6px",
                    textShadow: "0 1px 0 rgba(0,0,0,0.08)",
                  }}
                >
                  Your Loyalty Program
                </h3>

                <p className="mb-0" style={{ fontSize: "14px", lineHeight: 1.55 }}>
                  Hello <span className="fw-bold">{user.fullName || user.username}</span> 👋 <br />
                  You have <span className="fw-bold text-primary">{loyalty.points}</span> points •{" "}
                  <span className="fw-bold text-uppercase">{loyalty.tier}</span> tier.{" "}
                  <span className="text-muted">{progressText}</span>
                </p>

                <div className="mt-3">
                  <Link
                    to="/my-bookings"
                    className="btn btn-primary rounded-pill px-4 py-2"
                    style={{ fontSize: "14px" }}
                  >
                    View my bookings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== Upload avatar ===== */}
        <div className="mb-4 d-flex justify-content-center">
          <Upload
            showUploadList={false}
            beforeUpload={() => false}
            onChange={isEditing ? onUploadChange : undefined}
            openFileDialogOnClick={isEditing}
          >
            <div
              style={ringStyle}
              onClick={(e) => {
                if (!isEditing) {
                  e.preventDefault();
                  onPreview();
                }
              }}
              aria-label={isEditing ? "Change avatar" : "Preview avatar"}
            >
              <div style={circleStyle}>
                {fileList[0]?.url || fileList[0]?.originFileObj ? (
                  <img
                    alt="avatar"
                    src={
                      fileList[0]?.url ||
                      (fileList[0]?.originFileObj &&
                        URL.createObjectURL(fileList[0].originFileObj))
                    }
                    style={imgStyle}
                  />
                ) : (
                  <div
                    style={{
                      ...imgStyle,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      color: "#666",
                      background: "rgba(0,0,0,.04)",
                    }}
                  >
                    Upload
                  </div>
                )}
                <div style={overlayStyle} />
              </div>
            </div>
          </Upload>
        </div>

        {/* ===== Form fields ===== */}
        <div className="text-center">
          <div className="mb-2">
            <label
              className="input input-bordered flex items-center gap-2 input-xs rounded-full p-4 max-w-md mx-auto"
              style={{ backgroundColor: "var(--card-yellow)" }}
            >
              <span className="min-w-[100px] font-semibold">User name</span>
              <Tooltip title="Username cannot be changed after registration">
                <input
                  type="text"
                  value={username}
                  readOnly
                  className="grow bg-transparent text-gray-400 cursor-not-allowed"
                />
              </Tooltip>
              <span className="text-gray-400 text-sm">🔒</span>
            </label>
          </div>

          <div className="mb-2">
            <label
              className="input input-bordered flex items-center gap-2 input-xs rounded-full p-4 max-w-md mx-auto"
              style={{ backgroundColor: "var(--card-yellow)" }}
            >
              <span className="min-w-[100px] font-semibold">Full Name</span>
              <input
                ref={fullnameInputRef}
                type="text"
                className="grow bg-transparent text-gray-800"
                readOnly={!isEditing}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </label>
          </div>

          <div className="mb-2">
            <label
              className="input input-bordered flex items-center gap-2 input-xs rounded-full p-4 max-w-md mx-auto"
              style={{ backgroundColor: "var(--card-yellow)" }}
            >
              <span className="min-w-[100px] font-semibold">Email</span>
              <Tooltip title="Email is used for login and verification, so it cannot be changed">
                <input
                  type="text"
                  value={email}
                  readOnly
                  className="grow bg-transparent text-gray-400 cursor-not-allowed"
                />
              </Tooltip>
              <span className="text-gray-400 text-sm">🔒</span>
            </label>
          </div>

          <div className="mb-2">
            <label
              className="input input-bordered flex items-center gap-2 input-xs rounded-full p-4 max-w-md mx-auto"
              style={{ backgroundColor: "var(--card-yellow)" }}
            >
              <span className="min-w-[100px] font-semibold">Phone</span>
              <input
                type="text"
                className="grow bg-transparent text-gray-800"
                readOnly={!isEditing}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
          </div>

          <div className="mb-2">
            <label
              className="input input-bordered flex items-center gap-2 input-xs rounded-full p-4 max-w-md mx-auto"
              style={{ backgroundColor: "var(--card-yellow)" }}
            >
              <span className="min-w-[100px] font-semibold">Address</span>
              <input
                type="text"
                className="grow bg-transparent text-gray-800"
                readOnly={!isEditing}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </label>
          </div>

          <div className="mb-2">
            <label
              className="input input-bordered flex items-center gap-2 input-xs rounded-full p-4 max-w-md mx-auto"
              style={{ backgroundColor: "var(--card-yellow)" }}
            >
              <span className="min-w-[100px] font-semibold">Gender</span>
              <select
                className="grow bg-transparent text-gray-800 outline-none"
                value={gender}
                disabled={!isEditing}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
          </div>

          <div className="mb-2">
            <label
              className="input input-bordered flex items-center gap-2 input-xs rounded-full p-4 max-w-md mx-auto"
              style={{ backgroundColor: "var(--card-yellow)" }}
            >
              <span className="min-w-[100px] font-semibold">Birth Date</span>
              <input
                type="date"
                className="grow bg-transparent text-gray-800"
                readOnly={!isEditing}
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </label>
          </div>
        </div>

        {/* ===== Actions ===== */}
        <div className="mt-4 text-center">
          {!isEditing ? (
            <button className="rounded-2xl py-2 px-5 btn-primary ml-auto my-2" onClick={handleChangeInfo}>
              Edit Profile
            </button>
          ) : (
            <>
              <button
                className="rounded-2xl py-2 px-5 btn-primary ml-auto my-2 disabled:opacity-60"
                onClick={handleSaveInfo}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                className="rounded-2xl py-2 px-5 btn-outline m-1 btn-error"
                onClick={handleCancel}
                type="button"
                disabled={isSaving}
              >
                Cancel
              </button>
            </>
          )}
        </div>

        <Modal open={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)}>
          <img alt="avatar preview" style={{ width: "100%" }} src={previewImage} />
        </Modal>
      </div>
    </div>
  );
};
