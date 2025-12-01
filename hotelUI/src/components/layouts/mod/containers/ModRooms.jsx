// src/components/layouts/mod/containers/ModRooms.jsx
import React, {
    useMemo,
    useState,
    useCallback,
    useEffect,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { Input, Select, Button, Tag } from "antd";
import { MdOutlineBedroomParent } from "react-icons/md";

import { roomServices } from "../../../../services";
import { roomAction } from "../../../../store";

// Mod modals
import { ModAddRoom } from "./room/ModAddRoom";
import { ModEditRoom } from "./room/ModEditRoom";
import { ModDeleteRoom } from "./room/ModDeleteRoom";

const { Search } = Input;

// ===== ENV & helpers =====
const RAW_IMAGE_URL = (import.meta.env.VITE_IMAGE_URL || "").replace(/\/+$/, "");
const buildRoomImageUrl = (fileName, attempt = 0) =>
    fileName
        ? `${RAW_IMAGE_URL}/rooms/${fileName}${attempt ? `?v=${attempt}` : ""}`
        : "";

/** Ảnh room với retry nhẹ khi lần đầu 404 (file chưa sẵn sàng) */
const RoomImage = ({ fileName, alt }) => {
    const [attempt, setAttempt] = useState(0);

    if (!fileName) {
        return (
            <div className="w-full h-full flex items-center justify-center text-[10px] opacity-60">
                No image
            </div>
        );
    }

    const src = buildRoomImageUrl(fileName, attempt);

    const handleError = (e) => {
        // thử lại tối đa 2 lần, mỗi lần delay 700ms, sau đó fallback logo
        if (attempt < 2) {
            setTimeout(() => {
                setAttempt((a) => a + 1);
            }, 700);
        } else {
            e.currentTarget.src = "/hotel-logo.png";
        }
    };

    return (
        <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={handleError}
        />
    );
};

// =========================

export const ModRooms = () => {
    const dispatch = useDispatch();
    const { rooms, loading } = useSelector((s) => s.room);
    const { hotels } = useSelector((s) => s.hotel);
    const { user } = useSelector((s) => s.auth);

    const [filters, setFilters] = useState({
        q: "",
        type: "all",
        status: "all",
        sort: "name",
    });

    // ===== Modal state =====
    const [isModalEditVisible, setIsModalEditVisible] = useState(false);
    const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false);
    const [isModalAddVisible, setIsModalAddVisible] = useState(false);
    const [itemACtion, setItemACtion] = useState(null);

    /* =========================
     *  FETCH ROOMS TỪ API
     * ========================= */
    const fetchRooms = useCallback(async () => {
        try {
            const res = await roomServices.getAll?.();
            const data = res?.data ?? res;
            if (Array.isArray(data)) {
                dispatch(roomAction.setRooms(data));
            }
        } catch (err) {
            console.error("Error fetching rooms (MOD):", err);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    // hotel hiện tại của MOD (theo ownerId)
    const myHotel = useMemo(() => {
        if (!user || !hotels) return null;
        return hotels.find((h) => h.ownerId === user.id) || null;
    }, [hotels, user]);

    // chỉ lấy room thuộc khách sạn mà MOD sở hữu
    const myRooms = useMemo(() => {
        if (!rooms || !user) return [];
        return rooms.filter(
            (r) => r.hotel && r.hotel.ownerId === user.id
        );
    }, [rooms, user]);

    // áp dụng filter & sort
    const filteredRooms = useMemo(() => {
        let list = myRooms;

        // search
        if (filters.q) {
            const q = filters.q.toLowerCase();
            list = list.filter(
                (r) =>
                    r.name.toLowerCase().includes(q) ||
                    (r.type || "").toLowerCase().includes(q)
            );
        }

        // type
        if (filters.type !== "all") {
            list = list.filter((r) => r.type === filters.type);
        }

        // status
        if (filters.status !== "all") {
            const wantAvailable = filters.status === "available";
            list = list.filter((r) => r.availability === wantAvailable);
        }

        // sort
        if (filters.sort === "price_asc") {
            list = [...list].sort((a, b) => a.price - b.price);
        } else if (filters.sort === "price_desc") {
            list = [...list].sort((a, b) => b.price - a.price);
        } else if (filters.sort === "capacity") {
            list = [...list].sort((a, b) => a.capacity - b.capacity);
        } else {
            // name
            list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        }

        return list;
    }, [myRooms, filters]);

    const availableCount = useMemo(
        () => myRooms.filter((r) => r.availability).length,
        [myRooms]
    );

    const handleChangeFilter = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    // ===== handlers mở modal =====
    const handleEditRoom = (room) => {
        setItemACtion(room);
        setIsModalEditVisible(true);
    };

    const handleDeleteRoom = (room) => {
        setItemACtion(room);
        setIsModalDeleteVisible(true);
    };

    const handleAddRoom = () => {
        setItemACtion(null);
        setIsModalAddVisible(true);
    };

    return (
        <div className="p-4 space-y-4">
            {/* ====== MODALS ====== */}
            <ModEditRoom
                isModalEditVisible={isModalEditVisible}
                setIsModalEditVisible={setIsModalEditVisible}
                itemACtion={itemACtion}
                onUpdated={fetchRooms}
            />
            <ModDeleteRoom
                isModalDeleteVisible={isModalDeleteVisible}
                setIsModalDeleteVisible={setIsModalDeleteVisible}
                itemACtion={itemACtion}
                onDeleted={fetchRooms}
            />
            <ModAddRoom
                isModalAddVisible={isModalAddVisible}
                setIsModalAddVisible={setIsModalAddVisible}
                onCreated={fetchRooms} // create xong -> fetch lại
            />

            {/* ====== HEADER ====== */}
            <div className="flex items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-3 mt-1">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--primary)] text-white shadow-md text-lg">
                            <MdOutlineBedroomParent />
                        </div>
                        <div>
                            <h1
                                className="text-xl sm:text-2xl font-extrabold leading-tight"
                                style={{ color: "var(--text)" }}
                            >
                                {myHotel?.name || "My Hotel"}
                            </h1>
                            <div
                                className="mt-1 text-[11px] sm:text-xs uppercase tracking-wide"
                                style={{ color: "var(--muted)" }}
                            >
                                ROOMS MANAGEMENT
                            </div>
                        </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs sm:text-sm">
                        <span className="px-2.5 py-0.5 rounded-full bg-black/5 font-medium">
                            🛏 {myRooms.length} rooms
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-black/5 font-medium">
                            ✅ {availableCount} available
                        </span>
                    </div>
                </div>

                <Button
                    type="primary"
                    className="rounded-full px-4 h-9 text-sm font-semibold"
                    onClick={handleAddRoom}
                >
                    + Add room
                </Button>
            </div>

            {/* ====== FILTER BAR ====== */}
            <div className="rounded-2xl themed-card shadow px-4 py-3 flex flex-wrap gap-3 items-center">
                <Search
                    placeholder="Search room name or type..."
                    allowClear
                    value={filters.q}
                    onChange={(e) => handleChangeFilter("q", e.target.value)}
                    className="w-full sm:w-64"
                    size="small"
                />

                <Select
                    size="small"
                    value={filters.type}
                    onChange={(v) => handleChangeFilter("type", v)}
                    options={[
                        { value: "all", label: "All types" },
                        { value: "Standard", label: "Standard" },
                        { value: "Deluxe", label: "Deluxe" },
                        { value: "Suite", label: "Suite" },
                    ]}
                />

                <Select
                    size="small"
                    value={filters.status}
                    onChange={(v) => handleChangeFilter("status", v)}
                    options={[
                        { value: "all", label: "All status" },
                        { value: "available", label: "Available" },
                        { value: "unavailable", label: "In use / closed" },
                    ]}
                />

                <Select
                    size="small"
                    value={filters.sort}
                    onChange={(v) => handleChangeFilter("sort", v)}
                    options={[
                        { value: "name", label: "Sort by name" },
                        { value: "price_asc", label: "Price ↑" },
                        { value: "price_desc", label: "Price ↓" },
                        { value: "capacity", label: "Capacity" },
                    ]}
                />
            </div>

            {/* ====== LIST ROOMS ====== */}
            <div className="rounded-2xl themed-card shadow p-3">
                {loading && myRooms.length === 0 ? (
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                        Loading rooms...
                    </p>
                ) : filteredRooms.length === 0 ? (
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                        No rooms found. Try adjusting filters.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {filteredRooms.map((room) => (
                            <div
                                key={room.id}
                                className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl hover:bg-black/5 transition"
                            >
                                {/* LEFT: image + info */}
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-black/5 flex-shrink-0">
                                        <RoomImage fileName={room.image} alt={room.name} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold truncate">
                                            {room.name}
                                        </div>
                                        <div className="text-xs opacity-70 truncate">
                                            {room.type || "Unspecified"} • {room.capacity} guests
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT: price + status + actions */}
                                <div className="flex items-center gap-4 text-xs">
                                    <span className="font-semibold whitespace-nowrap">
                                        ${room.price}
                                    </span>

                                    <Tag
                                        color={room.availability ? "green" : "red"}
                                        className="m-0 text-[11px]"
                                    >
                                        {room.availability ? "Available" : "Unavailable"}
                                    </Tag>

                                    <div className="flex gap-1">
                                        <Button size="small" onClick={() => handleEditRoom(room)}>
                                            Edit
                                        </Button>
                                        <Button
                                            size="small"
                                            danger
                                            onClick={() => handleDeleteRoom(room)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModRooms;
