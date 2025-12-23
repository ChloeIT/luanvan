// src/components/layouts/mod/containers/room/ModEditRoom.jsx
import React, { useEffect, useState } from "react";
import { Modal, Avatar, Input, message, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { roomServices } from "../../../../../services/room";
import { roomAction } from "../../../../../store/room/slice";

const { Option } = Select;

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

export const ModEditRoom = ({
    isModalEditVisible,
    setIsModalEditVisible,
    itemACtion,
    onUpdated, // callback: ModRooms -> fetchRooms
}) => {
    const [image, setImage] = useState("");
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [type, setType] = useState("");
    const [capacity, setCapacity] = useState("");
    const [availability, setAvailability] = useState(true);

    // DISCOUNT
    const [discountPercent, setDiscountPercent] = useState("");
    const [discountStart, setDiscountStart] = useState("");
    const [discountEnd, setDiscountEnd] = useState("");

    const dispatch = useDispatch();
    const { rooms } = useSelector((state) => state.room);

    // helper convert date -> yyyy-MM-dd
    const toDateInputValue = (val) => {
        if (!val) return "";
        if (typeof val === "string") return val.slice(0, 10);
        const d = new Date(val);
        if (Number.isNaN(d.getTime())) return "";
        return d.toISOString().slice(0, 10);
    };

    useEffect(() => {
        if (!itemACtion) return;

        setName(itemACtion.name ?? "");
        setPrice(itemACtion.price ?? "");
        setImage(itemACtion.image ?? "");
        setCapacity(itemACtion.capacity ?? "");
        setType(itemACtion.type ?? "");
        setAvailability(!!itemACtion.availability);

        const rawDiscount =
            itemACtion.discountPercent ??
            itemACtion.discount_percent ??
            itemACtion.discount ??
            "";
        setDiscountPercent(rawDiscount === null ? "" : String(rawDiscount));

        const start = itemACtion.discountStart ?? itemACtion.discount_start ?? null;
        const end = itemACtion.discountEnd ?? itemACtion.discount_end ?? null;

        setDiscountStart(toDateInputValue(start));
        setDiscountEnd(toDateInputValue(end));
    }, [itemACtion]);

    const handleModalOk = async () => {
        if (!itemACtion?.id) return;

        // validate nhẹ giống style bạn đang dùng
        if (!name.trim()) return message.warning("Please enter room name.");
        if (!price || Number(price) <= 0)
            return message.warning("Please enter a valid price.");
        if (!capacity || Number(capacity) < 1)
            return message.warning("Capacity must be >= 1.");
        if (!type) return message.warning("Please choose room type.");

        const dp = discountPercent === "" ? 0 : Number(discountPercent);
        if (Number.isNaN(dp) || dp < 0 || dp > 100)
            return message.warning("Discount % must be between 0 and 100.");

        if (dp > 0 && discountStart && discountEnd && discountEnd < discountStart)
            return message.warning("Discount End must be after Start.");

        const updatedRoom = {
            name: name.trim(),
            price: Number(price),
            capacity: Number(capacity),
            image: String(image || "").trim(),
            type,
            availability: Boolean(availability),

            // discount
            discountPercent: dp,
            discountStart: discountStart || null,
            discountEnd: discountEnd || null,
        };

        try {
            const res = await roomServices.edit(itemACtion.id, updatedRoom);
            message.success("Room updated successfully");

            if (onUpdated) {
                onUpdated();
            } else if (res?.data) {
                const updated = res.data;
                dispatch(
                    roomAction.setRooms(
                        (rooms || []).map((r) => (r.id === updated.id ? updated : r))
                    )
                );
            }

            setIsModalEditVisible(false);
        } catch (error) {
            console.error("Error updating room (MOD):", error);
            message.error(error?.response?.data?.message || "Error updating room");
        }
    };

    return (
        <Modal
            title="Edit Room"
            open={isModalEditVisible}
            onCancel={() => setIsModalEditVisible(false)}
            onOk={handleModalOk}
            okText="Save"
            cancelText="Cancel"
        >
            {/* ✅ GIỮ NGUYÊN cấu trúc dòng Image như modal cũ */}
            <div className="flex items-center mb-2">
                <p className="min-w-20">Image</p>
                <Avatar
                    src={`${import.meta.env.VITE_IMAGE_URL}/rooms/${image}`}
                    alt={`image ${image}`}
                />
            </div>

            <div className="flex items-center mb-2">
                <p className="min-w-20">Name</p>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="flex items-center mb-2">
                <p className="min-w-20">Price</p>
                <Input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    type="number"
                />
            </div>

            <div className="flex items-center mb-2">
                <p className="min-w-20">Capacity</p>
                <Input
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    type="number"
                />
            </div>

            {/* ✅ Type giống Add: Select preset — giữ nguyên cấu trúc dòng */}
            <div className="flex items-center mb-2">
                <p className="min-w-20">Type</p>
                <Select
                    value={type || undefined}
                    onChange={setType}
                    placeholder="Select room type"
                    style={{ width: "100%" }}
                >
                    {roomTypeOptions.map((opt) => (
                        <Option key={opt.value} value={opt.value}>
                            {opt.label}
                        </Option>
                    ))}
                </Select>
            </div>

            {/* DISCOUNT */}
            <div className="flex items-center mb-2">
                <p className="min-w-20">Discount %</p>
                <Input
                    type="number"
                    min={0}
                    max={100}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    placeholder="0–100"
                />
            </div>

            <div className="flex items-center mb-2">
                <p className="min-w-20">Start</p>
                <Input
                    type="date"
                    value={discountStart}
                    onChange={(e) => setDiscountStart(e.target.value)}
                />
            </div>

            <div className="flex items-center mb-2">
                <p className="min-w-20">End</p>
                <Input
                    type="date"
                    value={discountEnd}
                    onChange={(e) => setDiscountEnd(e.target.value)}
                />
            </div>

            <div className="flex items-center mb-2">
                <p className="min-w-20">Availability</p>
                <Select
                    value={availability}
                    onChange={setAvailability}
                    style={{ width: "100%" }}
                >
                    <Option value={true}>Available</Option>
                    <Option value={false}>Not available</Option>
                </Select>
            </div>

            {/* ✅ ĐÃ XOÁ HẲN create_at + update_at */}
        </Modal>
    );
};

export default ModEditRoom;
