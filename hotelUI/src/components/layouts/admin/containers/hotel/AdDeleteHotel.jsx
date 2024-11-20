import React from "react";
import { hotelServices } from "../../../../../services";
import { Modal } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { hotelAction } from "../../../../../store/hotel/slice";

export const AdDeleteHotel = ({
  isModalDeleteVisible,
  setIsModalDeleteVisible,
  itemACtion,
}) => {
  const { hotels } = useSelector((state) => state.hotel);
  const dispatch = useDispatch();
  const handleModalOk = async () => {
    try {
      await hotelServices.delete(itemACtion.id);
      setIsModalDeleteVisible(false);
      dispatch(
        hotelAction.setHotels(
          hotels.filter((hotel) => hotel.id != itemACtion.id)
        )
      );
    } catch (error) {
      console.error("Error delete user", error);
    }
  };

  return (
    <Modal
      title="Delete Hotel"
      open={isModalDeleteVisible}
      onCancel={() => setIsModalDeleteVisible(false)}
      onOk={handleModalOk}
    ></Modal>
  );
};
