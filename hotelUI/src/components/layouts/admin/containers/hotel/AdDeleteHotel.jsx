import React, { useState } from "react";
import { hotelServices } from "../../../../../services";
import { Modal, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { hotelAction } from "../../../../../store/hotel/slice";

export const AdDeleteHotel = ({
  isModalDeleteVisible,
  setIsModalDeleteVisible,
  itemACtion,
}) => {
  const { hotels } = useSelector((state) => state.hotel);
  const dispatch = useDispatch();
  const [deleting, setDeleting] = useState(false);

  const handleCancel = () => setIsModalDeleteVisible(false);

  const handleModalOk = async () => {
    if (!itemACtion?.id) {
      message.error("Missing hotel id.");
      return;
    }

    try {
      setDeleting(true);
      await hotelServices.delete(itemACtion.id);

      dispatch(
        hotelAction.setHotels((hotels || []).filter((h) => h.id !== itemACtion.id))
      );

      message.success("Delete hotel successfully!");
      setIsModalDeleteVisible(false);
    } catch (error) {
      console.error("Error delete hotel", error);
      message.error(
        error?.response?.data?.message ||
        "Delete hotel failed. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      title="Delete Hotel"
      open={isModalDeleteVisible}
      onCancel={handleCancel}
      onOk={handleModalOk}
      confirmLoading={deleting}
      okText="Delete"
      okButtonProps={{ danger: true }}
    >
      <div style={{ lineHeight: 1.6 }}>
        Are you sure you want to delete{" "}
        <b>{itemACtion?.name || "this hotel"}</b>?
      </div>
    </Modal>
  );
};
