import React, { useMemo, useState } from "react";
import { Input, Modal, Select, Upload, DatePicker, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { BiPlusCircle } from "react-icons/bi";

import { userServices } from "../../../../../services/user";
import { userAction } from "../../../../../store/user/slice";
import { roleData } from "../../../../../assets/constants";

const USERNAME_REGEX = /^[a-zA-Z0-9]+$/;
const PHONE_REGEX = /^[0-9]{9,11}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AdAddUser = ({ isModalAddVisible, setIsModalAddVisible }) => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.user);

  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState([]);
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [saving, setSaving] = useState(false);

  // track "touched" để chỉ hiện lỗi sau khi user tương tác
  const [touched, setTouched] = useState({
    file: false,
    fullname: false,
    username: false,
    password: false,
    email: false,
    phone: false,
    address: false,
    birthDate: false,
    gender: false,
    roles: false,
  });

  const markTouched = (key) =>
    setTouched((prev) => ({ ...prev, [key]: true }));

  const resetForm = () => {
    setFullname("");
    setUsername("");
    setPassword("");
    setEmail("");
    setRoles([]);
    setAddress("");
    setGender("");
    setPhone("");
    setBirthDate(null);
    setFileList([]);
    setTouched({
      file: false,
      fullname: false,
      username: false,
      password: false,
      email: false,
      phone: false,
      address: false,
      birthDate: false,
      gender: false,
      roles: false,
    });
  };

  const file = fileList[0]?.originFileObj;

  const errors = useMemo(() => {
    const e = {};

    // Avatar
    if (!file) e.file = "Please upload an avatar image.";

    // Username (khớp BE: 6-20)
    const u = (username || "").trim();
    if (!u) e.username = "Username is required.";
    else if (u.length < 6 || u.length > 20)
      e.username = "Username must be 6–20 characters.";
    else if (!USERNAME_REGEX.test(u))
      e.username = "Username can only contain letters and numbers.";

    // Password
    const p = password || "";
    if (!p) e.password = "Password is required.";
    else if (p.length < 6) e.password = "Password must be at least 6 characters.";

    // Email
    const em = (email || "").trim();
    if (!em) e.email = "Email is required.";
    else if (!EMAIL_REGEX.test(em)) e.email = "Email format is invalid.";

    // Phone (optional nhưng nếu nhập thì phải đúng)
    const ph = (phone || "").trim();
    if (ph && !PHONE_REGEX.test(ph))
      e.phone = "Phone must be 9–11 digits (numbers only).";

    // Roles (optional, nếu muốn bắt buộc thì mở comment)
    // if (!roles || roles.length === 0) e.roles = "Please select at least 1 role.";

    return e;
  }, [file, username, password, email, phone, roles]);

  const isValid = Object.keys(errors).length === 0;

  const showFirstError = () => {
    const firstKey = Object.keys(errors)[0];
    if (firstKey) message.error(errors[firstKey]);
  };

  const handleModalOk = async () => {
    // đánh dấu tất cả để show lỗi hết
    setTouched({
      file: true,
      fullname: true,
      username: true,
      password: true,
      email: true,
      phone: true,
      address: true,
      birthDate: true,
      gender: true,
      roles: true,
    });

    if (!isValid) {
      showFirstError();
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("fullName", fullname);
      formData.append("phone", phone);
      formData.append("email", email);
      formData.append("username", username.trim());
      formData.append("password", password);
      formData.append("gender", gender);
      formData.append("address", address);
      formData.append("birthDate", birthDate ? birthDate.format("YYYY-MM-DD") : "");
      formData.append("file", file);

      roles.forEach((role) => formData.append("roles", role));

      const response = await userServices.create(formData);
      const newUser = response.data;

      // tránh cache ảnh
      if (newUser?.image) newUser.image = newUser.image + "?v=" + Date.now();

      dispatch(userAction.setUsers([...(users || []), newUser]));
      message.success("User created successfully");

      setIsModalAddVisible(false);
      resetForm();
    } catch (error) {
      console.error("Error creating user:", error);
      message.error(error?.response?.data?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <BiPlusCircle />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <Modal
      title="Add User"
      open={isModalAddVisible}
      onCancel={() => {
        setIsModalAddVisible(false);
        resetForm();
      }}
      onOk={handleModalOk}
      confirmLoading={saving}
      okButtonProps={{ disabled: saving || !isValid }}
    >
      {/* Image */}
      <div className="flex items-start mb-3 gap-3">
        <p className="min-w-20 mt-2">Image</p>
        <div className="w-full">
          <Upload
            listType="picture-circle"
            fileList={fileList}
            onChange={({ fileList }) => {
              setFileList(fileList);
              markTouched("file");
            }}
            beforeUpload={() => false}
            maxCount={1}
          >
            {fileList.length >= 1 ? null : uploadButton}
          </Upload>
          {touched.file && errors.file && (
            <div className="text-red-500 text-xs mt-1">{errors.file}</div>
          )}
        </div>
      </div>

      {/* Fullname */}
      <div className="flex items-center mb-3 gap-3">
        <p className="min-w-20">Full name</p>
        <Input
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
          onBlur={() => markTouched("fullname")}
        />
      </div>

      {/* Username */}
      <div className="flex items-start mb-3 gap-3">
        <p className="min-w-20 mt-2">Username</p>
        <div className="w-full">
          <Input
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              markTouched("username");
            }}
            onBlur={() => markTouched("username")}
            placeholder="6–20 chars, letters & numbers"
          />
          {touched.username && errors.username && (
            <div className="text-red-500 text-xs mt-1">{errors.username}</div>
          )}
        </div>
      </div>

      {/* Password */}
      <div className="flex items-start mb-3 gap-3">
        <p className="min-w-20 mt-2">Password</p>
        <div className="w-full">
          <Input.Password
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              markTouched("password");
            }}
            onBlur={() => markTouched("password")}
          />
          {touched.password && errors.password && (
            <div className="text-red-500 text-xs mt-1">{errors.password}</div>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="flex items-start mb-3 gap-3">
        <p className="min-w-20 mt-2">Email</p>
        <div className="w-full">
          <Input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              markTouched("email");
            }}
            onBlur={() => markTouched("email")}
            placeholder="example@gmail.com"
          />
          {touched.email && errors.email && (
            <div className="text-red-500 text-xs mt-1">{errors.email}</div>
          )}
        </div>
      </div>

      {/* Phone */}
      <div className="flex items-start mb-3 gap-3">
        <p className="min-w-20 mt-2">Phone</p>
        <div className="w-full">
          <Input
            value={phone}
            onChange={(e) => {
              // chỉ cho nhập số
              const v = e.target.value.replace(/\D/g, "");
              setPhone(v);
              markTouched("phone");
            }}
            onBlur={() => markTouched("phone")}
            placeholder="9–11 digits"
          />
          {touched.phone && errors.phone && (
            <div className="text-red-500 text-xs mt-1">{errors.phone}</div>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="flex items-center mb-3 gap-3">
        <p className="min-w-20">Address</p>
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onBlur={() => markTouched("address")}
        />
      </div>

      {/* Birth date */}
      <div className="flex items-center mb-3 gap-3">
        <p className="min-w-20">Birth date</p>
        <DatePicker
          format="YYYY-MM-DD"
          value={birthDate}
          onChange={(v) => {
            setBirthDate(v);
            markTouched("birthDate");
          }}
          className="w-full"
        />
      </div>

      {/* Gender */}
      <div className="flex items-center mb-3 gap-3">
        <p className="min-w-20">Gender</p>
        <Select
          value={gender}
          onChange={(v) => {
            setGender(v);
            markTouched("gender");
          }}
          style={{ width: "100%" }}
          placeholder="Select gender"
          allowClear
        >
          <Select.Option value="male">Male</Select.Option>
          <Select.Option value="female">Female</Select.Option>
        </Select>
      </div>

      {/* Roles */}
      <div className="flex items-start mb-1 gap-3">
        <p className="min-w-20 mt-2">Roles</p>
        <div className="w-full">
          <Select
            mode="multiple"
            placeholder="Select role"
            value={roles}
            onChange={(v) => {
              setRoles(v);
              markTouched("roles");
            }}
            style={{ width: "100%" }}
            allowClear
          >
            {roleData.map((role) => (
              <Select.Option key={role.value} value={role.value}>
                {role.name}
              </Select.Option>
            ))}
          </Select>

          {/* nếu bạn bật roles bắt buộc thì mở phần này */}
          {/* {touched.roles && errors.roles && (
            <div className="text-red-500 text-xs mt-1">{errors.roles}</div>
          )} */}
        </div>
      </div>
    </Modal>
  );
};
