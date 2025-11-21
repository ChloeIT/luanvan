import { Avatar, Input, Modal, Select, Upload, DatePicker } from "antd";
import { useDispatch, useSelector } from "react-redux";
import React, { useState } from "react";
import { userServices } from "../../../../../services";
import { userAction } from "../../../../../store/user/slice";
import { BiPlusCircle } from "react-icons/bi";
import { roleData } from "../../../../../assets/constants";

export const AdAddUser = ({ isModalAddVisible, setIsModalAddVisible }) => {
  const [image, setImage] = useState("");
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState([]);
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState(null);        // 🔹 NEW
  const [fileList, setFileList] = useState([]);

  const { users } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleModalOk = async () => {
    const newUser = {
      fullname,
      phone,
      email,
      username,
      password,
      gender,
      address,
      roles,
      birthDate,
    };

    const file = fileList[0]?.originFileObj;
    if (!file) {
      console.error("No file uploaded.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("fullName", newUser.fullname);
      formData.append("phone", newUser.phone);
      formData.append("email", newUser.email);
      formData.append("username", newUser.username);
      formData.append("password", newUser.password);
      formData.append("gender", newUser.gender);
      formData.append("address", newUser.address);
      formData.append("file", file);
      formData.append(
        "birthDate",
        newUser.birthDate ? newUser.birthDate.format("YYYY-MM-DD") : ""
      ); // 🔹 chỉ ngày-tháng-năm
      formData.append("roles", JSON.stringify(roles));

      const response = await userServices.create(formData);
      setIsModalAddVisible(false);
      dispatch(userAction.setUsers([...users, response.data]));
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
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </button>
  );

  return (
    <Modal
      title="Add User"
      open={isModalAddVisible}
      onCancel={() => setIsModalAddVisible(false)}
      onOk={handleModalOk}
    >
      <div className="flex items-center">
        <p className=" min-w-20">Image</p>
        <Upload
          listType="picture-circle"
          fileList={fileList}
          onChange={handleChange}
        >
          {fileList.length >= 8 ? null : uploadButton}
        </Upload>
      </div>

      <div className="flex items-center">
        <p className=" min-w-20">Full name </p>
        <Input value={fullname} onChange={(e) => setFullname(e.target.value)} />
      </div>

      <div className="flex items-center">
        <p className=" min-w-20">Username </p>
        <Input value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>

      <div className="flex items-center">
        <p className=" min-w-20">Password </p>
        <Input value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>

      <div className="flex items-center">
        <p className=" min-w-20">Email </p>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="flex items-center">
        <p className=" min-w-20">Phone</p>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div className="flex items-center">
        <p className=" min-w-20">Address </p>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>

      {/* Birth Date giống EditUser */}
      <div className="flex items-center">
        <p className="min-w-20">Birth date</p>
        <DatePicker
          format="YYYY-MM-DD"
          value={birthDate}
          onChange={setBirthDate}
          className="w-full"
        />
      </div>

      <div className="flex items-center">
        <p className="min-w-20">Gender</p>
        <Select
          placeholder="Select gender"
          value={gender}
          onChange={(value) => setGender(value)}
          style={{ width: "100%" }}
        >
          <Select.Option value="Male">Male</Select.Option>
          <Select.Option value="Female">Female</Select.Option>
        </Select>
      </div>


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
