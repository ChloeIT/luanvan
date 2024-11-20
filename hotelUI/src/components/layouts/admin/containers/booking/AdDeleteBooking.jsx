import React from "react";
import { bookingServices } from "../../../../../services";
import { Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { bookingAction } from "../../../../../store/booking/slice";

export const AdDeleteBooking = ({
  isModalDeleteVisible,
  setIsModalDeleteVisible,
  itemACtion,
}) => {
  const { bookings } = useSelector((state) => state.booking);
  const dispatch = useDispatch();
  const handleModalOk = async () => {
    try {
      await bookingServices.delete(itemACtion.id);
      setIsModalDeleteVisible(false);
      dispatch(
        bookingAction.setBookings(
          bookings.filter((booking) => booking.id != itemACtion.id)
        )
      );
    } catch (error) {
      console.error("Error delete user", error);
    }
  };

  return (
    <Modal
      title="Delete Booking"
      open={isModalDeleteVisible}
      onCancel={() => setIsModalDeleteVisible(false)}
      onOk={handleModalOk}
    ></Modal>
  );
};
