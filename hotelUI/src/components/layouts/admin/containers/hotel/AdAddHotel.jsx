import React, { useEffect, useState } from "react";
import { Avatar, Input, Modal, Upload } from "antd";
import { hotelServices } from "../../../../../services/hotel";
import { useDispatch, useSelector } from "react-redux";
import { hotelAction } from "../../../../../store/hotel/slice";
import { BiPlusCircle } from "react-icons/bi";

export const AdAddHotel = ({ isModalAddVisible, setIsModalAddVisible }) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [rating, setRating] = useState("");
  const [image, setImage] = useState();
  const [amenities, setAmenities] = useState("");
  const [fileList, setFileList] = useState([]);

  const { hotels } = useSelector((state) => state.hotel);
  const dispatch = useDispatch();

  const handleModalOk = async () => {
    const newHotel = {
      name,
      address,
      phone,
      rating,
      image,
      amenities,
    };

    const file = fileList[0]?.originFileObj; // Kiểm tra file có tồn tại không
    if (!file) {
      console.error("No file uploaded.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newHotel.name); // Sử dụng JSON.stringify
      formData.append("phone", newHotel.phone); // Sử dụng JSON.stringify
      formData.append("address", newHotel.address); // Sử dụng JSON.stringify
      formData.append("rating", newHotel.rating); // Sử dụng JSON.stringify
      formData.append("amenities", newHotel.amenities); // Sử dụng JSON.stringify

      formData.append("file", file);

      const response = await hotelServices.create(formData); // Gửi formData với file
      setIsModalAddVisible(false);
      setName("");
      setAddress("");
      setPhone("");
      setRating("");
      setImage("");
      setAmenities("");

      dispatch(hotelAction.setHotels([...hotels, response.data]));
    } catch (error) {
      console.error("Error adding hotel:", error);
    }
  };

  useEffect(() => {
    console.log(fileList[0]);
  }, [fileList]);

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const uploadButton = (
    <button
      style={{
        border: 0,
        background: "none",
      }}
      type="button"
    >
      <BiPlusCircle />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </button>
  );
  return (
    <Modal
      title="Add Hotel"
      open={isModalAddVisible}
      onCancel={() => setIsModalAddVisible(false)}
      onOk={handleModalOk}
    >
      <div className="flex items-center">
        <p className="min-w-20">Image</p>
        <Upload
          listType="picture-circle"
          fileList={fileList}
          onChange={handleChange}
        >
          {fileList.length >= 8 ? null : uploadButton}
        </Upload>
        {/* <Avatar 
          src={`/image/${image}`}
          onChange={(e) => setImage(e.target.value)}
        /> */}
      </div>
      <div className="flex items-center">
        <p className="min-w-20">Name</p>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="flex items-center">
        <p className="min-w-20">Address</p>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div className="flex items-center">
        <p className="min-w-20">Phone</p>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="flex items-center">
        <p className="min-w-20">Rating</p>
        <Input value={rating} onChange={(e) => setRating(e.target.value)} />
      </div>
      <div className="flex items-center">
        <p className="min-w-20">Amenities</p>
        <Input
          value={amenities}
          onChange={(e) => setAmenities(e.target.value)}
        />
      </div>
    </Modal>
  );
};
