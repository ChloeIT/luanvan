// src/components/layouts/admin/containers/room/AdEditRoom.jsx
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

  // DISCOUNT
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountStart, setDiscountStart] = useState("");
  const [discountEnd, setDiscountEnd] = useState("");

  const dispatch = useDispatch();

  // convert date -> yyyy-MM-dd
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
    setAvailability(itemACtion.availability ?? "");
    setCreate_at(itemACtion.create_at ?? "");
    setUpdate_at(itemACtion.update_at ?? "");

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
    if (!itemACtion) return;

    const updatedRoom = {
      name,
      price: price === "" ? 0 : Number(price),
      capacity: capacity === "" ? 0 : Number(capacity),
      image,
      type,
      availability:
        availability === true ||
        availability === "true" ||
        availability === 1,

      create_at,
      update_at,

      discountPercent:
        discountPercent === "" ? 0 : Number(discountPercent),
      discountStart: discountStart || null, // "yyyy-MM-dd"
      discountEnd: discountEnd || null,
    };

    try {
      const response = await roomServices.edit(itemACtion.id, updatedRoom);
      dispatch(roomAction.updateRooms(response.data));
      setIsModalEditVisible(false);
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
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </div>

      <div className="flex items-center mb-2">
        <p className="min-w-20">Capacity</p>
        <Input
          type="number"
          min={1}
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
      </div>

      <div className="flex items-center mb-2">
        <p className="min-w-20">Type</p>
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
        <p className="min-w-20">Availability</p>
        <Input
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          placeholder="true / false"
        />
      </div>

      <div className="flex items-center mb-2">
        <p className="min-w-20">create_at</p>
        <Input
          value={create_at}
          onChange={(e) => setCreate_at(e.target.value)}
        />
      </div>

      <div className="flex items-center">
        <p className="min-w-20">update_at</p>
        <Input
          value={update_at}
          onChange={(e) => setUpdate_at(e.target.value)}
        />
      </div>
    </Modal>
  );
};
