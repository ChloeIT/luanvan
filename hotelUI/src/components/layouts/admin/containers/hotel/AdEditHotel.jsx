import React, { useEffect, useState } from "react";
import { Avatar, Image, Input, Modal } from "antd";
import { hotelServices } from "../../../../../services/hotel";
import { useDispatch } from "react-redux";
import { hotelAction } from "../../../../../store";

export const AdEditHotel = ({
  isModalEditVisible,
  setIsModalEditVisible,
  itemACtion,
}) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [rating, setRating] = useState("");
  const [image, setImage] = useState("");
  const [amenities, setAmenities] = useState("");

  const dispatch = useDispatch();
  useEffect(() => {
    if (itemACtion) {
      setName(itemACtion.name);
      setAddress(itemACtion.address);
      setPhone(itemACtion.phone);
      setRating(itemACtion.rating);
      setImage(itemACtion.image);
      setAmenities(itemACtion.amenities);
    }
  }, [itemACtion]);

  const handleModalOk = async () => {
    const updateHotel = {
      name,
      address,
      phone,
      rating,
      image,
      amenities
    };

    try {
      const response = await hotelServices.edit(itemACtion.id, updateHotel);
      setIsModalEditVisible(false);
      dispatch(hotelAction.updateHotels(response.data));
    } catch (error) {
      console.error("Error updating hotel:", error);
    }
  };

  return (
    <Modal
      title="Edit Hotel"
      open={isModalEditVisible}
      onCancel={() => setIsModalEditVisible(false)}
      onOk={handleModalOk}
    >
      <div className="flex items-center">
        <p className=" min-w-20">Image</p>
        <Avatar
          src={`${import.meta.env.VITE_IMAGE_URL}/hotels/${image}`} // Đường dẫn đến ảnh
          alt={`image ${image}`}
        />
      </div>
      <div className="flex items-center">
        <p className=" min-w-20">Name </p>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="flex items-center">
        <p className=" min-w-20"> Address </p>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div className="flex items-center">
        <p className=" min-w-20"> Phone </p>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div className="flex items-center">
        <p className=" min-w-20"> Rating</p>
        <Input value={rating} onChange={(e) => setRating(e.target.value)} />
      </div>
      <div className="flex items-center">
        <p className=" min-w-20"> Amenities </p>
        <Input
          value={amenities}
          onChange={(e) => setAmenities(e.target.value)}
        />
      </div>
    </Modal>
  );

};
