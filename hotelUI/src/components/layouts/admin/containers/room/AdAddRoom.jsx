// src/components/layouts/admin/containers/room/AdAddRoom.jsx
import React, { useEffect, useState } from "react";
import { roomServices } from "../../../../../services";
import { Input, Modal, Upload, Select, InputNumber } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { roomAction } from "../../../../../store/room/slice";
import { BiPlusCircle } from "react-icons/bi";
import { useLocation } from "react-router-dom";

const roomTypeOptions = [
  { label: "Standard", value: "Standard" },
  { label: "Deluxe", value: "Deluxe" },
  { label: "Suite", value: "Suite" },
  { label: "Superior", value: "Superior" },
  { label: "Luxury", value: "Luxury" },
  { label: "Family", value: "Family" },
  { label: "VIP", value: "VIP" },
  { label: "Budget", value: "Budget" },
  { label: "Economy", value: "Economy" },
  { label: "Compact", value: "Compact" },
  { label: "Duplex", value: "Duplex" },
  { label: "Apartment", value: "Apartment" },
  { label: "Villa", value: "Villa" },
  { label: "Premium", value: "Premium" },
];

export const AdAddRoom = ({ isModalAddVisible, setIsModalAddVisible }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [availability, setAvailability] = useState(true); // true = available
  const [hotelId, setHotelId] = useState(null);
  const [fileList, setFileList] = useState([]);

  const { rooms } = useSelector((state) => state.room);
  const { hotels } = useSelector((state) => state.hotel);
  const dispatch = useDispatch();

  const { search } = useLocation();

  // Nếu đang ở trang /admin/rooms?hotelId=..., tự set hotelId đó luôn
  useEffect(() => {
    const idFromQuery = new URLSearchParams(search).get("hotelId");
    if (idFromQuery) {
      setHotelId(Number(idFromQuery));
    }
  }, [search]);

  const handleModalOk = async () => {
    const file = fileList[0]?.originFileObj;
    if (!file) {
      console.error("No file uploaded.");
      return;
    }
    if (!hotelId) {
      console.error("No hotel selected.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("type", type);
      formData.append("capacity", String(capacity));          // int
      formData.append("availability", String(availability));  // "true"/"false"
      formData.append("hotel_id", String(hotelId));           // ⬅ gửi hotel_id
      formData.append("file", file);

      const response = await roomServices.create(formData);

      // cập nhật redux
      dispatch(roomAction.setRooms([...rooms, response.data]));

      // reset form
      setIsModalAddVisible(false);
      setName("");
      setPrice("");
      setType("");
      setCapacity(1);
      setAvailability(true);
      setHotelId(null);
      setFileList([]);
    } catch (error) {
      console.error("Error adding room:", error);
    }
  };

  useEffect(() => {
    console.log("Current fileList[0]: ", fileList[0]);
  }, [fileList]);

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
      title="Add Room"
      open={isModalAddVisible}
      onCancel={() => setIsModalAddVisible(false)}
      onOk={handleModalOk}
    >
      {/* Image */}
      <div className="flex items-center mb-2">
        <p className=" min-w-20">Image</p>
        <Upload
          listType="picture-circle"
          fileList={fileList}
          onChange={handleChange}
          beforeUpload={() => false} // không auto upload
          maxCount={1}
        >
          {fileList.length >= 1 ? null : uploadButton}
        </Upload>
      </div>

      {/* Hotel */}
      <div className="flex items-center mb-2">
        <p className="min-w-20">Hotel</p>
        <Select
          value={hotelId ?? undefined}
          onChange={setHotelId}
          placeholder="Select hotel"
          style={{ width: "100%" }}
        >
          {(hotels || []).map((h) => (
            <Select.Option key={h.id} value={h.id}>
              {h.name}
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* Name */}
      <div className="flex items-center mb-2">
        <p className=" min-w-20">Name</p>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      {/* Price */}
      <div className="flex items-center mb-2">
        <p className=" min-w-20">Price</p>
        <Input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          min={0}
        />
      </div>

      {/* Capacity */}
      <div className="flex items-center mb-2">
        <p className=" min-w-20">Capacity</p>
        <InputNumber
          min={1}
          max={10}
          value={capacity}
          onChange={(value) => setCapacity(value || 1)}
        />
      </div>

      {/* Type */}
      <div className="flex items-center mb-2">
        <p className=" min-w-20">Type</p>
        <Select
          value={type || undefined}
          onChange={setType}
          placeholder="Select room type"
          style={{ width: "100%" }}
        >
          {roomTypeOptions.map((opt) => (
            <Select.Option key={opt.value} value={opt.value}>
              {opt.label}
            </Select.Option>
          ))}
        </Select>
      </div>

      {/* Availability */}
      <div className="flex items-center mb-2">
        <p className=" min-w-20">Availability</p>
        <Select
          value={availability}
          onChange={setAvailability}
          style={{ width: "100%" }}
        >
          <Select.Option value={true}>Available</Select.Option>
          <Select.Option value={false}>Not available</Select.Option>
        </Select>
      </div>
    </Modal>
  );
};
