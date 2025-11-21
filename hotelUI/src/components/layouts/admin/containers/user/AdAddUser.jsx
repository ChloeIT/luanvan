import { Input, Modal, Select, Upload, DatePicker } from "antd";
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

  const { users } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleModalOk = async () => {
    const file = fileList[0]?.originFileObj;
    if (!file) {
      console.error("No file uploaded.");
      return;
    }

    try {
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

      // ✔ Sửa lỗi roles — gửi dạng List<String>
      roles.forEach((role) => {
        formData.append("roles", role);
      });

      const response = await userServices.create(formData);

      // Ép ảnh load lại ngay
      const newUser = response.data;
      newUser.image = newUser.image + "?v=" + Date.now();

      dispatch(userAction.setUsers([...users, newUser]));
      setIsModalAddVisible(false);
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const uploadButton = (
    <button
      style={{
        border: 0,
        background: "none",
      }}
      type="button"
    >
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
    >
      {/* Image */}
      <div className="flex items-center mb-3">
        <p className="min-w-20">Image</p>
        <Upload
          listType="picture-circle"
          fileList={fileList}
          onChange={handleChange}
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
        <Input value={password} onChange={(e) => setPassword(e.target.value)} />
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

      {/* Birth Date */}
      <div className="flex items-center mb-3">
        <p className="min-w-20">Birth date</p>
        <DatePicker
          format="YYYY-MM-DD"
          value={birthDate}
          onChange={setBirthDate}
          className="w-full"
        />
      </div>

      {/* Gender */}
      <div className="flex items-center mb-3">
        <p className="min-w-20">Gender</p>
        <Select
          placeholder="Select gender"
          value={gender}
          onChange={(value) => setGender(value)}
          style={{ width: "100%" }}
        >
          <Select.Option value="male">Male</Select.Option>
          <Select.Option value="female">Female</Select.Option>
        </Select>
      </div>

      {/* Roles */}
      <div>
        <Select
          placeholder="select role"
          mode="multiple"
          value={roles}
          onChange={(value) => setRoles(value)}
          style={{ width: "100%" }}
        >
          {roleData.map((role) => (
            <Select.Option key={role.value} value={role.value}>
              {role.name}
            </Select.Option>
          ))}
        </Select>
      </div>
    </Modal>
  );
};
