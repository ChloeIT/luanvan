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

        {/* ===== HEADING (SB style) ===== */}
        <div className="text-center">
          <div className="sb-heading sb-heading--md mx-auto">
            {/* left lines */}
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
              }}
            >
              DISCOUNT
            </h6>

            {/* right lines */}
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
