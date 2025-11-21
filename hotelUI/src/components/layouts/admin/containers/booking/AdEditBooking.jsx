import React, { useEffect, useState } from "react";
import { bookingServices } from "../../../../../services/booking";
import { Modal, DatePicker, Input, Select } from "antd";
import dayjs from "dayjs";
import { useDispatch } from "react-redux";
import { bookingAction } from "../../../../../store";

const { Option } = Select;

export const AdEditBooking = ({
  isModalEditVisible,
  setIsModalEditVisible,
  itemACtion,
}) => {
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [payment, setPayment] = useState(null);

  const dispatch = useDispatch();

  useEffect(() => {
    if (itemACtion) {
      setCheckIn(dayjs(itemACtion.checkIn));
      setCheckOut(dayjs(itemACtion.checkOut));
      setTotalPrice(itemACtion.totalPrice);
      setPayment(itemACtion.payment === "true" ? "paid" : "notpaid");
    }
  }, [itemACtion]);

  const handleModalOk = async () => {
    if (!checkIn || !checkOut || !payment) {
      alert("Please fill in all required fields.");
      return;
    }

    const updateBooking = {
      checkIn: checkIn.format("YYYY-MM-DDTHH:mm:ss"),
      checkOut: checkOut.format("YYYY-MM-DDTHH:mm:ss"),
      totalPrice: Number(totalPrice),
      payment: payment === "paid" ? "true" : "false",
    };

    try {
      const response = await bookingServices.edit(itemACtion.id, updateBooking);
      dispatch(bookingAction.updateBookings(response.data));
      setIsModalEditVisible(false);
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
      okText="Save"
      cancelText="Cancel"
      width={520}
    >
      {/* Check In */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Check In</label>
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm"
          value={checkIn}
          onChange={setCheckIn}
          className="w-full"
        />
      </div>

      {/* Check Out */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Check Out</label>
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm"
          value={checkOut}
          onChange={setCheckOut}
          className="w-full"
        />
      </div>

      {/* Total Price */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Total Price</label>
        <Input
          type="number"
          value={totalPrice}
          onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)}
          min={0}
          className="w-full"
        />
      </div>

      {/* Payment */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Payment</label>
        <Select
          value={payment}
          onChange={setPayment}
          className="w-full"
        >
          <Option value="paid">Paid</Option>
          <Option value="notpaid">Not pay yet</Option>
        </Select>
      </div>
    </Modal>
  );
};
