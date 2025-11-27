// src/components/layouts/mod/containers/room/ModAddRoom.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Upload, Select, Input, InputNumber, message } from "antd";
import { useSelector } from "react-redux";
import { BiPlusCircle } from "react-icons/bi";
import { roomServices } from "../../../../../services";

const roomTypeOptions = [
    { label: "Standard", value: "Standard" },
    { label: "Deluxe", value: "Deluxe" },
    { label: "Suite", value: "Suite" },
    { label: "Superior", value: "Superior" },
    { label: "Luxury", value: "Luxury" },
    { label: "Family", value: "Family" },
    { label: "VIP", value: "VIP" },
    { label: "Budget", value: "Budget" },
    { label: "Economy", value: "Economy" },
    { label: "Compact", value: "Compact" },
    { label: "Duplex", value: "Duplex" },
    { label: "Apartment", value: "Apartment" },
    { label: "Villa", value: "Villa" },
    { label: "Premium", value: "Premium" },
];

export const ModAddRoom = ({
    isModalAddVisible,
    setIsModalAddVisible,
    onCreated, // callback: ModRooms -> fetchRooms
}) => {
    const { hotels } = useSelector((state) => state.hotel);
    const { user } = useSelector((state) => state.auth);

    // chỉ hotel thuộc MOD
    const myHotels = useMemo(() => {
        if (!hotels || !user) return [];
        return hotels.filter((h) => h.ownerId === user.id);
    }, [hotels, user]);

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [type, setType] = useState("");
    const [capacity, setCapacity] = useState(1);
    const [availability, setAvailability] = useState(true);
    const [hotelId, setHotelId] = useState(null);
    const [fileList, setFileList] = useState([]);

    // Nếu MOD chỉ có 1 hotel -> auto chọn
    useEffect(() => {
        if (myHotels.length === 1 && !hotelId) {
            setHotelId(myHotels[0].id);
        }
    }, [myHotels, hotelId]);

    const resetForm = () => {
        setName("");
        setPrice("");
        setType("");
        setCapacity(1);
        setAvailability(true);
        // giữ hotelId cũng được, đỡ phải chọn lại
        setFileList([]);
    };

    const handleModalOk = async () => {
        const file = fileList[0]?.originFileObj;
        if (!file) {
            message.warning("Please upload an image.");
            return;
        }
        if (!hotelId) {
            message.warning("Please choose a hotel.");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("price", price);
            formData.append("type", type);
            formData.append("capacity", String(capacity));
            formData.append("availability", String(availability));
            formData.append("hotel_id", String(hotelId));
            formData.append("file", file);

            const res = await roomServices.create(formData);
            message.success("Room created successfully");

            if (onCreated) {
                onCreated(res?.data);
            }

            resetForm();
            setIsModalAddVisible(false);
        } catch (error) {
            console.error("Error adding room (MOD):", error);
            message.error("Error adding room");
        }
    };

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
            okText="OK"
            cancelText="Cancel"
        >
            {/* Image */}
            <div className="flex items-center mb-2">
                <p className=" min-w-20">Image</p>
                <Upload
                    listType="picture-circle"
                    fileList={fileList}
                    onChange={handleChange}
                    beforeUpload={() => false}
                    maxCount={1}
                >
                    {fileList.length >= 1 ? null : uploadButton}
                </Upload>
            </div>

            {/* Hotel (chỉ hotel của MOD) */}
            <div className="flex items-center mb-2">
                <p className="min-w-20">Hotel</p>
                <Select
                    value={hotelId ?? undefined}
                    onChange={setHotelId}
                    placeholder="Select hotel"
                    style={{ width: "100%" }}
                >
                    {myHotels.map((h) => (
                        <Select.Option key={h.id} value={h.id}>
                            {h.name}
                        </Select.Option>
                    ))}
                </Select>
            </div>

            {/* Name */}
            <div className="flex items-center mb-2">
                <p className=" min-w-20">Name</p>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            {/* Price */}
            <div className="flex items-center mb-2">
                <p className=" min-w-20">Price</p>
                <Input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    type="number"
                    min={0}
                />
            </div>

            {/* Capacity */}
            <div className="flex items-center mb-2">
                <p className=" min-w-20">Capacity</p>
                <InputNumber
                    min={1}
                    max={10}
                    value={capacity}
                    onChange={(value) => setCapacity(value || 1)}
                />
            </div>

            {/* Type */}
            <div className="flex items-center mb-2">
                <p className=" min-w-20">Type</p>
                <Select
                    value={type || undefined}
                    onChange={setType}
                    placeholder="Select room type"
                    style={{ width: "100%" }}
                >
                    {roomTypeOptions.map((opt) => (
                        <Select.Option key={opt.value} value={opt.value}>
                            {opt.label}
                        </Select.Option>
                    ))}
                </Select>
            </div>

            {/* Availability */}
            <div className="flex items-center mb-2">
                <p className=" min-w-20">Availability</p>
                <Select
                    value={availability}
                    onChange={setAvailability}
                    style={{ width: "100%" }}
                >
                    <Select.Option value={true}>Available</Select.Option>
                    <Select.Option value={false}>Not available</Select.Option>
                </Select>
            </div>
        </Modal>
    );
};

export default ModAddRoom;
