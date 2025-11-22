// src/components/layouts/admin/containers/booking/AdAddBooking.jsx
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Modal, DatePicker, Input, Select, message } from "antd";
import dayjs from "dayjs";
import { bookingServices } from "../../../../../services";

const { Option } = Select;

export const AdAddBooking = ({
  isModalAddVisible,
  setIsModalAddVisible,
  onCreated, // optional: AdBooking truyền vào để update Redux ngay
}) => {
  const { hotels } = useSelector((state) => state.hotel);

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [payment, setPayment] = useState(null);
  const [hotelId, setHotelId] = useState(null);
  const [roomIds, setRoomIds] = useState([]);

  // === Rooms theo hotel đã chọn (lấy từ hotels[...].rooms) ===
  const roomsForSelectedHotel = useMemo(() => {
    if (!hotelId || !hotels?.length) return [];
    const hotel = hotels.find((h) => String(h.id) === String(hotelId));
    return hotel?.rooms || [];
  }, [hotels, hotelId]);

  const resetForm = () => {
    setCheckIn(null);
    setCheckOut(null);
    setTotalPrice(0);
    setPayment(null);
    setHotelId(null);
    setRoomIds([]);
  };

  const handleCancel = () => {
    resetForm();
    setIsModalAddVisible(false);
  };

  const handleOk = async () => {
    if (!hotelId) {
      message.warning("Please choose a hotel.");
      return;
    }
    if (!roomIds.length) {
      message.warning("Please choose at least one room.");
      return;
    }
    if (!checkIn || !checkOut) {
      message.warning("Please choose check-in and check-out time.");
      return;
    }
    if (!payment) {
      message.warning("Please choose payment status.");
      return;
    }

    const payload = {
      checkIn: checkIn.format("YYYY-MM-DDTHH:mm:ss"),
      checkOut: checkOut.format("YYYY-MM-DDTHH:mm:ss"),
      totalPrice: Number(totalPrice) || 0,
      payment: payment === "paid", // boolean
      roomIds, // list id room -> BookingRequest.roomIds
    };

    try {
      const res = await bookingServices.create(payload);
      message.success("Booking created successfully");
      if (onCreated && res?.data) {
        onCreated(res.data); // cho AdBooking cập nhật Redux ngay
      }
      resetForm();
      setIsModalAddVisible(false);
    } catch (err) {
      console.error("Error creating booking:", err);
      message.error("Error creating booking");
    }
  };

  return (
    <Modal
      title="Add Booking"
      open={isModalAddVisible}
      onCancel={handleCancel}
      onOk={handleOk}
      okText="OK"
      cancelText="Cancel"
      width={540}
    >
      {/* Check In */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Check In</label>
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm"
          placeholder="Choose check-in date and time"
          value={checkIn}
          onChange={setCheckIn}
          className="w-full"
          allowClear
        />
      </div>

      {/* Check Out */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Check Out</label>
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm"
          placeholder="Choose check-out date and time"
          value={checkOut}
          onChange={setCheckOut}
          className="w-full"
          allowClear
        />
      </div>

      {/* Total Price */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Total Price</label>
        <Input
          type="number"
          placeholder="0"
          value={totalPrice || ""}
          onChange={(e) =>
            setTotalPrice(e.target.value === "" ? 0 : Number(e.target.value))
          }
          min={0}
        />
      </div>

      {/* Hotel */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Hotel</label>
        <Select
          placeholder="Choose hotel"
          value={hotelId}
          onChange={(val) => {
            setHotelId(val);
            setRoomIds([]); // đổi hotel -> reset room đã chọn
          }}
          className="w-full"
          showSearch
          optionFilterProp="children"
        >
          {(hotels || []).map((h) => (
            <Option key={h.id} value={h.id}>
              {h.name} {`(#${h.id})`}
            </Option>
          ))}
        </Select>
      </div>

      {/* Rooms */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Room(s)</label>
        <Select
          mode="multiple"
          placeholder={
            hotelId ? "Select rooms for this booking" : "Choose hotel first"
          }
          value={roomIds}
          onChange={setRoomIds}
          className="w-full"
          disabled={!hotelId}
        >
          {hotelId && roomsForSelectedHotel.length === 0 && (
            <Option disabled value="__no_room">
              No room for this hotel
            </Option>
          )}

          {roomsForSelectedHotel.map((r) => (
            <Option key={r.id} value={r.id}>
              {r.name} {`(#${r.id})`}
            </Option>
          ))}
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          You can select one or multiple rooms. Each selected room will be
          linked via <code>booking_room</code> table.
        </p>
      </div>

      {/* Payment */}
      <div className="mb-2">
        <label className="block font-medium mb-1">Payment</label>
        <Select
          placeholder="Choose payment status"
          value={payment}
          onChange={setPayment}
          className="w-full"
        >
          <Option value="paid">paid</Option>
          <Option value="notpaid">not yet paid</Option>
        </Select>
      </div>
    </Modal>
  );
};

export default AdAddBooking;
