import React, { useEffect, useState } from "react";
import { roomServices } from "../../../../../services";
import { Avatar, Input, Modal, Upload } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { roomAction } from "../../../../../store/room/slice";
import { BiPlusCircle } from "react-icons/bi";

export const AdAddRoom = ({ isModalAddVisible, setIsModalAddVisible }) => {
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [availability, setAvailability] = useState("");
  const [create_at, setCreate_at] = useState("");
  const [update_at, setUpdate_at] = useState("");
  const [fileList, setFileList] = useState([]);

  const { rooms } = useSelector((state) => state.room);
  const dispatch = useDispatch();

  const handleModalOk = async () => {
    const newRoom = {
      name,
      price,
      capacity,
      image,
      type,
      availability,
      create_at,
      update_at,
    };

    const file = fileList[0]?.originFileObj; // Kiểm tra file có tồn tại không
    if (!file) {
      console.error("No file uploaded.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newRoom.name);
      formData.append("price", newRoom.price);
      formData.append("type", newRoom.type);
      formData.append("image", newRoom.image);
      formData.append("availability", newRoom.availability);
      formData.append("capacity", newRoom.capacity);

      formData.append("file", file);

      const response = await roomServices.create(formData);
      setIsModalAddVisible(false);
      setName("");
      setPrice("");
      setType("");
      setImage("");
      setAvailability("");
      setCapacity("");

      console.log(response.data);

      dispatch(roomAction.setRooms([...rooms, response.data]));
    } catch (error) {
      console.error("Error adding room:", error);
    }
  };

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

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
      title="Add Room"
      open={isModalAddVisible}
      onCancel={() => setIsModalAddVisible(false)}
      onOk={handleModalOk}
    >
      <div className="flex items-center">
        <p className=" min-w-20">Image</p>
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
        <p className=" min-w-20">Name</p>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="flex items-center">
        <p className=" min-w-20">Price</p>
        <Input value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <div className="flex items-center">
        <p className=" min-w-20">Capacity</p>
        <Input value={capacity} onChange={(e) => setCapacity(e.target.value)} />
      </div>
      <div className="flex items-center">
        <p className=" min-w-20">Type</p>
        <Input value={type} onChange={(e) => setType(e.target.value)} />
      </div>
      <div className="flex items-center">
        <p className=" min-w-20">Availability</p>
        <Input
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        />
      </div>
      <div className="flex items-center">
        <p className=" min-w-20">Create At</p>
        <Input
          value={create_at}
          onChange={(e) => setCreate_at(e.target.value)}
        />
      </div>
      <div className="flex items-center">
        <p className=" min-w-20">Update At</p>
        <Input
          value={update_at}
          onChange={(e) => setUpdate_at(e.target.value)}
        />
      </div>
    </Modal>
  );
};
