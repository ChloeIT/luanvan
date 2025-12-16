// src/components/layouts/admin/containers/room/AdDeleteRoom.jsx
import React, { useState } from "react";
import { roomServices } from "../../../../../services";
import { Modal, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { roomAction } from "../../../../../store/room/slice";

export const AdDeleteRoom = ({
  isModalDeleteVisible,
  setIsModalDeleteVisible,
  itemACtion,
}) => {
  const { rooms } = useSelector((state) => state.room);
  const dispatch = useDispatch();

  const [deleting, setDeleting] = useState(false);

  const handleModalOk = async () => {
    if (!itemACtion?.id) {
      message.warning("No room selected.");
      return;
    }

    try {
      setDeleting(true);

      await roomServices.delete(itemACtion.id);

      // update redux list
      const nextRooms = (rooms || []).filter(
        (r) => String(r.id) !== String(itemACtion.id)
      );
      dispatch(roomAction.setRooms(nextRooms));

      message.success("Deleted room successfully ✅");
      setIsModalDeleteVisible(false);
    } catch (error) {
      console.error("Error delete room:", error);
      message.error(error?.response?.data?.message || "Delete failed. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      title="Delete Room"
      open={isModalDeleteVisible}
      onCancel={() => setIsModalDeleteVisible(false)}
      onOk={handleModalOk}
      confirmLoading={deleting}
      okButtonProps={{ danger: true }}
      okText="Delete"
      destroyOnClose
    >
      <div>
        Are you sure you want to delete{" "}
        <b>{itemACtion?.name || `Room #${itemACtion?.id || ""}`}</b>?
        <div style={{ opacity: 0.7, marginTop: 6 }}>
          This action cannot be undone.
        </div>
      </div>
    </Modal>
  );
};
