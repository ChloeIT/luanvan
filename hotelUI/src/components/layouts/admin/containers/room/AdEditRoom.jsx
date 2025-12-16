// src/components/layouts/admin/containers/room/AdEditRoom.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Avatar, Input, Modal, message, Select } from "antd";
import { useDispatch } from "react-redux";
import { roomServices } from "../../../../../services/room";
import { roomAction } from "../../../../../store/room/slice";

export const AdEditRoom = ({
  isModalEditVisible,
  setIsModalEditVisible,
  itemACtion,
}) => {
  const dispatch = useDispatch();

  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "";

  const [saving, setSaving] = useState(false);

  // fields
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [availability, setAvailability] = useState(false);
  const [create_at, setCreate_at] = useState("");
  const [update_at, setUpdate_at] = useState("");

  // DISCOUNT
  const [discountPercent, setDiscountPercent] = useState("");
  const [discountStart, setDiscountStart] = useState("");
  const [discountEnd, setDiscountEnd] = useState("");

  const toDateInputValue = (val) => {
    if (!val) return "";
    if (typeof val === "string") return val.slice(0, 10);
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  };

  const isOpen = isModalEditVisible && !!itemACtion;

  // reset when close
  useEffect(() => {
    if (isModalEditVisible) return;
    setSaving(false);
    setImage("");
    setName("");
    setPrice("");
    setType("");
    setCapacity("");
    setAvailability(false);
    setCreate_at("");
    setUpdate_at("");
    setDiscountPercent("");
    setDiscountStart("");
    setDiscountEnd("");
  }, [isModalEditVisible]);

  // fill form when open / item changes
  useEffect(() => {
    if (!itemACtion) return;

    setName(itemACtion.name ?? "");
    setPrice(itemACtion.price ?? "");
    setImage(itemACtion.image ?? "");
    setCapacity(itemACtion.capacity ?? "");
    setType(itemACtion.type ?? "");
    setAvailability(Boolean(itemACtion.availability));
    setCreate_at(itemACtion.create_at ?? "");
    setUpdate_at(itemACtion.update_at ?? "");

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

  const previewSrc = useMemo(() => {
    if (!image) return "";
    // nếu user nhập full url thì dùng luôn
    if (/^https?:\/\//i.test(image)) return image;
    return `${IMAGE_URL}/rooms/${image}`;
  }, [IMAGE_URL, image]);

  const buildPayload = () => {
    const p = price === "" ? 0 : Number(price);
    const c = capacity === "" ? 0 : Number(capacity);
    const dp = discountPercent === "" ? 0 : Number(discountPercent);

    return {
      name: String(name || "").trim(),
      price: Number.isNaN(p) ? 0 : p,
      capacity: Number.isNaN(c) ? 0 : c,
      image: String(image || "").trim(),
      type: String(type || "").trim(),
      availability: Boolean(availability),

      // nếu BE quản lý 2 field này thì bạn có thể bỏ (tuỳ hệ thống)
      create_at,
      update_at,

      discountPercent: Number.isNaN(dp) ? 0 : dp,
      discountStart: discountStart || null, // "YYYY-MM-DD"
      discountEnd: discountEnd || null,
    };
  };

  const validate = () => {
    const payload = buildPayload();

    if (!payload.name) {
      message.warning("Room name is required.");
      return false;
    }
    if (payload.price < 0) {
      message.warning("Price must be >= 0.");
      return false;
    }
    if (payload.capacity < 1) {
      message.warning("Capacity must be >= 1.");
      return false;
    }
    if (payload.discountPercent < 0 || payload.discountPercent > 100) {
      message.warning("Discount % must be between 0 and 100.");
      return false;
    }

    // nếu có set % > 0 thì khuyên nên có ngày (không bắt buộc)
    if (payload.discountPercent > 0) {
      if (!payload.discountStart || !payload.discountEnd) {
        message.info("Tip: set both Start and End for discount period.");
      }
      if (payload.discountStart && payload.discountEnd) {
        if (payload.discountEnd < payload.discountStart) {
          message.warning("Discount End must be after Start.");
          return false;
        }
      }
    }

    return true;
  };

  const handleModalOk = async () => {
    if (!itemACtion?.id) return;
    if (!validate()) return;

    const payload = buildPayload();

    try {
      setSaving(true);

      const res = await roomServices.edit(itemACtion.id, payload);

      // ✅ handle payload shape linh hoạt: room | {data: room} | {room: room}
      const updatedRoom = res?.data?.data ?? res?.data?.room ?? res?.data;

      if (!updatedRoom?.id) {
        console.log("EDIT ROOM RESPONSE (unexpected):", res?.data);
        message.success("Updated, but response format is unexpected. Check console.");
      } else {
        dispatch(roomAction.updateRooms(updatedRoom));
        message.success("Updated room successfully ✅");
      }

      setIsModalEditVisible(false);
    } catch (err) {
      console.error("Error updating room:", err);
      message.error(err?.response?.data?.message || "Update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Edit Room"
      open={isOpen}
      onCancel={() => setIsModalEditVisible(false)}
      onOk={handleModalOk}
      confirmLoading={saving}
      destroyOnClose
    >
      {/* Image preview */}
      <div className="flex items-center mb-2" style={{ gap: 10 }}>
        <p className="min-w-20">Image</p>
        <Avatar size={44} src={previewSrc} alt={`image ${image}`} />
        <Input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="filename.jpg or full URL"
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

      {/* Availability (đổi sang Select cho đỡ nhập true/false) */}
      <div className="flex items-center mb-2" style={{ gap: 10 }}>
        <p className="min-w-20">Availability</p>
        <Select
          style={{ width: "100%" }}
          value={availability ? "true" : "false"}
          onChange={(v) => setAvailability(v === "true")}
          options={[
            { value: "true", label: "true" },
            { value: "false", label: "false" },
          ]}
        />
      </div>

      {/* Nếu bạn không cần cho admin sửa 2 field này thì có thể xoá luôn */}
      <div className="flex items-center mb-2">
        <p className="min-w-20">create_at</p>
        <Input value={create_at} onChange={(e) => setCreate_at(e.target.value)} />
      </div>

      <div className="flex items-center">
        <p className="min-w-20">update_at</p>
        <Input value={update_at} onChange={(e) => setUpdate_at(e.target.value)} />
      </div>
    </Modal>
  );
};
