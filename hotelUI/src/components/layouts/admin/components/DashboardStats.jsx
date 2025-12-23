import React, { useMemo, useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { LuUsers2, LuHotel } from "react-icons/lu";
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
  ResponsiveContainer,
} from "recharts";

/* ========= AutoSizer (fallback nếu bạn không dùng ResponsiveContainer) ========= */
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
    <div ref={ref} className={`w-full min-w-0 ${className}`} style={{ height }}>
      {w > 0 && children(w, height)}
    </div>
  );
};

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
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "365d", label: "1Y" },
  { key: "all", label: "ALL" },
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

/* ===== UI primitives (professional cards) ===== */
const Card = ({ className = "", children }) => (
  <div
    className={
      "rounded-2xl themed-card shadow-sm border border-white/20 bg-white/10 backdrop-blur " +
      "transition hover:shadow-md " +
      className
    }
  >
    {children}
  </div>
);

const CardHeader = ({ title, subtitle, right }) => (
  <div className="flex items-start justify-between gap-3 p-5 pb-3">
    <div>
      <h3 className="text-[15px] font-bold" style={{ color: "var(--text)" }}>
        {title}
      </h3>
      {subtitle && (
        <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
          {subtitle}
        </p>
      )}
    </div>
    {right}
  </div>
);

const Divider = () => <div className="h-px bg-black/5 mx-5" />;

const Badge = ({ children, tone = "neutral" }) => {
  const tones = {
    neutral: "bg-black/5 text-gray-700",
    success: "bg-green-100 text-green-800",
    warn: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-700",
    primary: "bg-[rgba(134,184,23,0.15)] text-[var(--primary)]",
  };
  return (
    <span
      className={
        "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold " +
        (tones[tone] || tones.neutral)
      }
    >
      {children}
    </span>
  );
};

const IconPill = ({ Icon }) => (
  <span
    className="inline-flex items-center justify-center w-10 h-10 rounded-2xl"
    style={{
      background: "rgba(134,184,23,0.14)",
      color: "var(--primary)",
    }}
  >
    <Icon className="w-5 h-5" />
  </span>
);

/* ===== KPI Card ===== */
const KPICard = ({ title, value, Icon, subtitle, extraRight }) => (
  <Card className="p-5">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <IconPill Icon={Icon} />
        <div>
          <p className="text-xs font-semibold" style={{ color: "var(--muted)" }}>
            {title}
          </p>
          <p
            className="text-2xl font-extrabold tracking-tight mt-1"
            style={{ color: "var(--text)" }}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {extraRight}
    </div>
  </Card>
);

/* ===== Filter pills ===== */
const TimeRangeFilter = ({ value, onChange }) => (
  <div className="inline-flex items-center gap-1 rounded-full p-1 border border-black/5 bg-white/70 shadow-sm">
    {RANGE_OPTIONS.map((opt) => {
      const active = value === opt.key;
      return (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={
            "px-3 py-1 text-[11px] font-extrabold rounded-full transition " +
            (active
              ? "bg-[var(--primary)] text-white shadow"
              : "text-gray-700 hover:bg-black/5")
          }
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

/* ===== Dashboard ===== */
export const DashboardStats = () => {
  const { users } = useSelector((s) => s.user);
  const { hotels } = useSelector((s) => s.hotel);
  const { rooms } = useSelector((s) => s.room);
  const { bookings } = useSelector((s) => s.booking);

  const [dateRange, setDateRange] = useState("all");

  const PRIMARY =
    (typeof window !== "undefined" &&
      getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        ?.trim()) || "#86B817";
  const ACCENT = "#FFC30B";
  const PIE_COLORS = [PRIMARY, "#FE8800", "#FF7875"];

  const fmtVND = (n) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n || 0);

  /* ========= Occupancy (theo booking hôm nay) ========= */
  const occupancy = useMemo(() => {
    if (!rooms || rooms.length === 0) {
      return { rate: 0, occupied: 0, totalRooms: 0 };
    }
    const today = new Date();

    const normalize = (val) => {
      if (!val) return null;
      const d = new Date(val);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    const countRoomsInBooking = (b) => {
      if (Array.isArray(b.rooms) && b.rooms.length > 0) return b.rooms.length;
      return 1;
    };

    let occupied = 0;
    (bookings || []).forEach((b) => {
      const checkIn = normalize(b.checkIn || b.check_in);
      const checkOut = normalize(b.checkOut || b.check_out);
      if (!checkIn || !checkOut) return;

      if (today >= checkIn && today <= checkOut) {
        if (b.status === "CANCELLED") return;
        occupied += countRoomsInBooking(b);
      }
    });

    const totalRooms = rooms.length;
    const rate =
      totalRooms > 0 ? Math.min(100, Math.round((occupied / totalRooms) * 100)) : 0;
    return { rate, occupied, totalRooms };
  }, [bookings, rooms]);

  const monthKey = (d) =>
    ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][
    new Date(d).getMonth()
    ];

  /* ===== Revenue by month (lọc theo dateRange) ===== */
  const revenueData = useMemo(() => {
    const map = new Map();
    (bookings || []).forEach((b) => {
      const dateVal = b.checkIn || b.check_in || b.createdAt || b.create_at || Date.now();
      if (!isInRange(dateVal, dateRange)) return;
      const k = monthKey(dateVal);
      map.set(k, (map.get(k) || 0) + Number(b.totalPrice || 0));
    });
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((m) => ({ month: m, revenue: map.get(m) || 0 }));
  }, [bookings, dateRange]);

  /* ===== Booking Analytics (lọc theo dateRange) ===== */
  const pieRaw = useMemo(() => {
    let paid = 0;
    let pending = 0;
    let cancelled = 0;

    (bookings || []).forEach((b) => {
      const dateVal = b.checkIn || b.check_in || b.createdAt || b.create_at || Date.now();
      if (!isInRange(dateVal, dateRange)) return;

      if (b.status === "CANCELLED") cancelled += 1;
      else if (b.payment === true || b.status === "PAID") paid += 1;
      else pending += 1;
    });

    return [
      { name: "Paid", value: paid },
      { name: "Pending", value: pending },
      { name: "Cancelled", value: cancelled },
    ];
  }, [bookings, dateRange]);

  /* ===== Room Type Distribution ===== */
  const typeData = useMemo(() => {
    const counts = {};
    const push = (name) => {
      const canon = toCanonicalType(name);
      const key = canon || "other";
      counts[key] = (counts[key] || 0) + 1;
    };

    (rooms || []).forEach((r) => {
      const v = r?.type;
      if (Array.isArray(v)) v.forEach((t) => push(t));
      else if (typeof v === "string") {
        v.split(/[,;/|]+/)
          .map((t) => t.trim())
          .filter(Boolean)
          .forEach(push);
      } else if (v) push(String(v));
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
  }, [rooms]);

  /* ===== Recent Activities ===== */
  const recentActivities = useMemo(() => {
    if (!bookings || bookings.length === 0) return [];

    const sorted = [...bookings].sort((a, b) => {
      const da = new Date(a.checkIn || a.check_in || a.createdAt || a.create_at || 0).getTime();
      const db = new Date(b.checkIn || b.check_in || b.createdAt || b.create_at || 0).getTime();
      return db - da;
    });

    const formatDateShort = (raw) => {
      if (!raw) return "";
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    };

    return sorted.slice(0, 6).map((b) => {
      const dateLabel = formatDateShort(b.checkIn || b.check_in || b.createdAt || b.create_at);

      const statusLabel =
        b.status === "CANCELLED" ? { t: "Cancelled", tone: "danger" } : b.payment
          ? { t: "Paid", tone: "success" }
          : { t: "Pending", tone: "warn" };

      return {
        time: dateLabel,
        id: b.id ?? "",
        amount: fmtVND(Number(b.totalPrice || 0)),
        status: statusLabel,
      };
    });
  }, [bookings]);

  /* ===== Upcoming check-ins / check-outs (Today & Tomorrow) ===== */
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

    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowDate = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

    const list = [];
    (bookings || []).forEach((b) => {
      const ci = normalizeDateOnly(b.checkIn || b.check_in);
      const co = normalizeDateOnly(b.checkOut || b.check_out);

      if (sameDate(ci, todayDate)) list.push({ type: "check-in", when: "Today", booking: b });
      else if (sameDate(ci, tomorrowDate)) list.push({ type: "check-in", when: "Tomorrow", booking: b });

      if (sameDate(co, todayDate)) list.push({ type: "check-out", when: "Today", booking: b });
      else if (sameDate(co, tomorrowDate)) list.push({ type: "check-out", when: "Tomorrow", booking: b });
    });

    list.sort((a, b) => {
      const orderWhen = a.when === b.when ? 0 : a.when === "Today" ? -1 : 1;
      const orderType = a.type === b.type ? 0 : a.type === "check-in" ? -1 : 1;
      return orderWhen || orderType;
    });

    return list.slice(0, 8);
  }, [bookings]);

  /* ===== Top summary (optional: sum revenue in range) ===== */
  const totalRevenueInRange = useMemo(() => {
    let sum = 0;
    (bookings || []).forEach((b) => {
      const dateVal = b.checkIn || b.check_in || b.createdAt || b.create_at || Date.now();
      if (!isInRange(dateVal, dateRange)) return;
      if (b.status === "CANCELLED") return;
      sum += Number(b.totalPrice || 0);
    });
    return sum;
  }, [bookings, dateRange]);

  return (
    <div className="space-y-6">
      {/* ===== Header ===== */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold" style={{ color: "var(--text)" }}>
            Admin Dashboard
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            Overview of system metrics, revenue, bookings, and operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge tone="primary">Range: {dateRange.toUpperCase()}</Badge>
          <Badge tone="neutral">Revenue: {fmtVND(totalRevenueInRange)}</Badge>
        </div>
      </div>

      {/* ===== KPI Grid ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <KPICard title="Users" value={users.length} Icon={LuUsers2} subtitle="Registered accounts" />
        <KPICard title="Hotels" value={hotels.length} Icon={LuHotel} subtitle="Listed properties" />
        <KPICard title="Rooms" value={rooms.length} Icon={MdOutlineBedroomParent} subtitle="Total inventory" />
        <KPICard title="Bookings" value={bookings.length} Icon={BsCartFill} subtitle="All orders" />
        <KPICard
          title="Occupancy"
          value={`${occupancy.rate}%`}
          Icon={MdOutlineBedroomParent}
          subtitle={
            occupancy.totalRooms > 0
              ? `${occupancy.occupied}/${occupancy.totalRooms} rooms in use today`
              : "No room data"
          }
          extraRight={<Badge tone={occupancy.rate >= 70 ? "success" : occupancy.rate >= 40 ? "warn" : "neutral"}>
            {occupancy.rate >= 70 ? "High" : occupancy.rate >= 40 ? "Normal" : "Low"}
          </Badge>}
        />
      </div>

      {/* ===== Charts ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Revenue Overview"
            subtitle="Monthly revenue (filtered by range)"
            right={<TimeRangeFilter value={dateRange} onChange={setDateRange} />}
          />
          <Divider />
          <div className="p-5 pt-4">
            <div className="h-[320px] w-full">
              {/* Nếu bạn muốn đơn giản hơn, dùng ResponsiveContainer */}
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => (v >= 1_000_000 ? `${v / 1_000_000}M` : v)} />
                  <Tooltip formatter={(v) => fmtVND(v)} />
                  <Line type="monotone" dataKey="revenue" stroke={PRIMARY} strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Booking Analytics */}
        <Card>
          <CardHeader
            title="Booking Analytics"
            subtitle="Paid vs Pending vs Cancelled"
            right={<Badge tone="neutral">{pieRaw.reduce((s, d) => s + d.value, 0)} total</Badge>}
          />
          <Divider />
          <div className="p-5 pt-4">
            {(() => {
              const total = pieRaw.reduce((s, d) => s + d.value, 0);
              if (total === 0) {
                return (
                  <div className="h-[320px] flex flex-col items-center justify-center rounded-2xl border border-black/5 bg-white/30">
                    <p className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
                      No bookings in selected period
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge tone="success">Paid</Badge>
                      <Badge tone="warn">Pending</Badge>
                      <Badge tone="danger">Cancelled</Badge>
                    </div>
                  </div>
                );
              }

              const renderLabel = ({ percent }) => (percent > 0 ? `${(percent * 100).toFixed(0)}%` : "");

              return (
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieRaw}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius="58%"
                        outerRadius="78%"
                        paddingAngle={2}
                        labelLine={false}
                        label={renderLabel}
                      >
                        {pieRaw.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" align="center" layout="horizontal" iconType="circle" iconSize={10} />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              );
            })()}
          </div>
        </Card>

        {/* Room Types */}
        <Card className="lg:col-span-3">
          <CardHeader title="Room Type Distribution" subtitle="Inventory composition by type" />
          <Divider />
          <div className="p-5 pt-4">
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="type"
                    interval={0}
                    tickMargin={10}
                    tick={{ fill: "var(--text)", fontSize: 12, fontWeight: 700 }}
                  />
                  <YAxis allowDecimals={false} tick={{ fill: "var(--text)" }} />
                  <Tooltip formatter={(val) => [`${val}`, "Count"]} />
                  <Bar dataKey="count" fill={ACCENT} radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>

      {/* ===== Bottom sections ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Activities */}
        <Card>
          <CardHeader title="Recent Activities" subtitle="Latest updates from bookings" />
          <Divider />
          <div className="p-5">
            {recentActivities.length === 0 ? (
              <div className="rounded-2xl border border-black/5 bg-white/30 p-4 text-sm" style={{ color: "var(--muted)" }}>
                No activities yet.
              </div>
            ) : (
              <ul className="space-y-2">
                {recentActivities.map((a, i) => (
                  <li
                    key={i}
                    className="rounded-2xl border border-black/5 bg-white/30 px-4 py-3 flex items-start justify-between gap-3
                               transition hover:bg-white/50"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge tone="neutral">{a.time}</Badge>
                        <Badge tone={a.status.tone}>{a.status.t}</Badge>
                      </div>
                      <p className="text-sm font-semibold mt-2 truncate" style={{ color: "var(--text)" }}>
                        Booking #{a.id}
                      </p>
                      <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                        Amount: {a.amount}
                      </p>
                    </div>
                    <span className="text-lg opacity-60">↗</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        {/* Upcoming + Quick Actions */}
        <div className="space-y-5">
          {/* Upcoming */}
          <Card>
            <CardHeader title="Upcoming Check-ins / Check-outs" subtitle="Today & Tomorrow" />
            <Divider />
            <div className="p-5">
              {upcomingBookings.length === 0 ? (
                <div className="rounded-2xl border border-black/5 bg-white/30 p-4 text-sm" style={{ color: "var(--muted)" }}>
                  No upcoming check-ins or check-outs.
                </div>
              ) : (
                <ul className="space-y-2">
                  {upcomingBookings.map((item, idx) => {
                    const paid = !!item.booking.payment;
                    return (
                      <li
                        key={idx}
                        className="rounded-2xl border border-black/5 bg-white/30 px-4 py-3 flex items-start gap-3
                                   transition hover:bg-white/50"
                      >
                        <div className="flex flex-col gap-1">
                          <Badge tone={item.when === "Today" ? "success" : "neutral"}>{item.when}</Badge>
                          <Badge tone={item.type === "check-in" ? "primary" : "neutral"}>
                            {item.type === "check-in" ? "Check-in" : "Check-out"}
                          </Badge>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>
                            Booking #{item.booking.id || ""}
                          </p>
                          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                            Amount: {fmtVND(Number(item.booking.totalPrice || 0))}
                          </p>
                        </div>

                        <Badge tone={paid ? "success" : "warn"}>{paid ? "Paid" : "Unpaid"}</Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </Card>

          {/* Quick actions */}
          <Card>
            <CardHeader title="Quick Actions" subtitle="Shortcuts to key pages" />
            <Divider />
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { title: "Add Hotel", to: "/admin/hotels", desc: "Create new hotel" },
                  { title: "Add Room", to: "/admin/rooms", desc: "Create new room" },
                  { title: "View Bookings", to: "/admin/bookings", desc: "Manage orders" },
                  { title: "Users", to: "/admin/users", desc: "Manage users" },
                ].map((x, i) => (
                  <Link
                    key={i}
                    to={x.to}
                    className="group rounded-2xl border border-black/5 bg-white/40 p-4 shadow-sm
                               hover:shadow-md hover:-translate-y-0.5 transition
                               focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <p className="font-extrabold text-[13px] text-gray-900 flex items-center justify-between">
                      {x.title}
                      <span className="opacity-60 group-hover:opacity-100 transition">↗</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{x.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
