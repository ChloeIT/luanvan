// src/components/ui/hotel/HotelDetail.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { RoomCard } from "@/components/ui/Room/RoomCard";
import { CompareButton } from "@/components/ui/compare/CompareButton";

import { FaStar } from "react-icons/fa6";
import { IoLocation } from "react-icons/io5";
import { FaConciergeBell, FaHeadset, FaInfoCircle } from "react-icons/fa";

// 🔹 Nearby tách riêng
import { HotelNearby } from "./HotelNearby";

const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "";
const RAW_API_URL = (import.meta.env.VITE_HOTEL_API || "").replace(/\/+$/, "");
const ROOM_API_BASE = RAW_API_URL ? `${RAW_API_URL}/api/room` : "/api/room";

export function HotelDetail({
  rooms: roomsProp,
  hotel: hotelProp,
  showHeader = true,
}) {
  const { hotels } = useSelector((s) => s.hotel);
  const { rooms: allRooms } = useSelector((s) => s.room);
  const { myFavorite } = useSelector((s) => s.favorite);
  const { id: routeId } = useParams();

  const iconColor = "#FFC30B";
  const HERO_H = 420;

  /* ========= XÁC ĐỊNH HOTEL HIỆN TẠI ========= */
  const hotel = useMemo(() => {
    if (hotelProp) return hotelProp;
    if (routeId) return hotels.find((h) => String(h.id) === String(routeId));
    return undefined;
  }, [hotelProp, routeId, hotels]);

  /* ========= LẤY DANH SÁCH PHÒNG ========= */
  const rooms = useMemo(() => {
    if (roomsProp && roomsProp.length) return roomsProp;

    if (hotel && allRooms) {
      return allRooms.filter((r) => {
        const roomHotelId = r?.hotel?.id ?? r?.hotelId ?? r?.hotel_id ?? null;
        return roomHotelId != null && String(roomHotelId) === String(hotel.id);
      });
    }
    return [];
  }, [roomsProp, hotel, allRooms]);

  /* ========= DANH SÁCH PHÒNG TRỐNG TRONG NGÀY ========= */
  const [availableTodayIds, setAvailableTodayIds] = useState(null);

  useEffect(() => {
    if (!hotel) return;

    const now = new Date();
    const start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0
    );
    const end = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0
    );

    const url = `${ROOM_API_BASE}/hotel/${hotel.id}/available?checkIn=${start.toISOString()}&checkOut=${end.toISOString()}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const ids = Array.isArray(data) ? data.map((r) => r.id) : [];
        setAvailableTodayIds(ids);
      })
      .catch(() => {
        // nếu lỗi API thì để null -> không khoá booking
        setAvailableTodayIds(null);
      });
  }, [hotel]);

  return (
    <>
      {/* ========= HERO ========= */}
      {hotel && showHeader && (
        <div className="container-xxl py-5">
          <div className="container">
            <div className="row g-5 align-items-stretch">
              {/* Ảnh khách sạn */}
              <div className="col-lg-6 d-flex" style={{ minHeight: HERO_H }}>
                <div className="position-relative h-100 w-100">
                  <img
                    src={`${IMAGE_URL}/hotels/${hotel.image}`}
                    alt={hotel.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 12,
                    }}
                  />
                </div>
              </div>

              {/* Nội dung */}
              <div className="col-lg-6 d-flex" style={{ minHeight: HERO_H }}>
                <div className="h-100 w-100 d-flex flex-column justify-content-center">
                  {/* Welcome + gạch */}
                  <div className="d-flex align-items-center" style={{ gap: 12 }}>
                    <h1 className="m-0" style={{ fontWeight: 900 }}>
                      Welcome to
                    </h1>
                    <span style={{ display: "grid", gap: 6 }}>
                      <span className="divider" style={{ "--w": "150px" }} />
                      <span
                        className="divider"
                        style={{ "--w": "100px", "--alpha": 0.6 }}
                      />
                    </span>
                  </div>

                  {/* Tên khách sạn */}
                  <h1
                    className="text-primary mb-4"
                    style={{ fontWeight: 900 }}
                  >
                    {hotel.name}
                  </h1>

                  {/* Rating */}
                  <p
                    className="d-flex align-items-center"
                    style={{ fontSize: "1.05rem", fontWeight: 600 }}
                  >
                    <FaStar style={{ color: iconColor, marginRight: 8 }} />
                    {hotel.rating}
                  </p>

                  {/* Địa chỉ */}
                  <p
                    className="d-flex align-items-center"
                    style={{ fontSize: "1.05rem", fontWeight: 600 }}
                  >
                    <IoLocation style={{ color: iconColor, marginRight: 8 }} />
                    {hotel.address}
                  </p>

                  {/* Tiện nghi */}
                  {hotel.amenities && (
                    <p
                      className="d-flex align-items-center"
                      style={{ fontSize: "1.05rem", fontWeight: 600 }}
                    >
                      <FaConciergeBell
                        style={{ color: iconColor, marginRight: 8 }}
                      />
                      {hotel.amenities}
                    </p>
                  )}

                  <p
                    className="d-flex align-items-center"
                    style={{ fontSize: "1.05rem", fontWeight: 600 }}
                  >
                    <FaHeadset style={{ color: iconColor, marginRight: 8 }} />
                    24/7 Service
                  </p>

                  <p
                    className="d-flex align-items-center"
                    style={{ fontSize: "1.05rem", fontWeight: 600 }}
                  >
                    <FaInfoCircle
                      style={{ color: iconColor, marginRight: 8 }}
                    />
                    Provide enough information
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========= NEARBY (component riêng) ========= */}
      {hotel && <HotelNearby hotel={hotel} />}

      {/* ========= ROOMS SECTION TITLE ========= */}
      <div className="container-xxl pt-2 pb-3">
        <div className="container">
          <div className="text-center wow fadeInUp" data-wow-delay="0.05s">
            <div
              className="heading-line mx-auto"
              style={{ "--heading-gap": "14px" }}
            >
              {/* gạch trái */}
              <span
                style={{
                  display: "grid",
                  justifyItems: "end",
                  gap: "6px",
                  marginRight: "2px",
                }}
              >
                <span className="divider" style={{ "--w": "120px" }} />
                <span
                  className="divider"
                  style={{ "--w": "60px", "--alpha": 0.45 }}
                />
              </span>

              <h6 className="heading-text text-3xl text-primary text-uppercase">
                Rooms
              </h6>

              {/* gạch phải */}
              <span
                style={{
                  display: "grid",
                  justifyItems: "start",
                  gap: "6px",
                  marginLeft: "2px",
                }}
              >
                <span className="divider" style={{ "--w": "120px" }} />
                <span
                  className="divider"
                  style={{ "--w": "60px", "--alpha": 0.45 }}
                />
              </span>
            </div>

            <h1 className="mb-0">Our Rooms</h1>
          </div>
        </div>
      </div>

      {/* ========= ROOMS GRID ========= */}
      <div className="container-xxl pb-5 pt-4">
        <div className="container">
          <div className="rooms-grid">
            {rooms.map((room, idx) => {
              const isFavorite =
                myFavorite?.rooms?.some((fav) => fav.id === room.id) || false;
              const isAvailableToday =
                availableTodayIds === null ||
                availableTodayIds.includes(room.id);

              return (
                <div
                  className="room-cell wow fadeInUp"
                  data-wow-delay={`${0.1 + idx * 0.05}s`}
                  key={room.id}
                >
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

            {rooms.length === 0 && (
              <p className="text-center text-muted mt-3">
                This hotel currently has no rooms.
              </p>
            )}
          </div>
        </div>
      </div>

      <CompareButton />
    </>
  );
}
