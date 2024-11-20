import React, { useEffect, useState } from "react";
import { bookingServices } from "../../../../../services/booking";
import { Input, Modal } from "antd";
import { Payment } from "./../../../../../pages/Payment";
import { useDispatch } from "react-redux";
import { bookingAction } from "../../../../../store";

export const AdEditBooking = ({
  isModalEditVisible,
  setIsModalEditVisible,
  itemACtion,
}) => {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [payment, setPayment] = useState("");

  const dispatch = useDispatch();
  useEffect(() => {
    if (itemACtion) {
      setCheckIn(itemACtion.checkIn);
      setCheckOut(itemACtion.checkOut);
      setTotalPrice(itemACtion.totalPrice);
      setPayment(itemACtion.payment);
    }
  }, [itemACtion]);

  const handleModalOk = async () => {
    const updateBooking = {
      checkIn,
      checkOut,
      totalPrice,
      payment,
    };
    console.log(updateBooking);
    try {
      const response =  await bookingServices.edit(itemACtion.id, updateBooking);
      setIsModalEditVisible(false);
      dispatch(bookingAction.updateBookings(response.data));
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  };

  return (
    <Modal
      title="Edit Booking"
      open={isModalEditVisible}
      onCancel={() => setIsModalEditVisible(false)}
      onOk={handleModalOk}
    >
      <div className="flex items-center">
        <p className=" min-w-20"> Check In </p>
        <Input value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
      </div>

      <div className="flex items-center">
        <p className=" min-w-20"> Check Out </p>
        <Input value={checkIn} onChange={(e) => setCheckOut(e.target.value)} />
      </div>

      <div className="flex items-center">
        <p className=" min-w-20"> Total Price </p>
        <Input
          value={totalPrice}
          onChange={(e) => setTotalPrice(e.target.value)}
        />
      </div>

      <div className="flex items-center">
        <p className=" min-w-20">Payment</p>
        <Input value={payment} onChange={(e) => setPayment(e.target.value)} />
      </div>
    </Modal>
  );
};
