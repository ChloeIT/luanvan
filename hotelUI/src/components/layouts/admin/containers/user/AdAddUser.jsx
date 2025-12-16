import {
  Input,
  Modal,
  Select,
  Upload,
  DatePicker,
  message,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import React, { useState } from "react";
import { userServices } from "../../../../../services/user";
import { userAction } from "../../../../../store/user/slice";
import { BiPlusCircle } from "react-icons/bi";
import { roleData } from "../../../../../assets/constants";

export const AdAddUser = ({ isModalAddVisible, setIsModalAddVisible }) => {
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

  const { users } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleModalOk = async () => {
    const file = fileList[0]?.originFileObj;

    // ✅ validate FE
    if (!file) {
      message.warning("Please upload an avatar image.");
      return;
    }
    if (!username || !password || !email) {
      message.warning("Username, password and email are required.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("fullName", fullname);
      formData.append("phone", phone);
      formData.append("email", email);
      formData.append("username", username);
      formData.append("password", password);
      formData.append("gender", gender);
      formData.append("address", address);
      formData.append(
        "birthDate",
        birthDate ? birthDate.format("YYYY-MM-DD") : ""
      );
      formData.append("file", file);

      roles.forEach((role) => formData.append("roles", role));

      const response = await userServices.create(formData);

      const newUser = response.data;
      newUser.image = newUser.image + "?v=" + Date.now();

      dispatch(userAction.setUsers([...users, newUser]));
      message.success("User created successfully");
      setIsModalAddVisible(false);
    } catch (error) {
      console.error("Error creating user:", error);
      message.error(
        error?.response?.data?.message || "Failed to create user"
      );
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
      onCancel={() => setIsModalAddVisible(false)}
      onOk={handleModalOk}
      confirmLoading={saving}
    >
      {/* Image */}
      <div className="flex items-center mb-3">
        <p className="min-w-20">Image</p>
        <Upload
          listType="picture-circle"
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          beforeUpload={() => false}
          maxCount={1}
        >
          {fileList.length >= 1 ? null : uploadButton}
        </Upload>
      </div>

      <div className="flex items-center mb-3">
        <p className="min-w-20">Full name</p>
        <Input value={fullname} onChange={(e) => setFullname(e.target.value)} />
      </div>

      <div className="flex items-center mb-3">
        <p className="min-w-20">Username</p>
        <Input value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>

      <div className="flex items-center mb-3">
        <p className="min-w-20">Password</p>
        <Input.Password
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="flex items-center mb-3">
        <p className="min-w-20">Email</p>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="flex items-center mb-3">
        <p className="min-w-20">Phone</p>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div className="flex items-center mb-3">
        <p className="min-w-20">Address</p>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>

      <div className="flex items-center mb-3">
        <p className="min-w-20">Birth date</p>
        <DatePicker
          format="YYYY-MM-DD"
          value={birthDate}
          onChange={setBirthDate}
          className="w-full"
        />
      </div>

      <div className="flex items-center mb-3">
        <p className="min-w-20">Gender</p>
        <Select
          value={gender}
          onChange={setGender}
          style={{ width: "100%" }}
        >
          <Select.Option value="male">Male</Select.Option>
          <Select.Option value="female">Female</Select.Option>
        </Select>
      </div>

      <Select
        mode="multiple"
        placeholder="Select role"
        value={roles}
        onChange={setRoles}
        style={{ width: "100%" }}
      >
        {roleData.map((role) => (
          <Select.Option key={role.value} value={role.value}>
            {role.name}
          </Select.Option>
        ))}
      </Select>
    </Modal>
  );
};
