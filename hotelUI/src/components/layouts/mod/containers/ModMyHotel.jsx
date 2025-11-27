// src/components/layouts/mod/containers/ModMyHotel.jsx
import React, { useMemo, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Form, Input, InputNumber, Button, message } from "antd";
import { Link } from "react-router-dom";
import { authServices } from "../../../../services/auth";

// ICONS
import { FaSlidersH, FaCrown } from "react-icons/fa";

const { TextArea } = Input;

/* ========= ENV & HELPERS ========= */

// VITE_IMAGE_URL = http://localhost:8080/images
const RAW_IMAGE_URL = (import.meta.env.VITE_IMAGE_URL || "").replace(/\/+$/, "");

// => http://localhost:8080/images/hotels/hotel10.jpg
const buildHotelImageUrl = (fileName) =>
    fileName ? `${RAW_IMAGE_URL}/hotels/${fileName}` : "";

// VITE_HOTEL_API = http://localhost:8080
const RAW_API_URL = (import.meta.env.VITE_HOTEL_API || "").replace(/\/+$/, "");

// Chuẩn hoá base /api/hotel
const HOTEL_API_BASE = RAW_API_URL ? `${RAW_API_URL}/api/hotel` : "/api/hotel";

/* ========= COMPONENT ========= */

export const ModMyHotel = () => {
    const { hotels, loading } = useSelector((s) => s.hotel);
    const { user } = useSelector((s) => s.auth);

    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);

    // hotel lấy từ Redux (store)
    const storeHotel = useMemo(() => {
        if (!user || !hotels) return null;
        return hotels.find((h) => h.ownerId === user.id) || null;
    }, [hotels, user]);

    // hotel dùng để hiển thị UI (cho phép update ngay sau khi save)
    const [hotelView, setHotelView] = useState(null);

    // Sync từ storeHotel -> hotelView + form
    useEffect(() => {
        if (storeHotel) {
            setHotelView((prev) => {
                if (prev && prev.id === storeHotel.id) {
                    // merge lại nếu cùng hotel
                    return { ...prev, ...storeHotel };
                }
                return storeHotel;
            });

            form.setFieldsValue({
                name: storeHotel.name,
                address: storeHotel.address,
                phone: storeHotel.phone,
                rating: storeHotel.rating,
                amenities: storeHotel.amenities,
            });
        }
    }, [storeHotel, form]);

    const handleSubmit = async (values) => {
        if (!hotelView) return;

        setSaving(true);
        try {
            const headers = {
                "Content-Type": "application/json",
                ...(authServices.authHeader ? authServices.authHeader() : {}),
            };

            const res = await fetch(`${HOTEL_API_BASE}/edit/${hotelView.id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify({
                    ...hotelView,
                    ...values,
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `HTTP ${res.status}`);
            }

            // ✅ Cập nhật lại UI bên trái ngay lập tức
            setHotelView((prev) => (prev ? { ...prev, ...values } : prev));

            message.success("Hotel information updated successfully");
        } catch (err) {
            console.error("Update hotel failed:", err);
            message.error("Failed to update hotel. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    // Loading
    if (loading && !hotelView) {
        return (
            <div className="p-4">
                <p className="text-sm text-gray-600">Loading your hotel...</p>
            </div>
        );
    }

    // Không có hotel nào thuộc MOD
    if (!hotelView) {
        return (
            <div className="p-6">
                <h2
                    className="text-xl font-bold mb-2"
                    style={{ color: "var(--text)" }}
                >
                    My Hotel
                </h2>
                <p className="text-sm mb-3" style={{ color: "var(--muted)" }}>
                    You are currently not set as owner of any hotel.
                </p>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                    Please contact an administrator to assign a hotel to your account.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-4 p-4 items-stretch">
            {/* LEFT: Hotel preview card */}
            <div className="lg:w-3/5">
                <div className="rounded-2xl themed-card shadow h-full flex flex-col overflow-hidden">
                    {/* Ảnh – hạ nhẹ chiều cao để giảm cuộn */}
                    <div className="relative w-full h-[310px] md:h-[330px] bg-black/5">
                        <img
                            src={buildHotelImageUrl(hotelView.image)}
                            alt={hotelView.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src = "/hotel-logo.png"; // fallback
                            }}
                        />
                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                            <FaCrown className="text-yellow-300 text-sm" />
                            <span className="opacity-90">Owner:</span>
                            <span className="font-semibold">
                                {user?.fullName || user?.username}
                            </span>
                        </div>
                    </div>

                    {/* Nội dung */}
                    <div className="p-4 pt-3 flex flex-col space-y-3">
                        {/* Hotel name + address */}
                        <div>
                            <h2 className="flex items-center gap-3">
                                {/* Line highlight */}
                                <span className="block w-1.5 h-6 rounded-full bg-[var(--primary)] shadow-sm" />

                                {/* Name với glow nhẹ */}
                                <span
                                    className="text-[26px] font-extrabold leading-tight"
                                    style={{
                                        color: "var(--text)",
                                        textShadow: "0 1px 2px rgba(0,0,0,0.22)",
                                    }}
                                >
                                    {hotelView.name}
                                </span>
                            </h2>

                            <p className="text-xs mt-1 opacity-80">{hotelView.address}</p>
                        </div>

                        {/* Info block – phóng to nhẹ & cân khoảng cách */}
                        <div className="space-y-2 text-[15px]">
                            <div className="flex">
                                <span className="w-28 font-semibold">Phone:</span>
                                <span className="flex-1">{hotelView.phone || "Not set"}</span>
                            </div>

                            <div className="flex">
                                <span className="w-28 font-semibold">Rating:</span>
                                <span className="flex-1">{hotelView.rating || "N/A"}</span>
                            </div>

                            <div className="flex">
                                <span className="w-28 font-semibold">Amenities:</span>
                                <span className="flex-1">
                                    {hotelView.amenities || "Not set"}
                                </span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-1 flex flex-wrap gap-2">
                            <Link
                                to={`/hotel/${hotelView.id}`}
                                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white/80 hover:bg-white shadow-sm"
                            >
                                View public page ↗
                            </Link>
                            <Link
                                to="/moderator/rooms"
                                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--primary)] text-white hover:brightness-105 shadow-sm"
                            >
                                Manage rooms
                            </Link>
                            <Link
                                to="/moderator/bookings"
                                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-300 hover:bg-yellow-200 shadow-sm"
                            >
                                View bookings
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: Config form */}
            <div className="lg:w-2/5">
                <div className="rounded-2xl themed-card shadow p-4 h-full flex flex-col">
                    {/* Header: icon + title, khoảng cách đều với form */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/70 shadow-sm">
                            <FaSlidersH className="text-[var(--primary)]" size={20} />
                        </div>

                        <h2
                            className="text-xl font-extrabold leading-none"
                            style={{ color: "var(--text)" }}
                        >
                            Configure My Hotel
                        </h2>
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        autoComplete="off"
                        className="flex flex-col flex-1"
                    >
                        <Form.Item
                            label="Hotel name"
                            name="name"
                            rules={[{ required: true, message: "Please enter hotel name" }]}
                            className="mb-3"
                        >
                            <Input size="small" placeholder="Hotel name" />
                        </Form.Item>

                        <Form.Item
                            label="Address"
                            name="address"
                            rules={[{ required: true, message: "Please enter address" }]}
                            className="mb-3"
                        >
                            <Input size="small" placeholder="Address" />
                        </Form.Item>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Form.Item
                                label="Phone"
                                name="phone"
                                rules={[{ required: true, message: "Please enter phone" }]}
                                className="mb-3"
                            >
                                <Input size="small" placeholder="Phone number" />
                            </Form.Item>

                            <Form.Item label="Rating" name="rating" className="mb-3">
                                <InputNumber
                                    min={0}
                                    max={5}
                                    step={0.1}
                                    style={{ width: "100%" }}
                                    size="small"
                                    placeholder="0 - 5"
                                />
                            </Form.Item>
                        </div>

                        <Form.Item label="Amenities" name="amenities" className="mb-3">
                            <TextArea rows={3} placeholder="Free WiFi, Pool, Parking..." />
                        </Form.Item>

                        <div className="mt-auto pt-3 flex items-center justify-between gap-3 border-t border-white/40">
                            <span className="text-[11px]" style={{ color: "var(--muted)" }}>
                                Changes will apply to both public page and dashboard stats.
                            </span>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={saving}
                                className="px-4"
                                size="small"
                            >
                                Save changes
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default ModMyHotel;
