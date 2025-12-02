// src/components/layouts/mod/containers/ModRooms.jsx
import React, {
    useMemo,
    useState,
    useCallback,
    useEffect,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { Input, Select, Button, Tag, Tooltip } from "antd";
import { MdOutlineBedroomParent } from "react-icons/md";

import { roomServices } from "../../../../services";
import { roomAction } from "../../../../store";

// Mod modals
import { ModAddRoom } from "./room/ModAddRoom";
import { ModEditRoom } from "./room/ModEditRoom";
import { ModDeleteRoom } from "./room/ModDeleteRoom";

const { Search } = Input;

// ===== ENV & helpers =====
const RAW_IMAGE_URL = (import.meta.env.VITE_IMAGE_URL || "").replace(
    /\/+$/,
    ""
);
const buildRoomImageUrl = (fileName, attempt = 0) =>
    fileName
        ? `${RAW_IMAGE_URL}/rooms/${fileName}${attempt ? `?v=${attempt}` : ""
        }`
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

/* ===== DISCOUNT HELPERS ===== */

const formatDateShort = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
};

/** Lấy thông tin giảm giá từ room + trạng thái */
const getDiscountInfo = (room) => {
    const raw =
        room?.discountPercent ??
        room?.discount_percent ??
        room?.discount ??
        0;

    const percent = Number(raw);
    if (!Number.isFinite(percent) || percent <= 0) {
        return {
            percent: 0,
            state: "none", // none | active | scheduled | expired
            startRaw: null,
            endRaw: null,
            label: "No discount",
        };
    }

    const startRaw = room.discountStart ?? room.discount_start ?? null;
    const endRaw = room.discountEnd ?? room.discount_end ?? null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const toDate = (v) => {
        if (!v) return null;
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return null;
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const start = toDate(startRaw);
    const end = toDate(endRaw);

    let state = "active";

    if (start && today < start) {
        state = "scheduled";
    } else if (end && today > end) {
        state = "expired";
    }

    let label = `${percent}% Active`;
    if (state === "scheduled") label = `${percent}% Scheduled`;
    if (state === "expired") label = `${percent}% Ended`;

    return { percent, state, startRaw, endRaw, label };
};

const buildDiscountTooltip = (info) => {
    if (!info || info.percent <= 0 || info.state === "none") {
        return "No discount";
    }

    const range = [
        info.startRaw ? formatDateShort(info.startRaw) : null,
        info.endRaw ? formatDateShort(info.endRaw) : null,
    ].filter(Boolean);

    let stateLabel = "";
    if (info.state === "active") stateLabel = "Currently active";
    if (info.state === "scheduled") stateLabel = "Scheduled period";
    if (info.state === "expired") stateLabel = "Ended period";

    if (range.length === 2) {
        return `${info.percent}% • ${stateLabel} (${range[0]} → ${range[1]})`;
    }
    if (range.length === 1) {
        return `${info.percent}% • ${stateLabel} (${range[0]})`;
    }
    return `${info.percent}% • ${stateLabel}`;
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
        return rooms.filter((r) => r.hotel && r.hotel.ownerId === user.id);
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
                        {/* HEADER ROW */}
                        <div
                            className="grid grid-cols-[240px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_120px_minmax(0,1fr)_160px]
                         items-center gap-3 px-4 pb-2 border-b border-black/5"
                        >
                            <div
                                className="text-center font-bold text-sm tracking-wide"
                                style={{ color: "var(--text)" }}
                            >
                                ROOM
                            </div>
                            <div
                                className="text-center font-bold text-sm tracking-wide"
                                style={{ color: "var(--text)" }}
                            >
                                TYPE
                            </div>
                            <div
                                className="text-center font-bold text-sm tracking-wide"
                                style={{ color: "var(--text)" }}
                            >
                                GUESTS
                            </div>
                            <div
                                className="text-center font-bold text-sm tracking-wide"
                                style={{ color: "var(--text)" }}
                            >
                                PRICE
                            </div>
                            <div
                                className="text-center font-bold text-sm tracking-wide"
                                style={{ color: "var(--text)" }}
                            >
                                DISCOUNT
                            </div>
                            <div
                                className="text-center font-bold text-sm tracking-wide"
                                style={{ color: "var(--text)" }}
                            >
                                STATUS
                            </div>
                            <div
                                className="text-center font-bold text-sm tracking-wide"
                                style={{ color: "var(--text)" }}
                            >
                                ACTIONS
                            </div>
                        </div>

                        {/* CÁC DÒNG ROOM */}
                        {filteredRooms.map((room) => {
                            const info = getDiscountInfo(room);

                            let pillClass =
                                "inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold";
                            if (info.state === "active") {
                                pillClass += " bg-emerald-100 text-emerald-700";
                            } else if (info.state === "scheduled") {
                                pillClass += " bg-amber-100 text-amber-700";
                            } else if (info.state === "expired") {
                                pillClass += " bg-neutral-100 text-neutral-600";
                            }

                            return (
                                <div
                                    key={room.id}
                                    className="grid grid-cols-[240px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_120px_minmax(0,1fr)_160px]
                             items-center gap-3 px-4 py-3 rounded-xl hover:bg-black/5 transition"
                                >
                                    {/* 1. ROOM (ảnh + tên) */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-16 h-12 rounded-lg overflow-hidden bg-black/5 flex-shrink-0">
                                            <RoomImage fileName={room.image} alt={room.name} />
                                        </div>
                                        <div className="min-w-0">
                                            <div
                                                className="text-sm font-semibold truncate"
                                                style={{ color: "var(--primary)" }}
                                            >
                                                {room.name}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. TYPE */}
                                    <div className="text-xs text-center truncate">
                                        {room.type || "Unspecified"}
                                    </div>

                                    {/* 3. GUESTS */}
                                    <div className="text-xs text-center truncate">
                                        {room.capacity} guests
                                    </div>

                                    {/* 4. PRICE */}
                                    <div className="text-xs font-semibold text-center whitespace-nowrap">
                                        ${room.price}
                                    </div>

                                    {/* 5. DISCOUNT (tooltip hiển thị thời gian) */}
                                    <div className="flex justify-center">
                                        {info.percent > 0 ? (
                                            <Tooltip title={buildDiscountTooltip(info)}>
                                                <span className={pillClass}>{info.label}</span>
                                            </Tooltip>
                                        ) : (
                                            <span className="text-[11px] opacity-60">
                                                No discount
                                            </span>
                                        )}
                                    </div>

                                    {/* 6. STATUS */}
                                    <div className="flex justify-center">
                                        <Tag
                                            color={room.availability ? "green" : "red"}
                                            className="m-0 text-[11px]"
                                        >
                                            {room.availability ? "Available" : "Unavailable"}
                                        </Tag>
                                    </div>

                                    {/* 7. ACTIONS */}
                                    <div className="flex justify-center gap-2">
                                        <Button
                                            size="small"
                                            onClick={() => handleEditRoom(room)}
                                        >
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
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModRooms;
