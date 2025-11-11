// src/pages/Profile.jsx
import React, { useEffect, useRef, useState } from "react";
import { Upload, Modal, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { userServices } from "../services";
import { authAction } from "../store/auth/slice";

export const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const IMAGES_URL = import.meta.env.VITE_IMAGE_URL;

  const [changeInfo, setChangeInfo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [username, setUserName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");

  // Upload state
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const fullnameInputRef = useRef(null);
  const AVATAR_SIZE = 132; // px

  // helpers
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

  // sync user -> form
  useEffect(() => {
    if (!user) return;
    setFullName(user?.fullName || "");
    setUserName(user?.username || "");
    setAddress(user?.address || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setGender(user?.gender || "");
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
  }, [user, IMAGES_URL]);

  const handleChangeInfo = () => {
    setChangeInfo(true);
    setTimeout(() => fullnameInputRef.current?.focus(), 0);
  };

  const handleCancel = () => {
    if (!user) return;
    setFullName(user?.fullName || "");
    setUserName(user?.username || "");
    setAddress(user?.address || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setGender(user?.gender || "");
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
      const body = { fullName, phone, address, birthDate, gender };
      let finalUser = user;

      const resJson = await userServices.edit(user.id, body);
      if (resJson?.data) finalUser = resJson.data;

      const file = fileList[0]?.originFileObj;
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const resAvatar = await userServices.edit(user.id, fd);
        if (resAvatar?.data) finalUser = resAvatar.data;
      }

      dispatch(authAction.setUser(finalUser));

      if (finalUser?.image) {
        setFileList([
          {
            uid: "-1",
            name: finalUser.image,
            status: "done",
            url: `${IMAGES_URL}/users/${finalUser.image}?t=${Date.now()}`,
          },
        ]);
      } else {
        setFileList([]);
      }

      message.success("Profile updated");
      setChangeInfo(false);
    } catch (e) {
      console.error(e);
      message.error("Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  const isEditing = changeInfo;

  // --------- inline styles để không cần CSS thêm ----------
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
    <div className="text-center">
      {/* ===== Heading ===== */}
      <div className="text-center">
        <div className="heading-line mx-auto" style={{ "--heading-gap": "14px" }}>
          <span style={{ display: "grid", justifyItems: "end", gap: "6px", marginRight: "2px" }}>
            <span className="divider" style={{ "--w": "120px" }} />
            <span className="divider" style={{ "--w": "60px", "--alpha": 0.45 }} />
          </span>
          <h6 className="heading-text text-3xl text-primary text-uppercase">Profile</h6>
          <span style={{ display: "grid", justifyItems: "start", gap: "6px", marginLeft: "2px" }}>
            <span className="divider" style={{ "--w": "120px" }} />
            <span className="divider" style={{ "--w": "60px", "--alpha": 0.45 }} />
          </span>
        </div>
        <h1 className="mb-5">Personalize it in your own way!</h1>
      </div>

      {/* ===== Upload avatar (không dùng picture-circle) ===== */}
      <div className="mb-4 flex justify-center">
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
                    (fileList[0]?.originFileObj && URL.createObjectURL(fileList[0].originFileObj))
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
              <div style={overlayStyle}>
                {/* overlay chỉ hiện khi đang Edit; không cần icon mắt của AntD */}
              </div>
            </div>
          </div>
        </Upload>
      </div>

      {/* ===== Form fields ===== */}
      {[
        ["User name", username, setUserName, true],
        ["Full Name", fullName, setFullName],
        ["Email", email, setEmail, true],
        ["Phone", phone, setPhone],
        ["Address", address, setAddress],
        ["Gender", gender, setGender],
        ["Birth Date", birthDate, setBirthDate, false, "date"],
      ].map(([label, value, setter, forceReadOnly, type], i) => (
        <div className="mb-2" key={i}>
          <label
            className="input input-bordered flex items-center gap-2 input-xs rounded-full p-4 max-w-md mx-auto"
            style={{ backgroundColor: "var(--card-yellow)" }}
          >
            <span className="min-w-[100px] font-semibold">{label}</span>
            <input
              ref={i === 1 ? fullnameInputRef : undefined}
              type={type || "text"}
              className="grow bg-transparent text-gray-800"
              readOnly={forceReadOnly || !changeInfo}
              value={value}
              onChange={(e) => setter(e.target.value)}
            />
          </label>
        </div>
      ))}

      {/* ===== Actions ===== */}
      <div className="mt-4">
        {!changeInfo ? (
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

      {/* Preview modal */}
      <Modal open={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)}>
        <img alt="avatar preview" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </div>
  );
};
