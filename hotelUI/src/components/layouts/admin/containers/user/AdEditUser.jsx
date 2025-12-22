import { Avatar, Input, Modal, DatePicker, Select, message } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { userServices } from "../../../../../services/user";
import { userAction } from "../../../../../store/user/slice";
import dayjs from "dayjs";

export const AdEditUser = ({
  isModalEditVisible,
  setIsModalEditVisible,
  itemACtion,
}) => {
  const dispatch = useDispatch();

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState(null);
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const normalizeGender = (g) => {
    if (g === null || g === undefined) return "";
    const s = String(g).trim().toLowerCase();
    if (["male", "m", "nam"].includes(s)) return "male";
    if (["female", "f", "nữ", "nu"].includes(s)) return "female";
    return "";
  };

  useEffect(() => {
    if (!isModalEditVisible) return;

    if (!itemACtion) {
      setFullName("");
      setBirthDate(null);
      setAddress("");
      setGender("");
      setPhone("");
      return;
    }

    setFullName(itemACtion.fullName || itemACtion.fullname || "");
    setBirthDate(itemACtion.birthDate ? dayjs(itemACtion.birthDate) : null);
    setAddress(itemACtion.address || "");
    setGender(normalizeGender(itemACtion.gender));
    setPhone(
      itemACtion.phone === null || itemACtion.phone === undefined
        ? ""
        : String(itemACtion.phone)
    );
  }, [itemACtion, isModalEditVisible]);

  const avatarSrc = useMemo(() => {
    if (!itemACtion?.image) return undefined;
    return `${import.meta.env.VITE_IMAGE_URL}/users/${itemACtion.image}`;
  }, [itemACtion?.image]);

  const handleClose = () => {
    if (saving) return;
    setIsModalEditVisible(false);
  };

  const handleModalOk = async () => {
    if (!itemACtion?.id) {
      message.error("Missing user id");
      return;
    }

    try {
      setSaving(true);

      // ✅ name fallback: nếu user chỉ đổi gender thì vẫn gửi kèm name cũ
      const safeName = String(
        fullName || itemACtion.fullName || itemACtion.fullname || ""
      ).trim();

      const updatedUser = {
        fullName: safeName,
        phone: String(phone || "").trim(),
        address: String(address || "").trim(),
        birthDate: birthDate ? birthDate.format("YYYY-MM-DD") : null,
        gender,
      };

      const res = await userServices.edit(itemACtion.id, updatedUser);

      // ✅ normalize response trước khi dispatch (phòng BE trả thiếu)
      const nextName =
        res?.data?.fullName ||
        res?.data?.fullname ||
        updatedUser.fullName ||
        safeName;

      const normalized = {
        ...itemACtion,
        ...res.data,
        id: itemACtion.id,
        fullName: nextName,
        fullname: nextName,
      };

      dispatch(userAction.updateUsers(normalized));

      message.success("User updated successfully");
      setIsModalEditVisible(false);
    } catch (error) {
      console.error("Error updating user:", error);
      message.error(error?.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Edit User"
      open={isModalEditVisible}
      onCancel={handleClose}
      onOk={handleModalOk}
      confirmLoading={saving}
      destroyOnClose
      okText="OK"
      cancelText="Cancel"
    >
      <div className="flex items-center mb-3">
        <p className="min-w-20">Avatar</p>
        <Avatar src={avatarSrc} />
      </div>

      <div className="flex items-center mb-3">
        <p className="min-w-20">Full name</p>
        <Input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter full name"
        />
      </div>

      <div className="flex items-center mb-3">
        <p className="min-w-20">Phone</p>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone"
          inputMode="numeric"
        />
      </div>

      <div className="flex items-center mb-3">
        <p className="min-w-20">Address</p>
        <Input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter address"
        />
      </div>

      <div className="flex items-center mb-3">
        <p className="min-w-20">Birth date</p>
        <DatePicker
          format="YYYY-MM-DD"
          value={birthDate}
          onChange={(d) => setBirthDate(d)}
          className="w-full"
          allowClear
        />
      </div>

      <div className="flex items-center mb-3">
        <p className="min-w-20">Gender</p>
        <Select
          value={gender}
          onChange={setGender}
          style={{ width: "100%" }}
          placeholder="Select gender"
          allowClear
        >
          <Select.Option value="male">Male</Select.Option>
          <Select.Option value="female">Female</Select.Option>
        </Select>
      </div>
    </Modal>
  );
};
