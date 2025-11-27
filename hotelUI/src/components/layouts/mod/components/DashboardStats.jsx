// src/components/layouts/mod/components/DashboardStats.jsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { LuHotel } from "react-icons/lu";
import { MdOutlineBedroomParent } from "react-icons/md";
import { BsCartFill } from "react-icons/bs";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
    Legend,
    BarChart,
    Bar,
} from "recharts";

/* ========= AutoSizer ========= */
const AutoSizer = ({ height = 320, className = "", children }) => {
    const ref = useRef(null);
    const [w, setW] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            const rect = entries[0].contentRect;
            setW(Math.max(0, rect.width));
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`w-full block min-w-0 ${className}`}
            style={{ height }}
        >
            {w > 0 && children(w, height)}
        </div>
    );
};

/* ========== STAT BOX ========== */
const StatBox = ({ title, value, Icon, subtitle }) => (
    <div className="stats shadow themed-card rounded-xl transition hover:shadow-lg">
        <div className="stat p-4">
            <div className="stat-figure" style={{ color: "var(--primary)" }}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="stat-title" style={{ color: "var(--muted)" }}>
                {title}
            </div>
            <div className="stat-value" style={{ color: "var(--text)" }}>
                {value}
            </div>
            {subtitle && (
                <div className="stat-desc text-xs mt-1" style={{ color: "var(--muted)" }}>
                    {subtitle}
                </div>
            )}
        </div>
    </div>
);

/* ===== Helpers cho Room Type ===== */
const stripDiacritics = (s = "") =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const TYPE_ALIASES = {
    deluxe: ["deluxe", "dlx"],
    standard: ["standard", "std", "standar", "st"],
    suite: ["suite", "suit"],
    superior: ["superior", "sup"],
    luxury: ["luxury", "lux"],
    budget: ["budget"],
    economy: ["economy", "eco"],
    premium: ["premium", "prem"],
    compact: ["compact"],
    vip: ["vip"],
    duplex: ["duplex", "dup"],
};

const toCanonicalType = (raw) => {
    if (!raw) return null;
    const cleaned = stripDiacritics(String(raw).trim().toLowerCase());
    const token = cleaned.replace(/[^a-z0-9\s\-]/g, "").trim();
    for (const [canon, list] of Object.entries(TYPE_ALIASES)) {
        if (list.includes(token)) return canon;
    }
    if (["abc", "room", "type", "na", "unknown"].includes(token) || token.length < 3)
        return "other";
    return token;
};

const TYPE_ORDER = [
    "standard",
    "deluxe",
    "suite",
    "superior",
    "luxury",
    "vip",
    "budget",
    "economy",
    "duplex",
    "premium",
    "compact",
    "other",
];

/* ====== Range filter options ====== */
const RANGE_OPTIONS = [
    { key: "7d", label: "7 days" },
    { key: "30d", label: "30 days" },
    { key: "365d", label: "1 year" },
    { key: "all", label: "All" },
];

const isInRange = (dateValue, rangeKey) => {
    if (rangeKey === "all") return true;
    if (!dateValue) return true;

    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return true;

    const now = Date.now();
    const diffDays = Math.abs((now - d.getTime()) / (1000 * 60 * 60 * 24));

    if (rangeKey === "7d") return diffDays <= 7;
    if (rangeKey === "30d") return diffDays <= 30;
    if (rangeKey === "365d") return diffDays <= 365;
    return true;
};

/* 🕒 Filter pill cho khoảng thời gian */
const TimeRangeFilter = ({ value, onChange }) => (
    <div className="inline-flex items-center gap-1 bg-white/80 rounded-full p-1 shadow border border-[rgba(0,0,0,0.06)]">
        {RANGE_OPTIONS.map((opt) => {
            const active = value === opt.key;
            return (
                <button
                    key={opt.key}
                    type="button"
                    onClick={() => onChange(opt.key)}
                    className={
                        "px-3 py-1 text-xs font-semibold rounded-full transition " +
                        (active
                            ? "bg-[var(--primary)] text-white shadow-sm"
                            : "bg-transparent text-gray-700 hover:bg-[rgba(0,0,0,0.03)]")
                    }
                >
                    {opt.label}
                </button>
            );
        })}
    </div>
);

/* ========== DASHBOARD MOD ========== */
export const DashboardStats = () => {
    const { hotels } = useSelector((s) => s.hotel);
    const { rooms } = useSelector((s) => s.room);
    const { bookings } = useSelector((s) => s.booking);
    const { user } = useSelector((s) => s.auth);

    const [dateRange, setDateRange] = useState("all");

    /* ====== FILTER DATA THEO MOD (owner_id) ====== */

    // hotel thuộc về MOD
    const myHotels = useMemo(() => {
        if (!user || !hotels) return [];
        return hotels.filter((h) => {
            const ownerId =
                h.ownerId ??
                h.owner_id ??
                (h.owner && (h.owner.id ?? h.owner.userId));
            return ownerId === user.id;
        });
    }, [hotels, user]);

    const myHotelIds = useMemo(
        () => new Set(myHotels.map((h) => h.id ?? h.hotelId)),
        [myHotels]
    );

    // room thuộc các hotel của MOD
    const myRooms = useMemo(() => {
        if (!rooms || myHotelIds.size === 0) return [];
        return rooms.filter((r) => {
            const hid =
                r.hotelId ??
                (r.hotel && (r.hotel.id ?? r.hotel.hotelId));
            return myHotelIds.has(hid);
        });
    }, [rooms, myHotelIds]);

    const myRoomIds = useMemo(
        () => new Set(myRooms.map((r) => r.id ?? r.roomId)),
        [myRooms]
    );

    // booking có ít nhất 1 room thuộc myRooms
    const myBookings = useMemo(() => {
        if (!bookings || myRoomIds.size === 0) return [];
        return bookings.filter((b) => {
            if (Array.isArray(b.rooms) && b.rooms.length > 0) {
                return b.rooms.some((r) => {
                    const rid = r.id ?? r.roomId;
                    return myRoomIds.has(rid);
                });
            }
            // fallback: nếu BE gắn trực tiếp hotelId vào booking
            const hid =
                b.hotelId ??
                (b.hotel && (b.hotel.id ?? b.hotel.hotelId));
            return hid && myHotelIds.has(hid);
        });
    }, [bookings, myRoomIds, myHotelIds]);

    /* ========= Occupancy rate (chỉ tính room của MOD) ========= */
    const occupancy = useMemo(() => {
        if (!myRooms || myRooms.length === 0) {
            return { rate: 0, occupied: 0, totalRooms: 0 };
        }
        const today = new Date();
        const normalize = (val) => {
            if (!val) return null;
            const d = new Date(val);
            return Number.isNaN(d.getTime()) ? null : d;
        };
        const countRoomsInBooking = (b) => {
            if (Array.isArray(b.rooms) && b.rooms.length > 0) {
                // chỉ count room thuộc hotel của MOD
                return b.rooms.filter((r) => {
                    const rid = r.id ?? r.roomId;
                    return myRoomIds.has(rid);
                }).length;
            }
            return 1;
        };

        let occupied = 0;
        (myBookings || []).forEach((b) => {
            const checkIn = normalize(b.checkIn || b.check_in);
            const checkOut = normalize(b.checkOut || b.check_out);
            if (!checkIn || !checkOut) return;

            if (today >= checkIn && today <= checkOut) {
                if (b.status === "CANCELLED") return;
                occupied += countRoomsInBooking(b);
            }
        });

        const totalRooms = myRooms.length;
        const rate =
            totalRooms > 0 ? Math.min(100, Math.round((occupied / totalRooms) * 100)) : 0;
        return { rate, occupied, totalRooms };
    }, [myBookings, myRooms, myRoomIds]);

    const stats = [
        { title: "Rooms", value: myRooms.length, Icon: MdOutlineBedroomParent },
        { title: "Bookings", value: myBookings.length, Icon: BsCartFill },
        {
            title: "Occupancy",
            value: `${occupancy.rate}%`,
            Icon: MdOutlineBedroomParent,
            subtitle:
                occupancy.totalRooms > 0
                    ? `${occupancy.occupied}/${occupancy.totalRooms} rooms in use today`
                    : "No room data",
        },
    ];

    /* ======= DATA FOR CHARTS (chỉ dùng myBookings / myRooms) ======= */
    const fmtVND = (n) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
            n || 0
        );

    const monthKey = (d) =>
        [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ][new Date(d).getMonth()];

    const revenueData = useMemo(() => {
        const map = new Map();
        (myBookings || []).forEach((b) => {
            const dateVal =
                b.checkIn || b.check_in || b.createdAt || b.create_at || Date.now();
            if (!isInRange(dateVal, dateRange)) return;
            const k = monthKey(dateVal);
            map.set(k, (map.get(k) || 0) + Number(b.totalPrice || 0));
        });
        const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ];
        return months.map((m) => ({ month: m, revenue: map.get(m) || 0 }));
    }, [myBookings, dateRange]);

    const pieRaw = useMemo(() => {
        let paid = 0;
        let pending = 0;
        let cancelled = 0;

        (myBookings || []).forEach((b) => {
            const dateVal =
                b.checkIn || b.check_in || b.createdAt || b.create_at || Date.now();
            if (!isInRange(dateVal, dateRange)) return;

            if (b.status === "CANCELLED") {
                cancelled += 1;
            } else if (b.payment === true || b.status === "PAID") {
                paid += 1;
            } else {
                pending += 1;
            }
        });

        return [
            { name: "Paid", value: paid },
            { name: "Pending", value: pending },
            { name: "Cancelled", value: cancelled },
        ];
    }, [myBookings, dateRange]);

    const typeData = useMemo(() => {
        const counts = {};
        const push = (name) => {
            const canon = toCanonicalType(name);
            const key = canon || "other";
            counts[key] = (counts[key] || 0) + 1;
        };

        (myRooms || []).forEach((r) => {
            const v = r?.type;
            if (Array.isArray(v)) {
                v.forEach((t) => push(t));
            } else if (typeof v === "string") {
                v
                    .split(/[,;/|]+/)
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .forEach(push);
            } else if (v) {
                push(String(v));
            }
        });

        const entries = Object.entries(counts);
        entries.sort(([a], [b]) => {
            const ia = TYPE_ORDER.indexOf(a);
            const ib = TYPE_ORDER.indexOf(b);
            if (ia === -1 && ib === -1) return a.localeCompare(b);
            if (ia === -1) return 1;
            if (ib === -1) return -1;
            return ia - ib;
        });

        return entries.map(([k, count]) => ({
            type: k === "other" ? "Other" : k.replace(/\b\w/g, (ch) => ch.toUpperCase()),
            count,
        }));
    }, [myRooms]);

    const PRIMARY =
        (typeof window !== "undefined" &&
            getComputedStyle(document.documentElement)
                .getPropertyValue("--primary")
                ?.trim()) || "#86B817";
    const ACCENT = "#FFC30B";
    const PIE_COLORS = [PRIMARY, "#FE8800", "#FF7875"];

    const recentActivities = useMemo(() => {
        if (!myBookings || myBookings.length === 0) return [];

        const sorted = [...myBookings].sort((a, b) => {
            const da = new Date(
                a.checkIn || a.check_in || a.createdAt || a.create_at || 0
            ).getTime();
            const db = new Date(
                b.checkIn || b.check_in || b.createdAt || b.create_at || 0
            ).getTime();
            return db - da;
        });

        const formatDateShort = (raw) => {
            if (!raw) return "";
            const d = new Date(raw);
            if (Number.isNaN(d.getTime())) return "";
            return d.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
            });
        };

        return sorted.slice(0, 5).map((b) => {
            const dateLabel = formatDateShort(
                b.checkIn || b.check_in || b.createdAt || b.create_at
            );

            const statusLabel =
                b.status === "CANCELLED"
                    ? "Cancelled"
                    : b.payment
                        ? "Paid"
                        : "Pending";

            return {
                time: dateLabel,
                text: `Booking #${b.id ?? ""} • ${fmtVND(
                    Number(b.totalPrice || 0)
                )} • ${statusLabel}`,
            };
        });
    }, [myBookings]);

    const upcomingBookings = useMemo(() => {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const normalizeDateOnly = (val) => {
            if (!val) return null;
            const d = new Date(val);
            if (Number.isNaN(d.getTime())) return null;
            return new Date(d.getFullYear(), d.getMonth(), d.getDate());
        };
        const sameDate = (d1, d2) => d1 && d2 && d1.getTime() === d2.getTime();

        const todayDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );
        const tomorrowDate = new Date(
            tomorrow.getFullYear(),
            tomorrow.getMonth(),
            tomorrow.getDate()
        );

        const list = [];
        (myBookings || []).forEach((b) => {
            const ci = normalizeDateOnly(b.checkIn || b.check_in);
            const co = normalizeDateOnly(b.checkOut || b.check_out);

            if (sameDate(ci, todayDate)) {
                list.push({ type: "check-in", when: "Today", booking: b });
            } else if (sameDate(ci, tomorrowDate)) {
                list.push({ type: "check-in", when: "Tomorrow", booking: b });
            }

            if (sameDate(co, todayDate)) {
                list.push({ type: "check-out", when: "Today", booking: b });
            } else if (sameDate(co, tomorrowDate)) {
                list.push({ type: "check-out", when: "Tomorrow", booking: b });
            }
        });

        list.sort((a, b) => {
            const orderType = a.type === b.type ? 0 : a.type === "check-in" ? -1 : 1;
            const orderWhen = a.when === b.when ? 0 : a.when === "Today" ? -1 : 1;
            return orderWhen || orderType;
        });

        return list.slice(0, 6);
    }, [myBookings]);

    return (
        <div className="space-y-8">
            {/* 1) KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <StatBox
                        key={i}
                        title={s.title}
                        value={s.value}
                        Icon={s.Icon}
                        subtitle={s.subtitle}
                    />
                ))}
            </div>

            {/* 2) CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Line Chart */}
                <div className="lg:col-span-2 rounded-xl themed-card shadow p-4 w-full block min-w-0">
                    <div className="flex items-center justify-between mb-3 gap-3">
                        <h3 className="font-bold" style={{ color: "var(--text)" }}>
                            Revenue Overview
                        </h3>
                        <TimeRangeFilter value={dateRange} onChange={setDateRange} />
                    </div>
                    <AutoSizer height={320}>
                        {(w, h) => (
                            <LineChart width={w} height={h} data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis
                                    tickFormatter={(v) =>
                                        v >= 1_000_000 ? `${v / 1_000_000}M` : v
                                    }
                                />
                                <Tooltip formatter={(v) => fmtVND(v)} />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke={PRIMARY}
                                    strokeWidth={3}
                                    dot={false}
                                />
                            </LineChart>
                        )}
                    </AutoSizer>
                </div>

                {/* Pie Chart */}
                <div className="rounded-xl themed-card shadow p-4 w-full block min-w-0">
                    <h3 className="font-bold mb-3" style={{ color: "var(--text)" }}>
                        Booking Analytics
                    </h3>

                    {(() => {
                        const data = pieRaw;
                        const total = data.reduce((s, d) => s + d.value, 0);
                        if (total === 0) {
                            return (
                                <div className="flex flex-col items-center justify-center h-[320px] border rounded-lg">
                                    <span
                                        className="text-sm font-semibold"
                                        style={{ color: "var(--muted)" }}
                                    >
                                        No bookings in selected period
                                    </span>
                                    <Legend
                                        verticalAlign="bottom"
                                        align="center"
                                        layout="horizontal"
                                        iconType="circle"
                                        iconSize={10}
                                        wrapperStyle={{ marginTop: 8 }}
                                        payload={[
                                            {
                                                value: "Paid",
                                                color: PIE_COLORS[0],
                                                type: "circle",
                                                id: "paid",
                                            },
                                            {
                                                value: "Pending",
                                                color: PIE_COLORS[1],
                                                type: "circle",
                                                id: "pending",
                                            },
                                            {
                                                value: "Cancelled",
                                                color: PIE_COLORS[2],
                                                type: "circle",
                                                id: "cancelled",
                                            },
                                        ]}
                                    />
                                </div>
                            );
                        }

                        const renderLabel = ({ percent }) =>
                            percent > 0 ? `${(percent * 100).toFixed(0)}%` : "";

                        return (
                            <AutoSizer height={320}>
                                {(w, h) => (
                                    <PieChart width={w} height={h}>
                                        <Pie
                                            data={data}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={Math.min(w, h) * 0.24}
                                            outerRadius={Math.min(w, h) * 0.38}
                                            paddingAngle={2}
                                            labelLine={false}
                                            label={renderLabel}
                                        >
                                            {data.map((_, i) => (
                                                <Cell
                                                    key={i}
                                                    fill={PIE_COLORS[i % PIE_COLORS.length]}
                                                />
                                            ))}
                                        </Pie>
                                        <text
                                            x={w / 2}
                                            y={h / 2}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            style={{ fontWeight: 700, fill: "var(--text)" }}
                                        >
                                            {total}
                                        </text>
                                        <Legend
                                            verticalAlign="bottom"
                                            align="center"
                                            layout="horizontal"
                                            iconType="circle"
                                            iconSize={10}
                                        />
                                        <Tooltip />
                                    </PieChart>
                                )}
                            </AutoSizer>
                        );
                    })()}
                </div>

                {/* Bar Chart */}
                <div className="lg:col-span-3 rounded-xl themed-card shadow p-4 w-full block min-w-0">
                    <h3 className="font-bold mb-3" style={{ color: "var(--text)" }}>
                        Room Type Distribution
                    </h3>
                    <AutoSizer height={320}>
                        {(w, h) => (
                            <BarChart width={w} height={h} data={typeData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="type"
                                    interval={0}
                                    tickMargin={10}
                                    tick={{
                                        fill: "var(--text)",
                                        fontSize: 12,
                                        fontWeight: 600,
                                    }}
                                    tickFormatter={(v) =>
                                        v.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
                                    }
                                />
                                <YAxis allowDecimals={false} tick={{ fill: "var(--text)" }} />
                                <Tooltip
                                    labelFormatter={(v) =>
                                        v.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
                                    }
                                    formatter={(val) => [`${val}`, "Count"]}
                                />
                                <Bar dataKey="count" fill={ACCENT} radius={[8, 8, 0, 0]} />
                            </BarChart>
                        )}
                    </AutoSizer>
                </div>
            </div>

            {/* 3) RECENT ACTIVITIES + UPCOMING + QUICK ACTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <div className="rounded-xl themed-card shadow p-4 w-full block">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold" style={{ color: "var(--text)" }}>
                            Recent Activities
                        </h3>
                        <span className="text-sm" style={{ color: "var(--muted)" }}>
                            Latest updates from your bookings
                        </span>
                    </div>
                    <ul className="divide-y divide-gray-100">
                        {recentActivities.length === 0 ? (
                            <li className="py-3 px-2 text-sm" style={{ color: "var(--muted)" }}>
                                No activities yet.
                            </li>
                        ) : (
                            recentActivities.map((a, i) => (
                                <li
                                    key={i}
                                    className="py-3 flex items-start gap-3 group transition hover:bg-white/30 rounded-lg px-2"
                                >
                                    <span className="text-xs font-semibold bg-yellow-100/80 text-yellow-800 px-2 py-1 rounded-full min-w-[52px] text-center">
                                        {a.time}
                                    </span>
                                    <p
                                        className="text-sm transition group-hover:translate-x-0.5"
                                        style={{ color: "var(--text)" }}
                                    >
                                        {a.text}
                                    </p>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                {/* Right column: Upcoming + Quick Actions */}
                <div className="space-y-6">
                    {/* Upcoming */}
                    <div className="rounded-xl themed-card shadow p-4 w-full block">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold" style={{ color: "var(--text)" }}>
                                Upcoming Check-ins / Check-outs
                            </h3>
                        </div>
                        {upcomingBookings.length === 0 ? (
                            <p className="text-sm" style={{ color: "var(--muted)" }}>
                                No upcoming check-ins or check-outs.
                            </p>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {upcomingBookings.map((item, idx) => (
                                    <li
                                        key={idx}
                                        className="py-2 flex items-start gap-3 group transition hover:bg-white/30 rounded-lg px-2"
                                    >
                                        <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full min-w-[70px] text-center">
                                            {item.when}
                                        </span>
                                        <div className="flex-1">
                                            <p
                                                className="text-sm font-medium"
                                                style={{ color: "var(--text)" }}
                                            >
                                                {item.type === "check-in" ? "Check-in" : "Check-out"} •{" "}
                                                {`Booking #${item.booking.id || ""}`}
                                            </p>
                                            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                                                Amount: {fmtVND(Number(item.booking.totalPrice || 0))} •{" "}
                                                {item.booking.payment ? "Paid" : "Unpaid"}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="rounded-xl themed-card shadow p-4 w-full block">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold" style={{ color: "var(--text)" }}>
                                Quick Actions
                            </h3>
                            <span className="text-sm" style={{ color: "var(--muted)" }}>
                                Shortcuts
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                {
                                    title: "My Hotel",
                                    to: "/moderator/hotel",
                                    desc: "Manage your hotel info",
                                },
                                {
                                    title: "Rooms",
                                    to: "/moderator/rooms",
                                    desc: "Manage your rooms",
                                },
                                {
                                    title: "Bookings",
                                    to: "/moderator/bookings",
                                    desc: "View and manage bookings",
                                },
                                {
                                    title: "Back to site",
                                    to: "/",
                                    desc: "View public website",
                                },
                            ].map((x, i) => (
                                <Link
                                    key={i}
                                    to={x.to}
                                    className="group rounded-xl border border-white/40 bg-[rgba(255,255,176,0.7)] p-4 shadow hover:shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                >
                                    <p className="font-semibold text-gray-900 flex items-center gap-2">
                                        {x.title}
                                        <span className="inline-block transition group-hover:translate-x-0.5">
                                            ↗
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">{x.desc}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;
