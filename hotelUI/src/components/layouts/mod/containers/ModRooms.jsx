import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Input, Select, Button, Tag, Tooltip, message, Spin, Switch } from "antd";
import { MdOutlineBedroomParent } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";

import { roomServices } from "../../../../services";
// ⚠️ Nếu project bạn không export roomAction từ "../../../../store"
// thì đổi lại đúng path bạn đang dùng, ví dụ: "../../../../store/room/slice"
import { roomAction } from "../../../../store";

// Mod modals
import { ModAddRoom } from "./room/ModAddRoom";
import { ModEditRoom } from "./room/ModEditRoom";

const { Search } = Input;

/* ========= ENV & helpers ========= */
const RAW_IMAGE_URL = (import.meta.env.VITE_IMAGE_URL || "").replace(/\/+$/, "");
const buildRoomImageUrl = (fileName, attempt = 0) =>
    fileName ? `${RAW_IMAGE_URL}/rooms/${fileName}${attempt ? `?v=${attempt}` : ""}` : "";

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
        if (attempt < 2) setTimeout(() => setAttempt((a) => a + 1), 700);
        else e.currentTarget.src = "/hotel-logo.png";
    };

    return <img src={src} alt={alt} className="w-full h-full object-cover" onError={handleError} />;
};

/* ========= DISCOUNT HELPERS ========= */
const formatDateShort = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
};

const getDiscountInfo = (room) => {
    const raw = room?.discountPercent ?? room?.discount_percent ?? room?.discount ?? 0;
    const percent = Number(raw);

    if (!Number.isFinite(percent) || percent <= 0) {
        return { percent: 0, state: "none", startRaw: null, endRaw: null, label: "No discount" };
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
    if (start && today < start) state = "scheduled";
    else if (end && today > end) state = "expired";

    let label = `${percent}% Active`;
    if (state === "scheduled") label = `${percent}% Scheduled`;
    if (state === "expired") label = `${percent}% Ended`;

    return { percent, state, startRaw, endRaw, label };
};

const buildDiscountTooltip = (info) => {
    if (!info || info.percent <= 0 || info.state === "none") return "No discount";

    const range = [info.startRaw ? formatDateShort(info.startRaw) : null, info.endRaw ? formatDateShort(info.endRaw) : null]
        .filter(Boolean);

    let stateLabel = "";
    if (info.state === "active") stateLabel = "Currently active";
    if (info.state === "scheduled") stateLabel = "Scheduled period";
    if (info.state === "expired") stateLabel = "Ended period";

    if (range.length === 2) return `${info.percent}% • ${stateLabel} (${range[0]} → ${range[1]})`;
    if (range.length === 1) return `${info.percent}% • ${stateLabel} (${range[0]})`;
    return `${info.percent}% • ${stateLabel}`;
};

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

    const [fetching, setFetching] = useState(false);

    const [isModalEditVisible, setIsModalEditVisible] = useState(false);
    const [isModalAddVisible, setIsModalAddVisible] = useState(false);
    const [itemACtion, setItemACtion] = useState(null);

    // ✅ loading khi toggle theo roomId
    const [togglingId, setTogglingId] = useState(null);

    const fetchRooms = useCallback(async () => {
        setFetching(true);
        try {
            const res = await roomServices.getAll?.();
            const data = res?.data ?? res;
            dispatch(roomAction.setRooms(Array.isArray(data) ? data : []));
        } catch (err) {
            console.error("Error fetching rooms (MOD):", err);
            message.error("Failed to load rooms. Please try again.");
        } finally {
            setFetching(false);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchRooms();
    }, [fetchRooms]);

    const myHotel = useMemo(() => {
        if (!user || !hotels) return null;
        return hotels.find((h) => h.ownerId === user.id) || null;
    }, [hotels, user]);

    const myRooms = useMemo(() => {
        if (!rooms || !user) return [];
        return rooms.filter((r) => r?.hotel?.ownerId === user.id);
    }, [rooms, user]);

    const filteredRooms = useMemo(() => {
        let list = myRooms;

        if (filters.q) {
            const q = filters.q.toLowerCase();
            list = list.filter(
                (r) => (r.name || "").toLowerCase().includes(q) || (r.type || "").toLowerCase().includes(q)
            );
        }

        if (filters.type !== "all") list = list.filter((r) => r.type === filters.type);

        if (filters.status !== "all") {
            const wantAvailable = filters.status === "available";
            list = list.filter((r) => r.availability === wantAvailable);
        }

        if (filters.sort === "price_asc") list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
        else if (filters.sort === "price_desc") list = [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
        else if (filters.sort === "capacity") list = [...list].sort((a, b) => (a.capacity || 0) - (b.capacity || 0));
        else list = [...list].sort((a, b) => (a.name || "").localeCompare(b.name || ""));

        return list;
    }, [myRooms, filters]);

    const availableCount = useMemo(() => myRooms.filter((r) => r.availability).length, [myRooms]);

    const handleChangeFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

    const handleEditRoom = (room) => {
        setItemACtion(room);
        setIsModalEditVisible(true);
    };

    const handleAddRoom = () => {
        setItemACtion(null);
        setIsModalAddVisible(true);
    };

    // ✅ Toggle availability (thay delete)
    const handleToggleAvailability = async (room, nextValue) => {
        if (!room?.id) return;

        try {
            setTogglingId(room.id);

            const res = await roomServices.setAvailability(room.id, nextValue);
            const updatedRoom = res?.data?.data ?? res?.data?.room ?? res?.data;

            const finalRoom = updatedRoom?.id ? updatedRoom : { ...room, availability: nextValue };

            dispatch(roomAction.updateRooms(finalRoom));
            message.success(`Room is now ${nextValue ? "available" : "maintenance"} ✅`);
        } catch (err) {
            console.error("Toggle availability error:", err);
            message.error(err?.response?.data?.message || "Update availability failed.");
        } finally {
            setTogglingId(null);
        }
    };

    /* ========= GRID TEMPLATES =========
       xl (1280px): ROOM | CAPACITY | PRICE | DISCOUNT | STATUS | AVAI | ACTIONS
       2xl (>=1536px): ROOM | TYPE | CAPACITY | PRICE | DISCOUNT | STATUS | AVAI | ACTIONS
    */
    const GRID_XL = "grid-cols-[2.4fr_0.8fr_0.9fr_1.1fr_0.9fr_1fr_0.8fr]";
    const GRID_2XL = "grid-cols-[2.1fr_0.9fr_0.8fr_0.9fr_1.1fr_0.9fr_1fr_0.8fr]";

    return (
        <div className="p-3 sm:p-4 space-y-4">
            {/* ====== MODALS ====== */}
            <ModEditRoom
                isModalEditVisible={isModalEditVisible}
                setIsModalEditVisible={setIsModalEditVisible}
                itemACtion={itemACtion}
                onUpdated={() => {
                    message.success("Room updated.");
                    fetchRooms();
                }}
            />
            <ModAddRoom
                isModalAddVisible={isModalAddVisible}
                setIsModalAddVisible={setIsModalAddVisible}
                onCreated={() => {
                    message.success("Room created.");
                    fetchRooms();
                }}
            />

            {/* ====== HEADER ====== */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--primary)] text-white shadow-md text-lg">
                            <MdOutlineBedroomParent />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-2xl font-extrabold leading-tight" style={{ color: "var(--text)" }}>
                                {myHotel?.name || "My Hotel"}
                            </h1>
                            <div className="mt-1 text-[10px] sm:text-xs uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                                ROOMS MANAGEMENT
                            </div>
                        </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] sm:text-sm">
                        <span className="px-2.5 py-0.5 rounded-full bg-black/5 font-medium">🛏 {myRooms.length} rooms</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-black/5 font-medium">✅ {availableCount} available</span>
                    </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <Button className="flex-1 sm:flex-none" onClick={fetchRooms} disabled={fetching}>
                        Refresh
                    </Button>
                    <Button
                        type="primary"
                        className="flex-1 sm:flex-none rounded-full px-4 h-9 text-sm font-semibold"
                        onClick={handleAddRoom}
                        disabled={fetching}
                    >
                        + Add room
                    </Button>
                </div>
            </div>

            {/* ====== FILTER BAR ====== */}
            <div className="rounded-2xl themed-card shadow px-3 sm:px-4 py-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 items-center">
                    <Search
                        placeholder="Search room name or type..."
                        allowClear
                        value={filters.q}
                        onChange={(e) => handleChangeFilter("q", e.target.value)}
                        size="middle"
                        className="w-full lg:col-span-2"
                    />

                    <Select
                        value={filters.type}
                        onChange={(v) => handleChangeFilter("type", v)}
                        size="middle"
                        className="w-full"
                        options={[
                            { value: "all", label: "All types" },
                            { value: "Standard", label: "Standard" },
                            { value: "Deluxe", label: "Deluxe" },
                            { value: "Suite", label: "Suite" },
                        ]}
                    />

                    <Select
                        value={filters.status}
                        onChange={(v) => handleChangeFilter("status", v)}
                        size="middle"
                        className="w-full"
                        options={[
                            { value: "all", label: "All status" },
                            { value: "available", label: "Available" },
                            { value: "unavailable", label: "Unavailable" },
                        ]}
                    />

                    <Select
                        value={filters.sort}
                        onChange={(v) => handleChangeFilter("sort", v)}
                        size="middle"
                        className="w-full sm:col-span-2 lg:col-span-1"
                        options={[
                            { value: "name", label: "Sort by name" },
                            { value: "price_asc", label: "Price ↑" },
                            { value: "price_desc", label: "Price ↓" },
                            { value: "capacity", label: "Capacity" },
                        ]}
                    />
                </div>
            </div>

            {/* ====== LIST ROOMS ====== */}
            <div className="rounded-2xl themed-card shadow p-3">
                {(loading || fetching) && myRooms.length === 0 ? (
                    <div className="py-10 flex justify-center">
                        <Spin />
                    </div>
                ) : filteredRooms.length === 0 ? (
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                        No rooms found. Try adjusting filters.
                    </p>
                ) : (
                    <>
                        {/* ===================== DESKTOP TABLE (xl+) ===================== */}
                        <div className="hidden xl:block space-y-2">
                            <div className={["grid items-center gap-2 px-4 pb-2 border-b border-black/5", `${GRID_XL} 2xl:${GRID_2XL}`].join(" ")}>
                                <div className="text-left font-bold text-sm tracking-wide" style={{ color: "var(--text)" }}>
                                    ROOM
                                </div>

                                {/* TYPE chỉ 2xl */}
                                <div className="hidden 2xl:block text-center font-bold text-sm tracking-wide" style={{ color: "var(--text)" }}>
                                    TYPE
                                </div>

                                <div className="text-center font-bold text-sm tracking-wide" style={{ color: "var(--text)" }}>
                                    CAPACITY
                                </div>
                                <div className="text-center font-bold text-sm tracking-wide" style={{ color: "var(--text)" }}>
                                    PRICE
                                </div>
                                <div className="text-center font-bold text-sm tracking-wide" style={{ color: "var(--text)" }}>
                                    DISCOUNT
                                </div>
                                <div className="text-center font-bold text-sm tracking-wide" style={{ color: "var(--text)" }}>
                                    STATUS
                                </div>
                                <div className="text-center font-bold text-sm tracking-wide" style={{ color: "var(--text)" }}>
                                    AVAI
                                </div>
                                <div className="text-center font-bold text-sm tracking-wide" style={{ color: "var(--text)" }}>
                                    ACTIONS
                                </div>
                            </div>

                            {filteredRooms.map((room) => {
                                const info = getDiscountInfo(room);

                                let pillClass = "inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold";
                                if (info.state === "active") pillClass += " bg-emerald-100 text-emerald-700";
                                else if (info.state === "scheduled") pillClass += " bg-amber-100 text-amber-700";
                                else if (info.state === "expired") pillClass += " bg-neutral-100 text-neutral-600";

                                return (
                                    <div
                                        key={room.id}
                                        className={["grid items-center gap-2 px-4 py-2 rounded-xl hover:bg-black/5 transition", `${GRID_XL} 2xl:${GRID_2XL}`].join(" ")}
                                    >
                                        {/* ROOM */}
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-14 h-10 rounded-lg overflow-hidden bg-black/5 flex-shrink-0">
                                                <RoomImage fileName={room.image} alt={room.name} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold truncate leading-tight" style={{ color: "var(--primary)" }} title={room.name}>
                                                    {room.name}
                                                </div>
                                            </div>
                                        </div>

                                        {/* TYPE chỉ 2xl */}
                                        <div className="hidden 2xl:block text-xs text-center truncate">{room.type || "Unspecified"}</div>

                                        {/* CAPACITY */}
                                        <div className="text-xs text-center whitespace-nowrap">{room.capacity} guests</div>

                                        {/* PRICE */}
                                        <div className="text-xs font-semibold text-center whitespace-nowrap">${room.price}</div>

                                        {/* DISCOUNT */}
                                        <div className="flex justify-center">
                                            {info.percent > 0 ? (
                                                <Tooltip title={buildDiscountTooltip(info)}>
                                                    <span className={pillClass}>{info.label}</span>
                                                </Tooltip>
                                            ) : (
                                                <span className="text-[11px] opacity-60">No discount</span>
                                            )}
                                        </div>

                                        {/* STATUS TAG */}
                                        <div className="flex justify-center">
                                            <Tag color={room.availability ? "green" : "red"} className="m-0 text-[11px]">
                                                {room.availability ? "Available" : "Maintenance"}
                                            </Tag>
                                        </div>

                                        {/* ✅ AVAI SWITCH */}
                                        <div className="flex justify-center">
                                            <Switch
                                                checked={Boolean(room.availability)}
                                                loading={togglingId === room.id}
                                                checkedChildren="ON"
                                                unCheckedChildren="OFF"
                                                onChange={(checked) => handleToggleAvailability(room, checked)}
                                            />
                                        </div>

                                        {/* ACTIONS */}
                                        <div className="flex justify-center">
                                            <Tooltip title="Edit">
                                                <Button size="small" className="px-2" onClick={() => handleEditRoom(room)} aria-label="Edit room">
                                                    <FaRegEdit />
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ===================== MOBILE + TABLET (<xl) ===================== */}
                        <div className="xl:hidden space-y-3">
                            {filteredRooms.map((room) => {
                                const info = getDiscountInfo(room);

                                let pillClass = "inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold";
                                if (info.state === "active") pillClass += " bg-emerald-100 text-emerald-700";
                                else if (info.state === "scheduled") pillClass += " bg-amber-100 text-amber-700";
                                else if (info.state === "expired") pillClass += " bg-neutral-100 text-neutral-600";

                                return (
                                    <div key={room.id} className="rounded-2xl border border-black/5 bg-white/60 p-3">
                                        <div className="flex gap-3">
                                            <div className="w-20 h-16 rounded-xl overflow-hidden bg-black/5 flex-shrink-0">
                                                <RoomImage fileName={room.image} alt={room.name} />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="font-extrabold truncate" style={{ color: "var(--primary)" }}>
                                                    {room.name}
                                                </div>

                                                <div className="mt-1 text-xs opacity-80 flex flex-wrap gap-2">
                                                    <span className="px-2 py-0.5 rounded-full bg-black/5">{room.type || "Unspecified"}</span>
                                                    <span className="px-2 py-0.5 rounded-full bg-black/5">{room.capacity} guests</span>
                                                    <span className="px-2 py-0.5 rounded-full bg-black/5 font-semibold">${room.price}</span>
                                                </div>

                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    {info.percent > 0 ? (
                                                        <Tooltip title={buildDiscountTooltip(info)}>
                                                            <span className={pillClass}>{info.label}</span>
                                                        </Tooltip>
                                                    ) : (
                                                        <span className="text-[11px] opacity-60">No discount</span>
                                                    )}

                                                    <Tag color={room.availability ? "green" : "red"} className="m-0 text-[11px] ml-auto">
                                                        {room.availability ? "Available" : "Maintenance"}
                                                    </Tag>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ✅ Toggle + Edit */}
                                        <div className="mt-3 grid grid-cols-2 gap-2 items-center">
                                            <Button size="small" onClick={() => handleEditRoom(room)}>
                                                Edit
                                            </Button>

                                            <div className="flex items-center justify-end gap-2">
                                                <span className="text-[11px] opacity-70">Avai</span>
                                                <Switch
                                                    checked={Boolean(room.availability)}
                                                    loading={togglingId === room.id}
                                                    onChange={(checked) => handleToggleAvailability(room, checked)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ModRooms;
