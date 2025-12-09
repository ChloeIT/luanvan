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
  const raw =
    room?.discountPercent ??
    room?.discount_percent ??
    room?.discount ??
    0;

  const num = Number(raw);
  return Number.isFinite(num) && num > 0 ? num : 0;
};

export const Discount = () => {
  const dispatch = useDispatch();
  const { rooms = [] } = useSelector((s) => s.room || {});

  /* ===== FETCH ROOMS NẾU CHƯA CÓ ===== */
  useEffect(() => {
    if (!rooms || rooms.length === 0) {
      dispatch(fetchAllRoom());
    }
  }, [rooms?.length, dispatch]);

  /* ===== LẤY ROOM GIẢM GIÁ ===== */
  const discountedRooms = useMemo(() => {
    if (!Array.isArray(rooms)) return [];
    return rooms
      .map((r) => ({ ...r, discountPercent: getDiscountValue(r) }))
      .filter((r) => r.discountPercent > 0)
      .sort((a, b) => b.discountPercent - a.discountPercent);
  }, [rooms]);

  if (!discountedRooms.length) return null;

  return (
    <div className="container-xxl py-4 destination">
      <div className="container">

        {/* ===== HEADING Compact ===== */}
        <div className="text-center">
          <div
            className="heading-line mx-auto"
            style={{ "--heading-gap": "10px" }}
          >
            {/* Left divider */}
            <span
              style={{
                display: "grid",
                justifyItems: "end",
                gap: "4px",
                marginRight: "2px",
              }}
            >
              <span className="divider" style={{ "--w": "100px" }} />
              <span className="divider" style={{ "--w": "50px", "--alpha": 0.45 }} />
            </span>

            {/* Title */}
            <h6
              className="heading-text text-primary text-uppercase"
              style={{ fontSize: "18px" }}
            >
              Discount
            </h6>

            {/* Right divider */}
            <span
              style={{
                display: "grid",
                justifyItems: "start",
                gap: "4px",
                marginLeft: "2px",
              }}
            >
              <span className="divider" style={{ "--w": "100px" }} />
              <span className="divider" style={{ "--w": "50px", "--alpha": 0.45 }} />
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
