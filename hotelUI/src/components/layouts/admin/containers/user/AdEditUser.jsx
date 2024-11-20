import { Avatar, Input, Modal, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { userServices } from "../../../../../services/user";
import { userAction } from "../../../../../store/user/slice";

export const AdEditUser = ({
  isModalEditVisible,
  setIsModalEditVisible,
  itemACtion,
}) => {
  const [image, setImage] = useState("");
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [roles, setRoles] = useState([]);
  const [birthDate, setBirthDate] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");

  const dispatch = useDispatch();
  useEffect(() => {
    if (itemACtion) {
      setFullname(itemACtion.fullname);
      setBirthDate(itemACtion.birthDate);
      setEmail(itemACtion.email);
      setUsername(itemACtion.username);
      setAddress(itemACtion.address);
      setGender(itemACtion.gender);
      setImage(itemACtion.image);
      setPhone(itemACtion.phone);
      setRoles(itemACtion.roles);
    }
  }, [itemACtion]);

  const handleModalOk = async () => {
    const updatedUser = {
      fullName: fullname,
      phone,
      address,
      image,
      birthDate,
      gender,
    };

    try {
      const response =  await userServices.edit(itemACtion.id, updatedUser);
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
      <div className="flex items-center">
        <p className=" min-w-20">Image</p>
        <Avatar
          src={`${import.meta.env.VITE_IMAGE_URL}/users/${image}`} // Đường dẫn đến ảnh
          alt={`image ${image}`}
        />
      </div>
      <div className="flex items-center">
        <p className=" min-w-20">Full name </p>
        <Input value={fullname} onChange={(e) => setFullname(e.target.value)} />
      </div>
      <div className="flex items-center">
        <p className=" min-w-20">Username </p>
        <Input
          disabled
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="flex items-center">
        <p className=" min-w-20">Email </p>
        <Input
          disabled
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="flex items-center">
        <p className="min-w-20">Roles </p>
        <Input
          disabled
          value={roles.map((role) => role.name).join(", ")} // Map and join as a string
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex items-center">
        <p className=" min-w-20">Phone</p>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="flex items-center">
        <p className=" min-w-20">Address </p>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div className="flex items-center">
        <p className=" min-w-20">Birth date</p>
        <Input
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
        />
      </div>
      <div className="flex items-center">
        <p className=" min-w-20">Gender </p>
        <Input value={gender} onChange={(e) => setGender(e.target.value)} />
      </div>
    </Modal>
  );
};
