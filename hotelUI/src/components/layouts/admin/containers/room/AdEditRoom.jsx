import React, { useEffect, useState } from "react";
import { roomServices } from "../../../../../services/room";
import { Avatar, Input, Modal } from "antd";
import { useDispatch } from "react-redux";
import { roomAction } from "../../../../../store/room/slice";

export const AdEditRoom = ({
  isModalEditVisible,
  setIsModalEditVisible,
  itemACtion,
}) => {
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [availability, setAvailability] = useState("");
  const [create_at, setCreate_at] = useState("");
  const [update_at, setUpdate_at] = useState("");

  const dispatch = useDispatch();
  useEffect(() => {
    if (itemACtion) {
      setName(itemACtion.name);
      setPrice(itemACtion.price);
      setImage(itemACtion.image);
      setCapacity(itemACtion.capacity);
      setType(itemACtion.type);
      setAvailability(itemACtion.availability);
      setCreate_at(itemACtion.create_at);
      setUpdate_at(itemACtion.update_at);
    }
  }, [itemACtion]);

  const handleModalOk = async () => {
    const updatedRoom = {
      name,
      price,
      capacity,
      image,
      type,
      availability,
      create_at,
      update_at,
    };

    try {
      const response = await roomServices.edit(itemACtion.id, updatedRoom);
      setIsModalEditVisible(false);
      dispatch(roomAction.updateRooms(response.data));
    } catch (error) {
      console.error("Error updating room:", error);
    }
  };

  return (
    <Modal
      title="Edit Room"
      open={isModalEditVisible}
      onCancel={() => setIsModalEditVisible(false)}
      onOk={handleModalOk}
    >
      <div className="flex items-center">
        <p className=" min-w-20">Image</p>
        <Avatar
          src={`${import.meta.env.VITE_IMAGE_URL}/rooms/${image}`} // Đường dẫn đến ảnh
          alt={`image ${image}`}
        />
      </div>
      <div className="flex items-center">
        <p className=" min-w-20"> name </p>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="flex items-center">
        <p className=" min-w-20">price</p>
        <Input value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <div className="flex items-center">
        <p className=" min-w-20">Capacity </p>
        <Input value={capacity} onChange={(e) => setCapacity(e.target.value)} />
      </div>
      <div className="flex items-center">
        <p className=" min-w-20">type </p>
        <Input value={type} onChange={(e) => setType(e.target.value)} />
      </div>

      <div className="flex items-center">
        <p className=" min-w-20">availability </p>
        <Input
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        />
      </div>
      <div className="flex items-center">
        <p className=" min-w-20">create_at</p>
        <Input
          value={create_at}
          onChange={(e) => setCreate_at(e.target.value)}
        />
      </div>
      <div className="flex items-center">
        <p className=" min-w-20">update_at </p>
        <Input
          value={update_at}
          onChange={(e) => setUpdate_at(e.target.value)}
        />
      </div>
    </Modal>
  );
};
