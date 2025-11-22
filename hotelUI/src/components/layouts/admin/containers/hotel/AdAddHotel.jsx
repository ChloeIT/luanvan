import React, { useEffect, useState } from "react";
import { Input, Modal, Upload } from "antd";
import { hotelServices } from "../../../../../services/hotel";
import { useDispatch, useSelector } from "react-redux";
import { hotelAction } from "../../../../../store/hotel/slice";
import { BiPlusCircle } from "react-icons/bi";

export const AdAddHotel = ({ isModalAddVisible, setIsModalAddVisible }) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [rating, setRating] = useState("");
  const [amenities, setAmenities] = useState("");
  const [fileList, setFileList] = useState([]);

  const { hotels } = useSelector((state) => state.hotel);
  const dispatch = useDispatch();

  const handleModalOk = async () => {
    const file = fileList[0]?.originFileObj;
    if (!file) {
      console.error("No file uploaded.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("address", address);
      formData.append("phone", phone);
      formData.append("rating", rating);
      formData.append("amenities", amenities);
      // key "file" phải trùng với @RequestParam("file") ở BE
      formData.append("file", file);

      const response = await hotelServices.create(formData);

      // cập nhật lại danh sách hotel trên redux
      dispatch(hotelAction.setHotels([...hotels, response.data]));

      // reset form
      setIsModalAddVisible(false);
      setName("");
      setAddress("");
      setPhone("");
      setRating("");
      setAmenities("");
      setFileList([]);
    } catch (error) {
      console.error("Error adding hotel:", error);
    }
  };

  useEffect(() => {
    console.log("Current fileList[0]: ", fileList[0]);
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
      <div className="flex items-center mb-2">
        <p className="min-w-20">Image</p>
        <Upload
          listType="picture-circle"
          fileList={fileList}
          onChange={handleChange}
          beforeUpload={() => false} // không auto upload, chỉ chọn file
          maxCount={1}
        >
          {fileList.length >= 1 ? null : uploadButton}
        </Upload>
      </div>

      <div className="flex items-center mb-2">
        <p className="min-w-20">Name</p>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="flex items-center mb-2">
        <p className="min-w-20">Address</p>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>

      <div className="flex items-center mb-2">
        <p className="min-w-20">Phone</p>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div className="flex items-center mb-2">
        <p className="min-w-20">Rating</p>
        <Input value={rating} onChange={(e) => setRating(e.target.value)} />
      </div>

      <div className="flex items-center mb-2">
        <p className="min-w-20">Amenities</p>
        <Input
          value={amenities}
          onChange={(e) => setAmenities(e.target.value)}
        />
      </div>
    </Modal>
  );
};
