import React, { useEffect, useState } from "react";
import { bookingServices } from "../../../../../services";
import { Input, Modal } from "antd";

export const AdAddBooking = ({ isModalAddVisible, setIsModalAddVisible }) => {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [payment, setPayment] = useState("");

  const handleModalOk = async () => {
    const newBooking = {
      checkIn,
      checkOut,
      totalPrice: parseFloat(totalPrice),
      payment,
    };

    try {
      console.log(newBooking);
      await bookingServices.create(newBooking); // Thay đổi từ "edit" thành "add"
      setIsModalAddVisible(false);
    } catch (error) {
      console.error("Error adding booking:", error);
    }
  };

  useEffect(() => {
    console.log(totalPrice);
  }, [totalPrice]);
  return (
    <Modal
      title="Add Booking"
      open={isModalAddVisible}
      onCancel={() => setIsModalAddVisible(false)}
      onOk={handleModalOk}
    >
      <div className="flex items-center">
        <p className="min-w-20">Check In</p>
        <Input value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
      </div>

      <div className="flex items-center">
        <p className="min-w-20">Check Out</p>
        <Input value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
      </div>

      <div className="flex items-center">
        <p className="min-w-20">Total Price</p>
        <Input
          value={totalPrice}
          type="number"
          onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)}
        />
      </div>

      <div className="flex items-center">
        <p className="min-w-20">Payment</p>
        <Input value={payment} onChange={(e) => setPayment(e.target.value)} />
      </div>
    </Modal>
  );
};
