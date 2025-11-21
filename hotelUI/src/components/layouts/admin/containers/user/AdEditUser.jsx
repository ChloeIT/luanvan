import { Avatar, Input, Modal, DatePicker, Select } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { userServices } from "../../../../../services/user";
import { userAction } from "../../../../../store/user/slice";
import dayjs from "dayjs";

export const AdEditUser = ({
  isModalEditVisible,
  setIsModalEditVisible,
  itemACtion,
}) => {
  const [image, setImage] = useState(null);
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState([]);
  const [birthDate, setBirthDate] = useState(null);
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    if (itemACtion) {
      setFullname(itemACtion.fullname);
      setBirthDate(itemACtion.birthDate ? dayjs(itemACtion.birthDate) : null);
      setEmail(itemACtion.email);
      setUsername(itemACtion.username);
      setAddress(itemACtion.address);
      setGender(itemACtion.gender);
      setImage(itemACtion.image);
      setPhone(itemACtion.phone);
      setRoles(itemACtion.roles || []);
    }
  }, [itemACtion]);

  const handleModalOk = async () => {
    const updatedUser = {
      fullName: fullname,
      phone,
      address,
      image,
      birthDate: birthDate ? birthDate.format("YYYY-MM-DD") : null,
      gender,
    };

    try {
      const response = await userServices.edit(itemACtion.id, updatedUser);
      setIsModalEditVisible(false);
      dispatch(userAction.updateUsers(response.data));
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return (
    <Modal
      title="Edit User"
      open={isModalEditVisible}
      onCancel={() => setIsModalEditVisible(false)}
      onOk={handleModalOk}
    >
      <div className="flex items-center mb-3">
        <p className=" min-w-20">Image</p>
        <Avatar
          src={
            image
              ? `${import.meta.env.VITE_IMAGE_URL}/users/${image}`
              : undefined
          }
          alt={image ? `image ${image}` : "avatar"}
        />
      </div>

      <div className="flex items-center mb-3">
        <p className=" min-w-20">Full name</p>
        <Input value={fullname} onChange={(e) => setFullname(e.target.value)} />
      </div>

      <div className="flex items-center mb-3">
        <p className=" min-w-20">Username</p>
        <Input disabled value={username} />
      </div>

      <div className="flex items-center mb-3">
        <p className=" min-w-20">Email</p>
        <Input disabled value={email} />
      </div>

      <div className="flex items-center mb-3">
        <p className="min-w-20">Roles</p>
        <Input disabled value={roles.map((role) => role.name).join(", ")} />
      </div>

      <div className="flex items-center mb-3">
        <p className=" min-w-20">Phone</p>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div className="flex items-center mb-3">
        <p className=" min-w-20">Address</p>
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

      {/* Gender (Select Male/Female) */}
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
    </Modal>
  );
};
