import React, { useMemo, useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { LuUsers2, LuHotel } from "react-icons/lu";
import { MdOutlineBedroomParent } from "react-icons/md";
import { BsCartFill } from "react-icons/bs";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";

/* ========= AutoSizer: đo width cha bằng ResizeObserver ========= */
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
    <div ref={ref} className={`w-full block min-w-0 ${className}`} style={{ height }}>
      {w > 0 && children(w, height)}
    </div>
  );
};

/* ========== STAT BOX ========== */
const StatBox = ({ title, value, Icon }) => (
  <div className="stats shadow themed-card rounded-xl transition hover:shadow-lg">
    <div className="stat p-4">
      <div className="stat-figure" style={{ color: "var(--primary)" }}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="stat-title" style={{ color: "var(--muted)" }}>{title}</div>
      <div className="stat-value" style={{ color: "var(--text)" }}>{value}</div>
    </div>
  </div>
);

/* ===== Helpers cho Room Type (chuẩn hoá alias/loại rác) ===== */
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
  if (["abc", "room", "type", "na", "unknown"].includes(token) || token.length < 3) return "other";
  return token;
};

// Thứ tự hiển thị cố định theo danh mục chuẩn
const TYPE_ORDER = [
  "standard", "deluxe", "suite", "superior", "luxury", "vip", "budget", "economy", "duplex", "premium", "compact", "other"
];

/* ========== DASHBOARD MAIN ========== */
export const DashboardStats = () => {
  const { users } = useSelector((s) => s.user);
  const { hotels } = useSelector((s) => s.hotel);
  const { rooms } = useSelector((s) => s.room);
  const { bookings } = useSelector((s) => s.booking);

  const stats = [
    { title: "Users", value: users.length, Icon: LuUsers2 },
    { title: "Hotels", value: hotels.length, Icon: LuHotel },
    { title: "Rooms", value: rooms.length, Icon: MdOutlineBedroomParent },
    { title: "Bookings", value: bookings.length, Icon: BsCartFill },
  ];

  /* ======= DATA FOR CHARTS ======= */
  const fmtVND = (n) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
  const monthKey = (d) => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][new Date(d).getMonth()];

  // Revenue by month
  const revenueData = useMemo(() => {
    const map = new Map();
    (bookings || []).forEach((b) => {
      const k = monthKey(b.checkIn || b.createdAt || Date.now());
      map.set(k, (map.get(k) || 0) + Number(b.totalPrice || 0));
    });
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((m) => ({ month: m, revenue: map.get(m) || 0 }));
  }, [bookings]);

  // Booking Analytics
  const pieRaw = useMemo(() => {
    const paid = (bookings || []).filter((b) => b.payment === true || b.status === "PAID").length;
    const pending = (bookings || []).filter((b) => b.payment === false || b.status === "PENDING").length;
    const cancelled = (bookings || []).filter((b) => b.status === "CANCELLED").length;
    return [
      { name: "Paid", value: paid },
      { name: "Pending", value: pending },
      { name: "Cancelled", value: cancelled },
    ];
  }, [bookings]);

  // Room Type Distribution – chuẩn hoá & KHÔNG gộp top N, sắp theo TYPE_ORDER
  const typeData = useMemo(() => {
    const counts = {};
    const push = (name) => {
      const canon = toCanonicalType(name);
      const key = canon || "other";
      counts[key] = (counts[key] || 0) + 1;
    };

    (rooms || []).forEach((r) => {
      const v = r?.type;
      if (Array.isArray(v)) {
        v.forEach((t) => push(t));
      } else if (typeof v === "string") {
        v.split(/[,;/|]+/).map((t) => t.trim()).filter(Boolean).forEach(push);
      } else if (v) {
        push(String(v));
      }
    });

    // đưa về mảng
    const entries = Object.entries(counts);

    // sort theo thứ tự cố định; loại nào không có trong order sẽ để cuối
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

  // Colors
  const PRIMARY =
    (typeof window !== "undefined" &&
      getComputedStyle(document.documentElement).getPropertyValue("--primary")?.trim()) ||
    "#86B817";
  const ACCENT = "#FFC30B";
  const PIE_COLORS = [PRIMARY, "#FE8800", "#FF7875"];

  // Recent Activities (demo)
  const recentActivities = useMemo(() => {
    const acts = [];
    (bookings || []).slice(-3).reverse().forEach((b, i) => {
      acts.push({
        time: i === 0 ? "2m" : i === 1 ? "12m" : "1h",
        text: `Booking #${b.id || ""} • ${fmtVND(Number(b.totalPrice || 0))} • ${b.payment ? "Paid" : "Pending"}`,
      });
    });
    if (acts.length < 5) {
      acts.push(
        { time: "50m", text: "Room #321 set to unavailable" },
        { time: "2h", text: "Payment received: ₫2.300.000" }
      );
    }
    return acts.slice(0, 5);
  }, [bookings]);

  return (
    <div className="space-y-8">
      {/* 1) KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatBox key={i} title={s.title} value={s.value} Icon={s.Icon} />
        ))}
      </div>

      {/* 2) CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="lg:col-span-2 rounded-xl themed-card shadow p-4 w-full block min-w-0">
          <h3 className="font-bold mb-3" style={{ color: "var(--text)" }}>Revenue Overview</h3>
          <AutoSizer height={320}>
            {(w, h) => (
              <LineChart width={w} height={h} data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => (v >= 1_000_000 ? `${v / 1_000_000}M` : v)} />
                <Tooltip formatter={(v) => fmtVND(v)} />
                <Line type="monotone" dataKey="revenue" stroke={PRIMARY} strokeWidth={3} dot={false} />
              </LineChart>
            )}
          </AutoSizer>
        </div>

        {/* Pie Chart (Donut + Empty State) */}
        <div className="rounded-xl themed-card shadow p-4 w-full block min-w-0">
          <h3 className="font-bold mb-3" style={{ color: "var(--text)" }}>Booking Analytics</h3>

          {(() => {
            const data = pieRaw;
            const total = data.reduce((s, d) => s + d.value, 0);
            if (total === 0) {
              return (
                <div className="flex flex-col items-center justify-center h-[320px] border rounded-lg">
                  <span className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
                    No bookings yet
                  </span>
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    layout="horizontal"
                    iconType="circle"
                    iconSize={10}
                    wrapperStyle={{ marginTop: 8 }}
                    payload={[
                      { value: "Paid", color: PIE_COLORS[0], type: "circle", id: "paid" },
                      { value: "Pending", color: PIE_COLORS[1], type: "circle", id: "pending" },
                      { value: "Cancelled", color: PIE_COLORS[2], type: "circle", id: "cancelled" },
                    ]}
                  />
                </div>
              );
            }

            const renderLabel = ({ percent }) => (percent > 0 ? `${(percent * 100).toFixed(0)}%` : "");

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
                      {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
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
                    <Legend verticalAlign="bottom" align="center" layout="horizontal" iconType="circle" iconSize={10} />
                    <Tooltip />
                  </PieChart>
                )}
              </AutoSizer>
            );
          })()}
        </div>

        {/* Bar Chart */}
        <div className="lg:col-span-3 rounded-xl themed-card shadow p-4 w-full block min-w-0">
          <h3 className="font-bold mb-3" style={{ color: "var(--text)" }}>Room Type Distribution</h3>
          <AutoSizer height={320}>
            {(w, h) => (
              <BarChart width={w} height={h} data={typeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="type"
                  interval={0}
                  tickMargin={10}
                  tick={{
                    fill: "var(--text)",   // màu chữ theo theme
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                  tickFormatter={(v) =>
                    v
                      .toLowerCase()
                      .replace(/\b\w/g, (c) => c.toUpperCase()) // Capitalize
                  }
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--text)" }}
                />
                <Tooltip
                  labelFormatter={(v) =>
                    v
                      .toLowerCase()
                      .replace(/\b\w/g, (c) => c.toUpperCase())
                  }
                  formatter={(val) => [`${val}`, "Count"]}
                />
                <Bar
                  dataKey="count"
                  fill={ACCENT}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>

            )}
          </AutoSizer>
        </div>
      </div>

      {/* 3) RECENT ACTIVITIES + QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="rounded-xl themed-card shadow p-4 w-full block">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold" style={{ color: "var(--text)" }}>Recent Activities</h3>
            <span className="text-sm" style={{ color: "var(--muted)" }}>Last 24 hours</span>
          </div>
          <ul className="divide-y divide-gray-100">
            {useMemo(() => {
              const list = [];
              (bookings || []).slice(-3).reverse().forEach((b, i) => {
                list.push({
                  time: i === 0 ? "2m" : i === 1 ? "12m" : "1h",
                  text: `Booking #${b.id || ""} • ${fmtVND(Number(b.totalPrice || 0))} • ${b.payment ? "Paid" : "Pending"}`,
                });
              });
              if (list.length < 5) {
                list.push(
                  { time: "50m", text: "Room #321 set to unavailable" },
                  { time: "2h", text: "Payment received: ₫2.300.000" }
                );
              }
              return list.slice(0, 5);
            }, [bookings]).map((a, i) => (
              <li key={i} className="py-3 flex items-start gap-3 group transition hover:bg-white/30 rounded-lg px-2">
                <span className="text-xs font-semibold bg-yellow-100/80 text-yellow-800 px-2 py-1 rounded-full min-w-[42px] text-center">
                  {a.time}
                </span>
                <p className="text-sm transition group-hover:translate-x-0.5" style={{ color: "var(--text)" }}>
                  {a.text}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl themed-card shadow p-4 w-full block">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold" style={{ color: "var(--text)" }}>Quick Actions</h3>
            <span className="text-sm" style={{ color: "var(--muted)" }}>Shortcuts</span>
          </div>
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
                className="group rounded-xl border border-white/40 bg-[rgba(255,255,176,0.7)] p-4 shadow hover:shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  {x.title}
                  <span className="inline-block transition group-hover:translate-x-0.5">↗</span>
                </p>
                <p className="text-xs text-gray-600 mt-1">{x.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
