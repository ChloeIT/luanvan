// src/components/ui/hotel/HotelDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { RoomCard } from "@/components/ui/Room/RoomCard";
import { CompareButton } from "@/components/ui/compare/CompareButton";

// Icons
import { FaStar } from "react-icons/fa6";
import { IoLocation } from "react-icons/io5";
import { FaConciergeBell } from "react-icons/fa";

// Nearby
import { HotelNearby } from "./nearby";

/* ===================== Config ===================== */
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "";
const RAW_API_URL = (import.meta.env.VITE_HOTEL_API || "").replace(/\/+$/, "");
const ROOM_API_BASE = RAW_API_URL ? `${RAW_API_URL}/api/room` : "/api/room";
const HERO_H = 420;

/* ===================== Helpers ===================== */
const toId = (v) => (v == null ? "" : String(v));

const buildAvailableUrl = (hotelId, checkInISO, checkOutISO) => {
  const checkIn = encodeURIComponent(checkInISO);
  const checkOut = encodeURIComponent(checkOutISO);
  return `${ROOM_API_BASE}/hotel/${hotelId}/available?checkIn=${checkIn}&checkOut=${checkOut}`;
};

const getTodayRangeISO = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  return { startISO: start.toISOString(), endISO: end.toISOString() };
};

/* ===================== UI styles ===================== */
const pillRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  marginTop: 18,
  flexWrap: "wrap", // mobile tự xuống dòng
};

const pillStyle = {
  display: "flex",
  alignItems: "flex-start",      // ✅ icon top khi text xuống dòng
  gap: 10,
  padding: "12px 16px",
  borderRadius: 18,
  background: "#F8FFD8",
  border: "1px solid rgba(134,184,23,0.35)",
  boxShadow: "0 6px 14px rgba(0,0,0,.06)",
  fontSize: 15,
  fontWeight: 650,
  color: "#1f2937",

  width: "100%",                 // ✅ pill dài hết cột
  maxWidth: "100%",              // ✅ không bị giới hạn
};


const iconWrapStyle = {
  width: 26,
  height: 26,
  borderRadius: 999,
  display: "grid",
  placeItems: "center",
  background: "rgba(134,184,23,0.16)",
  color: "#86B817",
  flex: "0 0 auto",
};

export function HotelDetail({ rooms: roomsProp, hotel: hotelProp, showHeader = true }) {
  const { hotels } = useSelector((s) => s.hotel);
  const { rooms: allRooms } = useSelector((s) => s.room);
  const { myFavorite } = useSelector((s) => s.favorite);
  const { id: routeId } = useParams();

  /* ========= CURRENT HOTEL ========= */
  const hotel = useMemo(() => {
    if (hotelProp) return hotelProp;
    if (!routeId) return undefined;
    return hotels.find((h) => toId(h?.id) === toId(routeId));
  }, [hotelProp, routeId, hotels]);

  /* ========= ROOMS LIST ========= */
  const rooms = useMemo(() => {
    if (Array.isArray(roomsProp) && roomsProp.length) return roomsProp;
    if (!hotel || !Array.isArray(allRooms)) return [];

    const hid = toId(hotel.id);
    return allRooms.filter((r) => {
      const roomHotelId = r?.hotel?.id ?? r?.hotelId ?? r?.hotel_id ?? null;
      return roomHotelId != null && toId(roomHotelId) === hid;
    });
  }, [roomsProp, hotel, allRooms]);

  /* ========= AVAILABLE TODAY ========= */
  const [availableTodayIds, setAvailableTodayIds] = useState(null);

  useEffect(() => {
    if (!hotel?.id) return;

    const { startISO, endISO } = getTodayRangeISO();
    const url = buildAvailableUrl(hotel.id, startISO, endISO);

    let cancelled = false;

    fetch(url)
      .then((res) => res.ok && res.json())
      .then((data) => {
        if (cancelled) return;
        const ids = Array.isArray(data) ? data.map((r) => r?.id).filter(Boolean) : [];
        setAvailableTodayIds(ids);
      })
      .catch(() => !cancelled && setAvailableTodayIds(null));

    return () => {
      cancelled = true;
    };
  }, [hotel?.id]);

  /* ========= HIGHLIGHTS: 3 REAL INFO ========= */
  const highlights = useMemo(() => {
    if (!hotel) return [];

    return [
      {
        icon: <FaStar />,
        text: `${hotel.rating ?? "—"} Rating & Reviews`,
      },
      {
        icon: <IoLocation />,
        text: hotel.address || "Address updating…",
      },
      {
        icon: <FaConciergeBell />,
        text: hotel.amenities || "Amenities updating…",
      },
    ];
  }, [hotel]);

  return (
    <>
      {/* ========= HERO ========= */}
      {hotel && showHeader && (
        <div className="container-xxl py-5">
          <div className="container">
            <div className="row g-5 align-items-stretch">
              {/* Image */}
              <div className="col-lg-5 d-flex" style={{ minHeight: HERO_H }}>
                <div
                  className="w-100"
                  style={{
                    height: "100%",
                    borderRadius: 14,
                    overflow: "hidden",
                    boxShadow: "0 10px 26px rgba(0,0,0,.12)",
                  }}
                >
                  <img
                    src={`${IMAGE_URL}/hotels/${hotel.image}`}
                    alt={hotel.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="col-lg-7 d-flex" style={{ minHeight: HERO_H }}>
                <div className="w-100 d-flex flex-column justify-content-center ps-2">
                  {/* Heading */}
                  <div className="sb-heading sb-heading--md mb-1">
                    <h6
                      className="sb-heading__label"
                      style={{ fontSize: 18, fontWeight: 800, letterSpacing: "0.22em" }}
                    >
                      WELCOME TO
                    </h6>
                    <span className="sb-heading__lines sb-heading__lines--right">
                      <span className="sb-heading__line sb-heading__line--long" />
                      <span className="sb-heading__line sb-heading__line--short" />
                    </span>
                  </div>

                  <h1
                    className="text-primary"
                    style={{ fontSize: 36, fontWeight: 950, lineHeight: 1.12 }}
                  >
                    {hotel.name}
                  </h1>

                  {/* ✅ 3 pill – 1 hàng ngang */}
                  {/* ===== Hotel Info (3 lines – vertical stack) ===== */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column", // ✅ xếp dọc
                      gap: 14,
                      marginTop: 18,
                      maxWidth: 620, // giống ảnh
                    }}
                  >
                    {/* Rating */}
                    <div style={pillStyle}>
                      <span style={iconWrapStyle}>
                        <FaStar />
                      </span>
                      <span>
                        {hotel?.rating != null
                          ? `${hotel.rating} Rating & Reviews`
                          : "Rating & Reviews"}
                      </span>
                    </div>

                    {/* Address */}
                    <div style={pillStyle}>
                      <span style={iconWrapStyle}>
                        <IoLocation />
                      </span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                        {hotel?.address || "Address updating…"}
                      </span>
                    </div>

                    {/* Amenities */}
                    <div style={pillStyle}>
                      <span style={iconWrapStyle}>
                        <FaConciergeBell />
                      </span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                        {hotel?.amenities || "Amenities updating…"}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========= NEARBY ========= */}
      {hotel && <HotelNearby hotel={hotel} />}

      {/* ========= ROOMS ========= */}
      <div className="container-xxl pb-5 pt-4">
        <div className="container">

          {/* ===== Heading ===== */}
          <div className="text-center mb-4">
            <div className="sb-heading sb-heading--md mx-auto">
              {/* lines left */}
              <span className="sb-heading__lines sb-heading__lines--left">
                <span className="sb-heading__line sb-heading__line--long" />
                <span className="sb-heading__line sb-heading__line--short" />
              </span>

              {/* LABEL */}
              <h6
                className="sb-heading__label"
                style={{
                  fontSize: "26px",
                  fontWeight: 900,
                  letterSpacing: "0.18em",
                  color: "#86B817",
                }}
              >
                ROOM
              </h6>

              {/* lines right */}
              <span className="sb-heading__lines sb-heading__lines--right">
                <span className="sb-heading__line sb-heading__line--long" />
                <span className="sb-heading__line sb-heading__line--short" />
              </span>
            </div>

            <h1
              className="mb-0"
              style={{
                fontSize: "28px",
                fontWeight: 800,
              }}
            >
              Our Rooms
            </h1>
          </div>

          {/* ===== Rooms Grid ===== */}
          <div className="rooms-grid" style={{ marginTop: 36 }} >
            {rooms.map((room) => {
              const isFavorite = myFavorite?.rooms?.some((fav) => fav.id === room.id);
              const isAvailableToday =
                availableTodayIds === null ||
                availableTodayIds.includes(room.id);

              return (
                <div className="room-cell" key={room.id}>
                  <RoomCard
                    room={room}
                    isFavorite={isFavorite}
                    hotelName={hotel?.name}
                    hotelId={hotel?.id}
                    isAvailableToday={isAvailableToday}
                  />
                </div>
              );
            })}
          </div>

        </div>
      </div>

      <CompareButton />
    </>
  );
}
