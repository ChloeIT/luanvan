// src/components/layouts/admin/containers/booking/AdAddBooking.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Modal, DatePicker, Input, Select, message } from "antd";
import dayjs from "dayjs";
import { bookingServices } from "../../../../../services";

const { Option } = Select;

export const AdAddBooking = ({
  isModalAddVisible,
  setIsModalAddVisible,
  onCreated, // AdBooking có thể truyền fetchBookings vào
}) => {
  const { hotels } = useSelector((state) => state.hotel);
  const { rooms } = useSelector((state) => state.room);

  const [hotelId, setHotelId] = useState(null);
  const [roomId, setRoomId] = useState(null); // ✅ chỉ 1 room
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [payment, setPayment] = useState(null); // "paid" | "notpaid"

  // Rooms thuộc hotel đã chọn (filter từ slice room trong Redux)
  const roomsForSelectedHotel = useMemo(() => {
    if (!hotelId || !rooms?.length) return [];
    return rooms.filter((r) => String(r.hotel?.id) === String(hotelId));
  }, [rooms, hotelId]);

  // Room đang được chọn
  const selectedRoom = useMemo(
    () => roomsForSelectedHotel.find((r) => r.id === roomId),
    [roomsForSelectedHotel, roomId]
  );

  // 🧮 Auto tính totalPrice mỗi khi đổi ngày hoặc room
  useEffect(() => {
    if (!checkIn || !checkOut || !selectedRoom) {
      setTotalPrice(0);
      return;
    }

    // tính số đêm (bỏ phần giờ)
    const nights = dayjs(checkOut).startOf("day").diff(
      dayjs(checkIn).startOf("day"),
      "day"
    );

    if (nights <= 0) {
      setTotalPrice(0);
      return;
    }

    const pricePerNight = selectedRoom.price || 0;
    setTotalPrice(pricePerNight * nights);
  }, [checkIn, checkOut, selectedRoom]);

  const resetForm = () => {
    setHotelId(null);
    setRoomId(null);
    setCheckIn(null);
    setCheckOut(null);
    setTotalPrice(0);
    setPayment(null);
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
    if (!roomId) {
      message.warning("Please choose a room.");
      return;
    }
    if (!checkIn || !checkOut) {
      message.warning("Please choose check-in and check-out date.");
      return;
    }

    // ✅ Check-out > Check-in (ít nhất 1 ngày)
    if (
      !dayjs(checkOut).startOf("day").isAfter(
        dayjs(checkIn).startOf("day"),
        "day"
      )
    ) {
      message.warning("Check-out must be after check-in (at least 1 day).");
      return;
    }

    if (!payment) {
      message.warning("Please choose payment status.");
      return;
    }

    const payload = {
      checkIn: checkIn.startOf("day").format("YYYY-MM-DDTHH:mm:ss"),
      checkOut: checkOut.startOf("day").format("YYYY-MM-DDTHH:mm:ss"),
      totalPrice: Number(totalPrice) || 0,
      payment: payment === "paid", // boolean
      roomIds: [roomId], // ✅ BE vẫn nhận mảng, nhưng chỉ có 1 room
    };

    try {
      const res = await bookingServices.create(payload);
      message.success("Booking created successfully");

      if (onCreated && res?.data) {
        onCreated(res.data); // thường là fetchBookings()
      }

      resetForm();
      setIsModalAddVisible(false);
    } catch (err) {
      console.error("Error creating booking:", err);
      message.error("Error creating booking");
    }
  };

  // Không cho chọn check-in trước hôm nay
  const disabledCheckInDate = (current) => {
    return current && current.startOf("day").isBefore(dayjs().startOf("day"));
  };

  // Check-out phải > check-in và ≥ hôm nay
  const disabledCheckOutDate = (current) => {
    if (!current) return false;
    const isBeforeToday = current.startOf("day").isBefore(dayjs().startOf("day"));

    if (!checkIn) {
      return isBeforeToday;
    }

    const isNotAfterCheckIn = !current
      .startOf("day")
      .isAfter(checkIn.startOf("day"), "day");

    return isBeforeToday || isNotAfterCheckIn;
  };

  // Khi đổi Check In, nếu Check Out đang <= Check In thì reset Check Out
  const handleChangeCheckIn = (value) => {
    setCheckIn(value);
    if (
      value &&
      checkOut &&
      !checkOut.startOf("day").isAfter(value.startOf("day"), "day")
    ) {
      setCheckOut(null);
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
      {/* Hotel */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Hotel</label>
        <Select
          placeholder="Choose hotel"
          value={hotelId}
          onChange={(val) => {
            setHotelId(val);
            setRoomId(null); // đổi hotel -> reset room
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

      {/* Room (chỉ 1) */}
      <div className="mb-2">
        <label className="block font-medium mb-1">Room</label>
        <Select
          placeholder={
            hotelId ? "Select room for this booking" : "Choose hotel first"
          }
          value={roomId}
          onChange={setRoomId}
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
              {r.name} {`(#${r.id})`} – {r.price}$
            </Option>
          ))}
        </Select>

        {/* 👀 Hiển thị giá room */}
        {selectedRoom && (
          <p className="text-xs text-gray-600 mt-1">
            Price per night:{" "}
            <span className="font-semibold">{selectedRoom.price}$</span>
          </p>
        )}
      </div>

      {/* Check In */}
      <div className="mb-4 mt-3">
        <label className="block font-medium mb-1">Check In</label>
        <DatePicker
          format="YYYY-MM-DD"
          placeholder="Choose check-in date"
          value={checkIn}
          onChange={handleChangeCheckIn}
          className="w-full"
          allowClear
          disabledDate={disabledCheckInDate}
        />
      </div>

      {/* Check Out */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Check Out</label>
        <DatePicker
          format="YYYY-MM-DD"
          placeholder="Choose check-out date"
          value={checkOut}
          onChange={setCheckOut}
          className="w-full"
          allowClear
          disabledDate={disabledCheckOutDate}
        />
      </div>

      {/* Total Price (auto, readonly) */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Total Price</label>
        <Input
          type="number"
          value={totalPrice}
          readOnly
          className="w-full bg-gray-50 cursor-not-allowed"
        />
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
