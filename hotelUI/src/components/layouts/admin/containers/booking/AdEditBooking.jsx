// src/components/layouts/admin/containers/booking/AdEditBooking.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Modal, DatePicker, Input, Select, message } from "antd";
import dayjs from "dayjs";
import { bookingServices } from "../../../../../services/booking";

const { Option } = Select;

export const AdEditBooking = ({
  isModalEditVisible,
  setIsModalEditVisible,
  itemACtion,   // booking được chọn
  onUpdated,    // AdBooking truyền fetchBookings vào
}) => {
  const { rooms } = useSelector((state) => state.room);

  const [hotelId, setHotelId] = useState(null); // chỉ để hiển thị, không cho đổi
  const [roomId, setRoomId] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [payment, setPayment] = useState(null); // "paid" | "notpaid"

  // Lấy hotel từ booking (giả định 1 room / booking)
  const hotelFromBooking = useMemo(() => {
    const firstRoom = itemACtion?.rooms?.[0];
    return firstRoom?.hotel || null;
  }, [itemACtion]);

  // Rooms thuộc hotel này
  const roomsForHotel = useMemo(() => {
    if (!hotelFromBooking || !rooms?.length) return [];
    return rooms.filter(
      (r) => String(r.hotel?.id) === String(hotelFromBooking.id)
    );
  }, [rooms, hotelFromBooking]);

  const selectedRoom = useMemo(
    () => roomsForHotel.find((r) => r.id === roomId),
    [roomsForHotel, roomId]
  );

  // Khi mở modal hoặc đổi itemACtion -> fill form
  useEffect(() => {
    if (!itemACtion) return;

    const firstRoom = itemACtion.rooms?.[0];

    setHotelId(firstRoom?.hotel?.id || null);
    setRoomId(firstRoom?.id || null);

    setCheckIn(itemACtion.checkIn ? dayjs(itemACtion.checkIn) : null);
    setCheckOut(itemACtion.checkOut ? dayjs(itemACtion.checkOut) : null);
    setTotalPrice(itemACtion.totalPrice || 0);
    setPayment(itemACtion.payment ? "paid" : "notpaid");
  }, [itemACtion]);

  // 🧮 Auto tính total price
  useEffect(() => {
    if (!checkIn || !checkOut || !selectedRoom) {
      setTotalPrice(0);
      return;
    }

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

  const handleCancel = () => {
    setIsModalEditVisible(false);
  };

  const handleOk = async () => {
    if (!itemACtion?.id) return;

    if (!hotelId) {
      message.warning("Hotel is missing for this booking.");
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
      payment: payment === "paid",
      roomIds: [roomId],
    };

    try {
      await bookingServices.edit(itemACtion.id, payload);
      message.success("Booking updated successfully");

      if (onUpdated) {
        onUpdated(); // thường là fetchBookings()
      }

      setIsModalEditVisible(false);
    } catch (err) {
      console.error("Error updating booking:", err);
      message.error("Error updating booking");
    }
  };

  // Không cho check-in trước hôm nay
  const disabledCheckInDate = (current) => {
    return current && current.startOf("day").isBefore(dayjs().startOf("day"));
  };

  // Check-out > check-in và ≥ hôm nay
  const disabledCheckOutDate = (current) => {
    if (!current) return false;
    const isBeforeToday = current.startOf("day").isBefore(dayjs().startOf("day"));
    if (!checkIn) return isBeforeToday;

    const isNotAfterCheckIn = !current
      .startOf("day")
      .isAfter(checkIn.startOf("day"), "day");

    return isBeforeToday || isNotAfterCheckIn;
  };

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
      title="Edit Booking"
      open={isModalEditVisible}
      onCancel={handleCancel}
      onOk={handleOk}
      okText="Save"
      cancelText="Cancel"
      width={540}
    >
      {/* Hotel (chỉ hiển thị, không cho đổi) */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Hotel</label>
        <Select
          value={hotelFromBooking?.id}
          className="w-full"
          disabled
        >
          {hotelFromBooking && (
            <Option value={hotelFromBooking.id}>
              {hotelFromBooking.name} {`(#${hotelFromBooking.id})`}
            </Option>
          )}
        </Select>
      </div>

      {/* Room (có thể đổi, nhưng chỉ trong hotel hiện tại) */}
      <div className="mb-2">
        <label className="block font-medium mb-1">Room</label>
        <Select
          value={roomId}
          onChange={setRoomId}
          className="w-full"
          disabled={!hotelFromBooking}
        >
          {roomsForHotel.map((r) => (
            <Option key={r.id} value={r.id}>
              {r.name} {`(#${r.id})`} – {r.price}$
            </Option>
          ))}
        </Select>

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
