// src/components/ui/home/Discount.jsx
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RoomCard } from "@/components/ui/Room/RoomCard";
import { fetchAllRoom } from "@/store/room/thunk";

import "swiper/css";
import "swiper/css/autoplay";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

/** Convert discount safely */
const getDiscountValue = (room) => {
  const raw = room?.discountPercent ?? room?.discount_percent ?? room?.discount ?? 0;
  const num = Number(raw);
  return Number.isFinite(num) && num > 0 ? num : 0;
};

/** Parse date robustly (supports YYYY-MM-DD, ISO, Date, timestamp) */
const parseDateOnly = (v) => {
  if (!v) return null;

  if (v instanceof Date && !Number.isNaN(v.getTime())) {
    const d = new Date(v);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  if (typeof v === "number") {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const s = String(v).trim();
  const ymd = s.slice(0, 10);

  if (/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    const d = new Date(`${ymd}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const d2 = new Date(s);
  if (Number.isNaN(d2.getTime())) return null;
  d2.setHours(0, 0, 0, 0);
  return d2;
};

/**
 * STRICT: sale chỉ khi:
 * - percent > 0
 * - có đủ start + end
 * - hôm nay nằm trong [start, end]
 */
const isDiscountActiveToday = (room) => {
  const percent = getDiscountValue(room);
  if (percent <= 0) return false;

  const startRaw = room?.discountStart ?? room?.discount_start;
  const endRaw = room?.discountEnd ?? room?.discount_end;

  if (!startRaw || !endRaw) return false;

  const start = parseDateOnly(startRaw);
  const end = parseDateOnly(endRaw);
  if (!start || !end) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return today >= start && today <= end;
};

/** Dedupe rooms by id (tránh API trả trùng hoặc state merge bị trùng) */
const uniqueById = (arr) => {
  const map = new Map();
  for (const it of arr) {
    const id = it?.id ?? it?._id;
    if (id == null) continue;
    if (!map.has(String(id))) map.set(String(id), it);
  }
  return Array.from(map.values());
};

export const Discount = () => {
  const dispatch = useDispatch();
  const { rooms = [] } = useSelector((s) => s.room || {});

  useEffect(() => {
    if (!rooms || rooms.length === 0) dispatch(fetchAllRoom());
  }, [rooms?.length, dispatch]);

  const discountedRooms = useMemo(() => {
    if (!Array.isArray(rooms)) return [];

    // 1) dedupe trước
    const deduped = uniqueById(rooms);

    // 2) map + filter strict theo ngày
    const active = deduped
      .map((r) => ({ ...r, discountPercent: getDiscountValue(r) }))
      .filter((r) => isDiscountActiveToday(r))
      .sort((a, b) => b.discountPercent - a.discountPercent);

    return active;
  }, [rooms]);

  // ===== DEBUG: in ra số lượng + unique ids =====
  useEffect(() => {
    const DEBUG = true;
    if (!DEBUG) return;

    const ids = discountedRooms.map((r) => String(r.id));
    const uniqueIds = Array.from(new Set(ids));

    console.log("[Discount] rooms total:", Array.isArray(rooms) ? rooms.length : 0);
    console.log("[Discount] discountedRooms count:", discountedRooms.length);
    console.log("[Discount] discountedRooms unique ids:", uniqueIds.length);
    console.log("[Discount] ids:", uniqueIds);

    console.table(
      discountedRooms.map((r) => ({
        id: r.id,
        name: r.name,
        percent: r.discountPercent,
        start: r.discountStart ?? r.discount_start,
        end: r.discountEnd ?? r.discount_end,
      }))
    );
  }, [rooms, discountedRooms]);

  if (!discountedRooms.length) return null;

  return (
    <div className="container-xxl py-4 destination">
      <div className="container">
        {/* ===== HEADING (SB style) ===== */}
        <div className="text-center">
          <div className="sb-heading sb-heading--md mx-auto">
            <span className="sb-heading__lines sb-heading__lines--left">
              <span className="sb-heading__line sb-heading__line--long" />
              <span className="sb-heading__line sb-heading__line--short" />
            </span>

            <h6
              className="sb-heading__label"
              style={{ fontSize: "26px", fontWeight: 900, letterSpacing: "0.18em" }}
            >
              DISCOUNT
            </h6>

            <span className="sb-heading__lines sb-heading__lines--right">
              <span className="sb-heading__line sb-heading__line--long" />
              <span className="sb-heading__line sb-heading__line--short" />
            </span>
          </div>

          <h1 className="mt-1 mb-3" style={{ fontSize: "28px" }}>
            Save big today!
          </h1>
        </div>

        {/* ===== SWIPER Compact ===== */}
        <Swiper
          modules={[Autoplay]}
          loop
          speed={850}
          autoplay={{
            delay: 2400,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          spaceBetween={16}
          style={{ padding: "2px 0 14px" }}
          breakpoints={{
            0: { slidesPerView: 1.05 },
            480: { slidesPerView: 1.6 },
            768: { slidesPerView: 2.3 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          className="home-discount-swiper"
        >
          {discountedRooms.map((room, idx) => (
            <SwiperSlide key={`${room.id}-${idx}`} className="!h-auto">
              <RoomCard
                room={room}
                hotelId={room.hotel?.id ?? room.hotel_id ?? null}
                hotelName={room.hotel?.name ?? room.hotelName}
                isAvailableToday={true}
                linkToHotel={true}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};
