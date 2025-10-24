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
  const AVATAR_SIZE = 132; // kích thước avatar

  // Helpers
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
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

  // Đồng bộ user -> form
  useEffect(() => {
    if (!user) return;
    setFullName(user?.fullName || "");
    setUserName(user?.username || "");
    setAddress(user?.address || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setGender(user?.gender || "");
    setBirthDate(toIsoDate(user?.birthDate));

    const ts = Date.now(); // cache-buster
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

  // Actions
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

  const onUploadChange = ({ fileList: newList }) => {
    setFileList(newList.slice(-1)); // chỉ giữ 1 ảnh
  };

  const onPreview = async (file) => {
    setPreviewImage(file.url || (await getBase64(file.originFileObj)));
    setPreviewOpen(true);
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
    } catch (err) {
      console.error("Failed to update profile:", err);
      message.error("Update failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="text-center">
      <style>
        {`
          .ant-upload-list-picture-circle .ant-upload-list-item,
          .ant-upload-list-picture-circle .ant-upload-list-item-container,
          .ant-upload-list-picture-circle .ant-upload-list-item-thumbnail,
          .ant-upload-list-picture-circle .ant-upload-list-item-thumbnail img,
          .ant-upload-wrapper .ant-upload-select {
            width: ${AVATAR_SIZE}px !important;
            height: ${AVATAR_SIZE}px !important;
          }
        `}
      </style>

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

      {/* ===== Upload avatar ===== */}
      <div className="mb-4 flex justify-center">
        <Upload
          listType="picture-circle"
          fileList={fileList}
          onChange={onUploadChange}
          onPreview={onPreview}
          maxCount={1}
          beforeUpload={() => false}
        >
          {fileList.length >= 1 ? null : (
            <button type="button" style={{ border: 0, background: "none" }}>
              <div style={{ marginTop: 8 }}>Upload</div>
            </button>
          )}
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
      ].map(([label, value, setter, readOnly, type], i) => (
        <div className="mb-2" key={i}>
          <label
            className="input input-bordered flex items-center gap-2 input-xs rounded-full p-4 max-w-md mx-auto"
            style={{ backgroundColor: "var(--card-yellow)" }}
          >
            <span className="min-w-[100px] font-semibold">{label}</span>
            <input
              type={type || "text"}
              className="grow bg-transparent text-gray-800"
              readOnly={readOnly}
              value={value}
              onChange={(e) => setter(e.target.value)}
            />
          </label>
        </div>
      ))}

      {/* ===== Actions ===== */}
      <div className="mt-4">
        {!changeInfo ? (
          <button
            className="rounded-2xl py-2 px-5 btn-primary ml-auto my-2"
            onClick={handleChangeInfo}
          >
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
