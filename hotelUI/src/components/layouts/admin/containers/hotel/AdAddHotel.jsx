import React, { useEffect, useState } from "react";
import { Input, Modal, Upload, message, InputNumber } from "antd";
import { hotelServices } from "../../../../../services/hotel";
import { useDispatch, useSelector } from "react-redux";
import { hotelAction } from "../../../../../store/hotel/slice";
import { BiPlusCircle } from "react-icons/bi";

export const AdAddHotel = ({ isModalAddVisible, setIsModalAddVisible }) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [rating, setRating] = useState(null); // ✅ number | null
  const [amenities, setAmenities] = useState("");
  const [fileList, setFileList] = useState([]);
  const [saving, setSaving] = useState(false);

  const { hotels } = useSelector((state) => state.hotel);
  const dispatch = useDispatch();

  const resetForm = () => {
    setName("");
    setAddress("");
    setPhone("");
    setRating(null);
    setAmenities("");
    setFileList([]);
  };

  const handleCancel = () => {
    setIsModalAddVisible(false);
    resetForm();
  };

  const handleModalOk = async () => {
    const file = fileList[0]?.originFileObj;

    if (!file) return message.error("Please upload hotel image.");
    if (!name.trim()) return message.error("Hotel name is required.");
    if (!address.trim()) return message.error("Address is required.");
    if (!phone.trim()) return message.error("Phone is required.");

    if (rating !== null && (!Number.isFinite(rating) || rating < 0 || rating > 5)) {
      message.error("Rating must be a number from 0 to 5.");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("address", address.trim());
      formData.append("phone", phone.trim());

      // ✅ gửi rating an toàn (BE nhận string)
      formData.append("rating", rating === null ? "" : String(rating));

      formData.append("amenities", amenities.trim());
      formData.append("file", file);

      const response = await hotelServices.create(formData);

      dispatch(hotelAction.setHotels([...(hotels || []), response.data]));

      message.success("Add hotel successfully!");
      setIsModalAddVisible(false);
      resetForm();
    } catch (error) {
      console.error("Error adding hotel:", error);
      message.error(
        error?.response?.data?.message || "Add hotel failed. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    console.log("Current fileList[0]: ", fileList[0]);
  }, [fileList]);

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <BiPlusCircle />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  return (
    <Modal
      title="Add Hotel"
      open={isModalAddVisible}
      onCancel={handleCancel}
      onOk={handleModalOk}
      confirmLoading={saving}
      okText="Save"
    >
      <div className="flex items-center mb-2">
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

      <div className="flex items-center mb-2">
        <p className="min-w-20">Name</p>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="flex items-center mb-2">
        <p className="min-w-20">Address</p>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>

      <div className="flex items-center mb-2">
        <p className="min-w-20">Phone</p>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div className="flex items-center mb-2">
        <p className="min-w-20">Rating</p>
        <InputNumber
          min={0}
          max={5}
          step={0.1}
          value={rating}
          onChange={(value) => setRating(value ?? null)}
          style={{ width: "100%" }}
          placeholder="0 - 5"
          addonAfter="★"
        />
      </div>

      <div className="flex items-center mb-2">
        <p className="min-w-20">Amenities</p>
        <Input value={amenities} onChange={(e) => setAmenities(e.target.value)} />
      </div>
    </Modal>
  );
};
