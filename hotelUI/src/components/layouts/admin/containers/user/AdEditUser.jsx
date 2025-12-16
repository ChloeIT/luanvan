import { Avatar, Input, Modal, DatePicker, Select, message } from "antd";
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
  const [fullname, setFullname] = useState("");
  const [birthDate, setBirthDate] = useState(null);
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (itemACtion) {
      setFullname(itemACtion.fullname);
      setBirthDate(itemACtion.birthDate ? dayjs(itemACtion.birthDate) : null);
      setAddress(itemACtion.address);
      setGender(itemACtion.gender);
      setPhone(itemACtion.phone);
    }
  }, [itemACtion]);

  const handleModalOk = async () => {
    try {
      setSaving(true);

      const updatedUser = {
        fullName: fullname,
        phone,
        address,
        birthDate: birthDate ? birthDate.format("YYYY-MM-DD") : null,
        gender,
      };

      const response = await userServices.edit(itemACtion.id, updatedUser);
      dispatch(userAction.updateUsers(response.data));

      message.success("User updated successfully");
      setIsModalEditVisible(false);
    } catch (error) {
      console.error("Error updating user:", error);
      message.error(
        error?.response?.data?.message || "Failed to update user"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Edit User"
      open={isModalEditVisible}
      onCancel={() => setIsModalEditVisible(false)}
      onOk={handleModalOk}
      confirmLoading={saving}
    >
      <div className="flex items-center mb-3">
        <p className="min-w-20">Avatar</p>
        <Avatar
          src={
            itemACtion?.image
              ? `${import.meta.env.VITE_IMAGE_URL}/users/${itemACtion.image}`
              : undefined
          }
        />
      </div>

      <div className="flex items-center mb-3">
        <p className="min-w-20">Full name</p>
        <Input value={fullname} onChange={(e) => setFullname(e.target.value)} />
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
    </Modal>
  );
};
