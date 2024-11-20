import React from "react";
import { roomServices } from "../../../../../services";
import { Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { roomAction } from "../../../../../store/room/slice";

export const AdDeleteRoom = ({
  isModalDeleteVisible,
  setIsModalDeleteVisible,
  itemACtion,
}) => {
  const { rooms } = useSelector((state) => state.room);
  const dispatch = useDispatch();
  const handleModalOk = async () => {
    try {
      await roomServices.delete(itemACtion.id);
      setIsModalDeleteVisible(false);
      dispatch(
        roomAction.setRooms(rooms.filter((room) => room.id != itemACtion.id))
      );
    } catch (error) {
      console.error("Error delete user", error);
    }
  };
  return (
    <Modal
      title="Delete Room"
      open={isModalDeleteVisible}
      onCancel={() => setIsModalDeleteVisible(false)}
      onOk={handleModalOk}
    ></Modal>
  );
};
