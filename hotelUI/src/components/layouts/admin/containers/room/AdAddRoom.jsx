// src/components/layouts/admin/containers/room/AdAddRoom.jsx
import React, { useEffect, useState } from "react";
import { roomServices } from "../../../../../services";
import { Input, Modal, Upload, Select, InputNumber, message } from "antd";
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
  const dispatch = useDispatch();
  const { rooms } = useSelector((state) => state.room);
  const { hotels } = useSelector((state) => state.hotel);
  const { search } = useLocation();

  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [availability, setAvailability] = useState(true);
  const [hotelId, setHotelId] = useState(null);
  const [fileList, setFileList] = useState([]);

  // DISCOUNT
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountStart, setDiscountStart] = useState("");
  const [discountEnd, setDiscountEnd] = useState("");

  // Nếu đang ở /admin/rooms?hotelId=..., tự set hotelId
  useEffect(() => {
    const idFromQuery = new URLSearchParams(search).get("hotelId");
    if (idFromQuery) setHotelId(Number(idFromQuery));
  }, [search]);

  // reset form mỗi lần mở modal
  useEffect(() => {
    if (!isModalAddVisible) return;

    setSaving(false);
    setName("");
    setPrice("");
    setType("");
    setCapacity(1);
    setAvailability(true);
    setFileList([]);

    setDiscountPercent("");
    setDiscountStart("");
    setDiscountEnd("");
    // hotelId giữ nguyên nếu đang filter theo URL
  }, [isModalAddVisible]);

  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

  const uploadButton = (
    <button style={{ border: 0, background: "none" }} type="button">
      <BiPlusCircle />
      <div style={{ marginTop: 8 }}>Upload</div>
    </button>
  );

  const validate = () => {
    const n = String(name || "").trim();
    const p = price === "" ? 0 : Number(price);
    const dp = discountPercent === "" ? 0 : Number(discountPercent);

    if (!hotelId) {
      message.warning("Please select a hotel.");
      return false;
    }
    if (!n) {
      message.warning("Room name is required.");
      return false;
    }
    if (Number.isNaN(p) || p < 0) {
      message.warning("Price must be a number >= 0.");
      return false;
    }
    if (!type) {
      message.warning("Please select room type.");
      return false;
    }
    if (!fileList[0]?.originFileObj) {
      message.warning("Please upload an image.");
      return false;
    }

    if (Number.isNaN(dp) || dp < 0 || dp > 100) {
      message.warning("Discount % must be between 0 and 100.");
      return false;
    }
    if (dp > 0 && discountStart && discountEnd && discountEnd < discountStart) {
      message.warning("Discount End must be after Start.");
      return false;
    }

    return true;
  };

  const handleModalOk = async () => {
    if (!validate()) return;

    const file = fileList[0]?.originFileObj;
    const dp = discountPercent === "" ? 0 : Number(discountPercent);

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", String(name).trim());
      formData.append("price", String(price === "" ? 0 : Number(price)));
      formData.append("type", type);
      formData.append("capacity", String(capacity || 1));
      formData.append("availability", String(availability)); // "true"/"false"
      formData.append("hotel_id", String(hotelId));
      formData.append("file", file);

      // gửi discount nếu > 0
      if (dp > 0) {
        formData.append("discountPercent", String(dp));
        if (discountStart) formData.append("discountStart", discountStart);
        if (discountEnd) formData.append("discountEnd", discountEnd);
      }

      const res = await roomServices.create(formData);

      // handle response shape linh hoạt
      const createdRoom = res?.data?.data ?? res?.data?.room ?? res?.data;

      if (!createdRoom?.id) {
        console.log("CREATE ROOM RESPONSE (unexpected):", res?.data);
        message.success("Created room ✅ (but response format unexpected — check console)");
      } else {
        dispatch(roomAction.setRooms([...(rooms || []), createdRoom]));
        message.success("Created room successfully ✅");
      }

      setIsModalAddVisible(false);
    } catch (error) {
      console.error("Error adding room:", error);
      message.error(error?.response?.data?.message || "Create room failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Add Room"
      open={isModalAddVisible}
      onCancel={() => setIsModalAddVisible(false)}
      onOk={handleModalOk}
      confirmLoading={saving}
      destroyOnClose
    >
      {/* Image */}
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

      {/* Hotel */}
      <div className="flex items-center mb-2">
        <p className="min-w-20">Hotel</p>
        <Select
          value={hotelId ?? undefined}
          onChange={setHotelId}
          placeholder="Select hotel"
          style={{ width: "100%" }}
          options={(hotels || []).map((h) => ({ value: h.id, label: h.name }))}
        />
      </div>

      {/* Name */}
      <div className="flex items-center mb-2">
        <p className="min-w-20">Name</p>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      {/* Price */}
      <div className="flex items-center mb-2">
        <p className="min-w-20">Price</p>
        <Input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          min={0}
        />
      </div>

      {/* Capacity */}
      <div className="flex items-center mb-2">
        <p className="min-w-20">Capacity</p>
        <InputNumber
          min={1}
          max={10}
          value={capacity}
          onChange={(value) => setCapacity(value || 1)}
        />
      </div>

      {/* Type */}
      <div className="flex items-center mb-2">
        <p className="min-w-20">Type</p>
        <Select
          value={type || undefined}
          onChange={setType}
          placeholder="Select room type"
          style={{ width: "100%" }}
          options={roomTypeOptions}
        />
      </div>

      {/* Availability */}
      <div className="flex items-center mb-2">
        <p className="min-w-20">Availability</p>
        <Select
          value={availability}
          onChange={setAvailability}
          style={{ width: "100%" }}
          options={[
            { value: true, label: "Available" },
            { value: false, label: "Not available" },
          ]}
        />
      </div>

      {/* DISCOUNT */}
      <div className="flex items-center mb-2">
        <p className="min-w-20">Discount %</p>
        <Input
          type="number"
          min={0}
          max={100}
          value={discountPercent}
          onChange={(e) => setDiscountPercent(e.target.value)}
          placeholder="0–100"
        />
      </div>

      <div className="flex items-center mb-2">
        <p className="min-w-20">Start</p>
        <Input
          type="date"
          value={discountStart}
          onChange={(e) => setDiscountStart(e.target.value)}
        />
      </div>

      <div className="flex items-center">
        <p className="min-w-20">End</p>
        <Input
          type="date"
          value={discountEnd}
          onChange={(e) => setDiscountEnd(e.target.value)}
        />
      </div>
    </Modal>
  );
};
