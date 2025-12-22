import React, { useEffect, useMemo, useState } from "react";
import { Avatar, Input, Modal, message, InputNumber, Select } from "antd";
import { hotelServices } from "../../../../../services/hotel";
import { useDispatch } from "react-redux";
import { hotelAction } from "../../../../../store";
import { joinAmenities } from "../AdHotel"; // ✅ chỉnh path đúng nếu bạn đặt khác

const normalizeAmenities = (amenities) => {
  if (!amenities) return [];
  if (Array.isArray(amenities)) {
    return amenities.map((x) => String(x).trim()).filter(Boolean);
  }
  return String(amenities)
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
};

export const AdEditHotel = ({
  isModalEditVisible,
  setIsModalEditVisible,
  itemACtion,
  amenityOptions = [],
}) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [rating, setRating] = useState(null); // number | null
  const [image, setImage] = useState("");

  // ✅ amenities array
  const [amenitiesArr, setAmenitiesArr] = useState([]);

  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (itemACtion) {
      setName(itemACtion.name || "");
      setAddress(itemACtion.address || "");
      setPhone(itemACtion.phone || "");

      const r = itemACtion.rating;
      setRating(r === null || r === undefined || r === "" ? null : Number(r));

      setImage(itemACtion.image || "");

      // ✅ convert string -> array để select tags hiển thị
      setAmenitiesArr(normalizeAmenities(itemACtion.amenities));
    }
  }, [itemACtion]);

  const handleCancel = () => setIsModalEditVisible(false);

  // ✅ chống trùng + trim khi user gõ tag mới
  const onAmenitiesChange = (vals) => {
    const cleaned = (vals || [])
      .map((v) => String(v).trim())
      .filter(Boolean);
    setAmenitiesArr(Array.from(new Set(cleaned)));
  };

  const amenitiesValue = useMemo(() => normalizeAmenities(amenitiesArr), [amenitiesArr]);

  const handleModalOk = async () => {
    if (!itemACtion?.id) return message.error("Missing hotel id.");
    if (!name.trim()) return message.error("Hotel name is required.");
    if (!address.trim()) return message.error("Address is required.");
    if (!phone.trim()) return message.error("Phone is required.");

    if (rating !== null && (!Number.isFinite(rating) || rating < 0 || rating > 5)) {
      message.error("Rating must be a number from 0 to 5.");
      return;
    }

    const updateHotel = {
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      rating: rating ?? "",
      image,
      // ✅ array -> string
      amenities: joinAmenities(amenitiesArr),
    };

    try {
      setSaving(true);
      const response = await hotelServices.edit(itemACtion.id, updateHotel);

      dispatch(hotelAction.updateHotels(response.data));
      message.success("Update hotel successfully!");
      setIsModalEditVisible(false);
    } catch (error) {
      console.error("Error updating hotel:", error);
      message.error(
        error?.response?.data?.message || "Update hotel failed. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Edit Hotel"
      open={isModalEditVisible}
      onCancel={handleCancel}
      onOk={handleModalOk}
      confirmLoading={saving}
      okText="Update"
    >
      <div className="flex items-center mb-2">
        <p className="min-w-20">Image</p>
        <Avatar
          src={
            image ? `${import.meta.env.VITE_IMAGE_URL}/hotels/${image}` : undefined
          }
          alt={`image ${image}`}
        />
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

        {/* ✅ Vừa nhập vừa chọn */}
        <Select
          mode="tags"
          allowClear
          style={{ width: "100%" }}
          placeholder="Select or type amenities (press Enter to add)"
          options={amenityOptions}
          value={amenitiesValue}
          onChange={onAmenitiesChange}
          maxTagCount="responsive"
        />
      </div>
    </Modal>
  );
};
