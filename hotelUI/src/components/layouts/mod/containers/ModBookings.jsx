import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Input, Select, Button, Tag, Tooltip, message, Spin } from "antd";
import { BsCartFill } from "react-icons/bs";

import { ModAddBooking } from "./booking/ModAddBooking";
import { ModEditBooking } from "./booking/ModEditBooking";
import { ModDeleteBooking } from "./booking/ModDeleteBooking";

import { bookingServices } from "../../../../services";
import { bookingAction } from "../../../../store";

const { Search } = Input;

/* ========= ENV & helpers ========= */
const RAW_IMAGE_URL = (import.meta.env.VITE_IMAGE_URL || "").replace(/\/+$/, "");
const buildRoomImageUrl = (fileName) =>
    fileName ? `${RAW_IMAGE_URL}/rooms/${fileName}` : "";

/** Thanh toán đã hoàn tất? (support cả string & boolean) */
const isPaid = (booking) => {
    const raw = booking?.payment;
    if (typeof raw === "boolean") return raw;
    if (raw == null) return false;
    const p = String(raw).toLowerCase();
    return p.includes("paid") || p.includes("success") || p.includes("completed");
};

/** Lấy mốc thời gian đầu / cuối ngày hôm nay (ms) */
const getTodayRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    return { startMs: start.getTime(), endMs: end.getTime() };
};

/** Phân loại booking so với hôm nay. */
const classifyBookingByToday = (booking, todayStartMs, todayEndMs) => {
    if (!booking?.checkIn || !booking?.checkOut) {
        return {
            text: "",
            color: "default",
            flags: { isStayingToday: false, isCheckInToday: false, isCheckOutToday: false },
        };
    }

    const checkInMs = new Date(booking.checkIn).getTime();
    const checkOutMs = new Date(booking.checkOut).getTime();

    const isCheckInToday = checkInMs >= todayStartMs && checkInMs < todayEndMs;
    const isCheckOutToday = checkOutMs >= todayStartMs && checkOutMs < todayEndMs;

    const isOverlapToday = checkOutMs > todayStartMs && checkInMs < todayEndMs;
    const isStayingToday = isOverlapToday && !isCheckInToday && !isCheckOutToday;

    let text = "";
    let color = "default";

    if (isStayingToday) {
        text = "Staying today";
        color = "gold";
    } else if (isCheckInToday) {
        text = "Check-in today";
        color = "blue";
    } else if (isCheckOutToday) {
        text = "Check-out today";
        color = "purple";
    } else if (checkOutMs <= todayStartMs) {
        text = "Finished";
        color = "default";
    } else if (checkInMs >= todayEndMs) {
        text = "Upcoming";
        color = "cyan";
    }

    return { text, color, flags: { isStayingToday, isCheckInToday, isCheckOutToday } };
};

export const ModBookings = () => {
    const dispatch = useDispatch();
    const { bookings } = useSelector((s) => s.booking);
    const { hotels } = useSelector((s) => s.hotel);
    const { user } = useSelector((s) => s.auth);

    const { startMs: todayStartMs, endMs: todayEndMs } = useMemo(() => getTodayRange(), []);

    const [filters, setFilters] = useState({
        q: "",
        payment: "all",
        sort: "checkin_desc",
        date: "all", // "all" | "today"
    });

    const [loading, setLoading] = useState(false);

    const [isModalEditVisible, setIsModalEditVisible] = useState(false);
    const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false);
    const [isModalAddVisible, setIsModalAddVisible] = useState(false);
    const [itemACtion, setItemACtion] = useState(undefined);

    /* =========================
     *  FETCH BOOKINGS
     * ========================= */
    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const res = await bookingServices.getAll();
            const data = res?.data ?? res;
            dispatch(bookingAction.setBookings(Array.isArray(data) ? data : []));
        } catch (err) {
            console.error("Error fetching bookings (MOD):", err);
            message.error("Failed to load bookings. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const myHotel = useMemo(() => {
        if (!user || !hotels) return null;
        return hotels.find((h) => h.ownerId === user.id) || null;
    }, [hotels, user]);

    const myBookings = useMemo(() => {
        if (!bookings || !user) return [];
        return bookings.filter(
            (b) => Array.isArray(b.rooms) && b.rooms.some((r) => r?.hotel?.ownerId === user.id)
        );
    }, [bookings, user]);

    const todayCount = useMemo(() => {
        return myBookings.filter((b) => {
            const { flags } = classifyBookingByToday(b, todayStartMs, todayEndMs);
            return flags.isStayingToday || flags.isCheckInToday || flags.isCheckOutToday;
        }).length;
    }, [myBookings, todayStartMs, todayEndMs]);

    const stayingCount = useMemo(() => {
        return myBookings.filter((b) => classifyBookingByToday(b, todayStartMs, todayEndMs).flags.isStayingToday).length;
    }, [myBookings, todayStartMs, todayEndMs]);

    const paidCount = useMemo(() => myBookings.filter((b) => isPaid(b)).length, [myBookings]);

    const handleChangeFilter = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

    const handleEditBooking = (booking) => {
        setItemACtion(booking);
        setIsModalEditVisible(true);
    };

    const handleDeleteBooking = (booking) => {
        setItemACtion(booking);
        setIsModalDeleteVisible(true);
    };

    const handleAddBooking = () => {
        setItemACtion(undefined);
        setIsModalAddVisible(true);
    };

    /* ========== FILTER + SORT ========== */
    const filteredBookings = useMemo(() => {
        let list = myBookings;

        if (filters.date === "today") {
            list = list.filter((b) => {
                const { flags } = classifyBookingByToday(b, todayStartMs, todayEndMs);
                return flags.isStayingToday || flags.isCheckInToday || flags.isCheckOutToday;
            });
        }

        if (filters.q) {
            const q = filters.q.toLowerCase();
            list = list.filter((b) => {
                const guestName = (b.user?.fullName || b.user?.username || "").toLowerCase();
                const idStr = String(b.id || "").toLowerCase();
                const roomNames = (b.rooms || []).map((r) => r?.name || "").join(" ").toLowerCase();
                return guestName.includes(q) || idStr.includes(q) || roomNames.includes(q);
            });
        }

        if (filters.payment !== "all") {
            const wantPaid = filters.payment === "paid";
            list = list.filter((b) => isPaid(b) === wantPaid);
        }

        const parseDate = (d) => (d ? new Date(d).getTime() : 0);

        if (filters.sort === "checkin_asc") list = [...list].sort((a, b) => parseDate(a.checkIn) - parseDate(b.checkIn));
        else if (filters.sort === "checkin_desc") list = [...list].sort((a, b) => parseDate(b.checkIn) - parseDate(a.checkIn));
        else if (filters.sort === "price_asc") list = [...list].sort((a, b) => (a.totalPrice || 0) - (b.totalPrice || 0));
        else if (filters.sort === "price_desc") list = [...list].sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0));

        return list;
    }, [myBookings, filters, todayStartMs, todayEndMs]);

    return (
        <div className="p-3 sm:p-4 space-y-4">
            {/* ==== MODALS ==== */}
            <ModEditBooking
                isModalEditVisible={isModalEditVisible}
                setIsModalEditVisible={setIsModalEditVisible}
                itemACtion={itemACtion}
                onUpdated={fetchBookings}
            />
            <ModDeleteBooking
                isModalDeleteVisible={isModalDeleteVisible}
                setIsModalDeleteVisible={setIsModalDeleteVisible}
                itemACtion={itemACtion}
                onDeleted={fetchBookings}
            />
            <ModAddBooking
                isModalAddVisible={isModalAddVisible}
                setIsModalAddVisible={setIsModalAddVisible}
                itemACtion={itemACtion}
                onCreated={fetchBookings}
            />

            {/* ===== HEADER ===== */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--primary)] text-white shadow-md text-lg">
                            <BsCartFill />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-2xl font-extrabold leading-tight" style={{ color: "var(--text)" }}>
                                {myHotel?.name || "My Hotel"}
                            </h1>
                            <div className="mt-1 text-[10px] sm:text-xs uppercase tracking-wide" style={{ color: "var(--muted)" }}>
                                BOOKINGS MANAGEMENT
                            </div>
                        </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] sm:text-sm">
                        <span className="px-2.5 py-0.5 rounded-full bg-black/5 font-medium">🧾 {myBookings.length} bookings</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-black/5 font-medium">💰 {paidCount} paid</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-black/5 font-medium">📌 Today: {todayCount}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-black/5 font-medium">📅 Staying: {stayingCount}</span>
                    </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                        className="flex-1 sm:flex-none"
                        onClick={fetchBookings}
                        disabled={loading}
                    >
                        Refresh
                    </Button>

                    <Button
                        type="primary"
                        className="flex-1 sm:flex-none rounded-full px-4 h-9 text-sm font-semibold"
                        onClick={handleAddBooking}
                        disabled={loading}
                    >
                        + Add booking
                    </Button>
                </div>
            </div>

            {/* ===== FILTER BAR ===== */}
            <div className="rounded-2xl themed-card shadow px-3 sm:px-4 py-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 items-center">
                    <Search
                        placeholder="Search guest, room or booking ID..."
                        allowClear
                        value={filters.q}
                        onChange={(e) => handleChangeFilter("q", e.target.value)}
                        size="middle"
                        className="w-full lg:col-span-2"
                    />

                    <Select
                        value={filters.payment}
                        onChange={(v) => handleChangeFilter("payment", v)}
                        size="middle"
                        className="w-full"
                        options={[
                            { value: "all", label: "All payments" },
                            { value: "paid", label: "Paid" },
                            { value: "unpaid", label: "Unpaid / pending" },
                        ]}
                    />

                    <Select
                        value={filters.sort}
                        onChange={(v) => handleChangeFilter("sort", v)}
                        size="middle"
                        className="w-full"
                        options={[
                            { value: "checkin_desc", label: "Check-in: newest" },
                            { value: "checkin_asc", label: "Check-in: oldest" },
                            { value: "price_desc", label: "Total price ↓" },
                            { value: "price_asc", label: "Total price ↑" },
                        ]}
                    />

                    <Select
                        value={filters.date}
                        onChange={(v) => handleChangeFilter("date", v)}
                        size="middle"
                        className="w-full"
                        options={[
                            { value: "all", label: "All dates" },
                            { value: "today", label: "Today only" },
                        ]}
                    />
                </div>
            </div>

            {/* ===== LIST BOOKINGS ===== */}
            <div className="rounded-2xl themed-card shadow p-3">
                {loading ? (
                    <div className="py-10 flex items-center justify-center">
                        <Spin />
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                        {myBookings.length === 0 ? "No bookings yet." : "No bookings found. Try adjusting filters."}
                    </p>
                ) : (
                    <>
                        {/* DESKTOP TABLE (xl+) */}
                        <div className="hidden xl:block space-y-2">
                            <div className="grid grid-cols-[190px_minmax(0,1.8fr)_140px_120px_120px_170px] items-center gap-3 px-4 pb-2 border-b border-black/5">
                                <div className="text-center font-bold text-sm tracking-wide" style={{ color: "var(--text)" }}>BOOKING / GUEST</div>
                                <div className="text-center font-bold text-sm tracking-wide" style={{ color: "var(--text)" }}>ROOMS & DATES</div>
                                <div className="text-center font-bold text-sm tracking-wide" style={{ color: "var(--text)" }}>TODAY</div>
                                <div className="text-center font-bold text-sm tracking-wide" style={{ color: "var(--text)" }}>TOTAL</div>
                                <div className="text-center font-bold text-sm tracking-wide" style={{ color: "var(--text)" }}>PAYMENT</div>
                                <div className="text-center font-bold text-sm tracking-wide" style={{ color: "var(--text)" }}>ACTIONS</div>
                            </div>

                            {filteredBookings.map((b) => {
                                const firstRoom = b.rooms?.[0] || null;
                                const roomNames = (b.rooms || []).map((r) => r?.name).filter(Boolean).join(", ");

                                const checkInStr = b.checkIn ? new Date(b.checkIn).toLocaleDateString() : "N/A";
                                const checkOutStr = b.checkOut ? new Date(b.checkOut).toLocaleDateString() : "N/A";

                                const { text: todayStatusText, color: todayStatusColor, flags } =
                                    classifyBookingByToday(b, todayStartMs, todayEndMs);

                                const isTodayImportant = flags.isStayingToday || flags.isCheckInToday || flags.isCheckOutToday;
                                const paymentLabel = isPaid(b) ? "Paid" : "Pending";

                                return (
                                    <div
                                        key={b.id}
                                        className={
                                            "grid grid-cols-[190px_minmax(0,1.8fr)_140px_120px_120px_170px] items-center gap-3 px-4 py-3 rounded-xl transition " +
                                            (isTodayImportant ? "booking-card--today" : "hover:bg-black/5")
                                        }
                                    >
                                        {/* 1 */}
                                        <div className="flex items-center gap-3 min-w-0 justify-center">
                                            <div className="w-16 h-12 rounded-lg overflow-hidden bg-black/5 flex-shrink-0">
                                                {firstRoom?.image ? (
                                                    <img
                                                        src={buildRoomImageUrl(firstRoom.image)}
                                                        alt={firstRoom?.name || "Room"}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => (e.currentTarget.src = "/hotel-logo.png")}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] opacity-60">
                                                        No image
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0 text-center">
                                                <div className="text-[11px] opacity-70">Booking #{b.id}</div>
                                                <div className="text-sm font-semibold truncate whitespace-nowrap" style={{ color: "var(--primary)" }}>
                                                    {b.user?.fullName || b.user?.username || "Guest"}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2 */}
                                        <div className="min-w-0 text-xs flex flex-col items-center">
                                            <Tooltip title={roomNames || "No rooms"}>
                                                <div className="truncate whitespace-nowrap text-center">{roomNames || "No rooms"}</div>
                                            </Tooltip>
                                            <div className="opacity-70 truncate whitespace-nowrap text-center">
                                                {checkInStr} — {checkOutStr}
                                            </div>
                                        </div>

                                        {/* 3 */}
                                        <div className="flex justify-center">
                                            {todayStatusText ? (
                                                <Tag color={todayStatusColor} className="m-0 text-[11px]">{todayStatusText}</Tag>
                                            ) : null}
                                        </div>

                                        {/* 4 */}
                                        <div className="text-xs font-semibold text-center whitespace-nowrap">
                                            ${b.totalPrice || 0}
                                        </div>

                                        {/* 5 */}
                                        <div className="flex justify-center">
                                            <Tag color={isPaid(b) ? "green" : "orange"} className="m-0 text-[11px]">
                                                {paymentLabel}
                                            </Tag>
                                        </div>

                                        {/* 6 */}
                                        <div className="flex justify-center gap-2">
                                            <Button size="small" onClick={() => handleEditBooking(b)}>Edit</Button>
                                            <Button size="small" danger onClick={() => handleDeleteBooking(b)}>Delete</Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* MOBILE + TABLET (<xl) */}
                        <div className="xl:hidden space-y-3">
                            {filteredBookings.map((b) => {
                                const firstRoom = b.rooms?.[0] || null;
                                const roomNames = (b.rooms || []).map((r) => r?.name).filter(Boolean).join(", ");
                                const checkInStr = b.checkIn ? new Date(b.checkIn).toLocaleDateString() : "N/A";
                                const checkOutStr = b.checkOut ? new Date(b.checkOut).toLocaleDateString() : "N/A";

                                const { text: todayStatusText, color: todayStatusColor } =
                                    classifyBookingByToday(b, todayStartMs, todayEndMs);

                                const paymentLabel = isPaid(b) ? "Paid" : "Pending";

                                return (
                                    <div key={b.id} className="rounded-2xl border border-black/5 bg-white/60 p-3">
                                        <div className="flex gap-3">
                                            <div className="w-20 h-16 rounded-xl overflow-hidden bg-black/5 flex-shrink-0">
                                                {firstRoom?.image ? (
                                                    <img
                                                        src={buildRoomImageUrl(firstRoom.image)}
                                                        alt={firstRoom?.name || "Room"}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => (e.currentTarget.src = "/hotel-logo.png")}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] opacity-60">
                                                        No image
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="text-[11px] opacity-70">Booking #{b.id}</div>
                                                <div className="font-extrabold truncate" style={{ color: "var(--primary)" }}>
                                                    {b.user?.fullName || b.user?.username || "Guest"}
                                                </div>

                                                <Tooltip title={roomNames || "No rooms"}>
                                                    <div className="text-xs mt-1 truncate opacity-90">
                                                        {roomNames || "No rooms"}
                                                    </div>
                                                </Tooltip>

                                                <div className="text-[12px] mt-1 opacity-70">
                                                    {checkInStr} — {checkOutStr}
                                                </div>

                                                <div className="mt-2 flex flex-wrap gap-2 items-center">
                                                    {todayStatusText ? (
                                                        <Tag color={todayStatusColor} className="m-0 text-[11px]">
                                                            {todayStatusText}
                                                        </Tag>
                                                    ) : null}

                                                    <Tag color={isPaid(b) ? "green" : "orange"} className="m-0 text-[11px]">
                                                        {paymentLabel}
                                                    </Tag>

                                                    <span className="text-sm font-extrabold ml-auto">
                                                        ${b.totalPrice || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                            <Button size="small" onClick={() => handleEditBooking(b)}>Edit</Button>
                                            <Button size="small" danger onClick={() => handleDeleteBooking(b)}>Delete</Button>
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

export default ModBookings;
