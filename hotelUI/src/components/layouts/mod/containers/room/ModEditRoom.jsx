// src/components/layouts/mod/containers/room/ModEditRoom.jsx
import React, { useEffect, useState } from "react";
import { Modal, Avatar, Input, message, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { roomServices } from "../../../../../services/room";
import { roomAction } from "../../../../../store/room/slice";

const { Option } = Select;

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
    const [create_at, setCreate_at] = useState("");
    const [update_at, setUpdate_at] = useState("");

    // DISCOUNT
    const [discountPercent, setDiscountPercent] = useState("");
    const [discountStart, setDiscountStart] = useState("");
    const [discountEnd, setDiscountEnd] = useState("");

    const dispatch = useDispatch();
    const { rooms } = useSelector((state) => state.room);

    // helper convert date -> yyyy-MM-dd
    const toDateInputValue = (val) => {
        if (!val) return "";
        if (typeof val === "string") {
            return val.slice(0, 10);
        }
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
        setCreate_at(itemACtion.create_at || "");
        setUpdate_at(itemACtion.update_at || "");

        const rawDiscount =
            itemACtion.discountPercent ??
            itemACtion.discount_percent ??
            itemACtion.discount ??
            "";
        setDiscountPercent(rawDiscount);

        const start =
            itemACtion.discountStart ?? itemACtion.discount_start ?? null;
        const end = itemACtion.discountEnd ?? itemACtion.discount_end ?? null;

        setDiscountStart(toDateInputValue(start));
        setDiscountEnd(toDateInputValue(end));
    }, [itemACtion]);

    const handleModalOk = async () => {
        if (!itemACtion?.id) return;

        const updatedRoom = {
            name,
            price,
            capacity,
            image,
            type,
            availability,
            create_at,
            update_at,
            // discount
            discountPercent:
                discountPercent === "" ? 0 : Number(discountPercent),
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
                        rooms.map((r) => (r.id === updated.id ? updated : r))
                    )
                );
            }

            setIsModalEditVisible(false);
        } catch (error) {
            console.error("Error updating room (MOD):", error);
            message.error("Error updating room");
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
            <div className="flex items-center mb-2">
                <p className=" min-w-20">Image</p>
                <Avatar
                    src={`${import.meta.env.VITE_IMAGE_URL}/rooms/${image}`}
                    alt={`image ${image}`}
                />
            </div>

            <div className="flex items-center mb-2">
                <p className=" min-w-20">Name</p>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="flex items-center mb-2">
                <p className=" min-w-20">Price</p>
                <Input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    type="number"
                />
            </div>

            <div className="flex items-center mb-2">
                <p className=" min-w-20">Capacity</p>
                <Input
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    type="number"
                />
            </div>

            <div className="flex items-center mb-2">
                <p className=" min-w-20">Type</p>
                <Input value={type} onChange={(e) => setType(e.target.value)} />
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
            {/* END DISCOUNT */}

            <div className="flex items-center mb-2">
                <p className=" min-w-20">Availability</p>
                <Select
                    value={availability}
                    onChange={setAvailability}
                    style={{ width: "100%" }}
                >
                    <Option value={true}>Available</Option>
                    <Option value={false}>Not available</Option>
                </Select>
            </div>

            <div className="flex items-center mb-2">
                <p className=" min-w-20">create_at</p>
                <Input
                    value={create_at}
                    onChange={(e) => setCreate_at(e.target.value)}
                />
            </div>

            <div className="flex items-center mb-2">
                <p className=" min-w-20">update_at</p>
                <Input
                    value={update_at}
                    onChange={(e) => setUpdate_at(e.target.value)}
                />
            </div>
        </Modal>
    );
};

export default ModEditRoom;
