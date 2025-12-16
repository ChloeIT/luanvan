// src/components/layouts/admin/containers/booking/AdDeleteBooking.jsx
import React, { useState } from "react";
import { Modal, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { bookingServices } from "../../../../../services";
import { bookingAction } from "../../../../../store/booking/slice";

export const AdDeleteBooking = ({
  isModalDeleteVisible,
  setIsModalDeleteVisible,
  itemACtion,
}) => {
  const { bookings } = useSelector((state) => state.booking);
  const dispatch = useDispatch();

  const [deleting, setDeleting] = useState(false);

  const handleCancel = () => {
    if (deleting) return;
    setIsModalDeleteVisible(false);
  };

  const handleModalOk = async () => {
    if (!itemACtion?.id) {
      message.warning("Booking not found.");
      return;
    }

    try {
      setDeleting(true);

      await bookingServices.delete(itemACtion.id);

      // update redux list (tối ưu: khỏi fetch lại)
      dispatch(
        bookingAction.setBookings(
          (bookings || []).filter((b) => String(b.id) !== String(itemACtion.id))
        )
      );

      message.success("Booking deleted successfully.");
      setIsModalDeleteVisible(false);
    } catch (error) {
      console.error("Error delete booking:", error);
      message.error("Error deleting booking. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      title="Delete Booking"
      open={isModalDeleteVisible}
      onCancel={handleCancel}
      onOk={handleModalOk}
      okText="Delete"
      cancelText="Cancel"
      okButtonProps={{ danger: true }}
      confirmLoading={deleting}
      destroyOnClose
    >
      <p style={{ marginBottom: 0 }}>
        Are you sure you want to delete this booking{" "}
        <b>#{itemACtion?.id ?? "?"}</b>?
      </p>
    </Modal>
  );
};

export default AdDeleteBooking;
