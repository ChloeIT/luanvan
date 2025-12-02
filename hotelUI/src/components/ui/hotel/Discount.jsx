// src/components/ui/home/Discount.jsx
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RoomCard } from "@/components/ui/Room/RoomCard";
import { fetchAllRoom } from "@/store/room/thunk";

// Swiper cho phần DISCOUNT
import "swiper/css";
import "swiper/css/autoplay";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

/** Đọc giá trị giảm giá từ room, convert sang number an toàn */
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

  /* ===== LẤY TẤT CẢ ROOM CÓ DISCOUNT > 0 ===== */
  const discountedRooms = useMemo(() => {
    if (!Array.isArray(rooms)) return [];

    return rooms
      .map((r) => ({
        ...r,
        discountPercent: getDiscountValue(r),
      }))
      .filter((r) => r.discountPercent > 0)
      .sort((a, b) => b.discountPercent - a.discountPercent); // giảm dần theo %
  }, [rooms]);

  // Nếu không có phòng giảm giá có thể return null, hoặc hiện message
  if (!discountedRooms.length) {
    return null;
  }

  return (
    <div className="container-xxl py-5 destination">
      <div className="container">
        {/* ===== HEADING ===== */}
        <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
          <div
            className="heading-line mx-auto"
            style={{ "--heading-gap": "14px" }}
          >
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
              Discount
            </h6>

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

          <h1 className="mb-5">Save big today!</h1>
        </div>

        {/* ===== SWIPER DISCOUNT ===== */}
        <Swiper
          modules={[Autoplay]}
          loop
          speed={900}
          autoplay={{
            delay: 2600,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          spaceBetween={18}
          style={{ padding: "4px 0 20px" }}
          breakpoints={{
            0: { slidesPerView: 1 },
            576: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
          }}
          className="home-discount-swiper" // dùng chung CSS pill-top với Home
        >
          {discountedRooms.map((room, idx) => (
            <SwiperSlide key={`${room.id}-${idx}`} className="!h-auto">
              <RoomCard
                room={room}
                hotelId={room.hotel?.id ?? room.hotel_id ?? null}
                hotelName={room.hotel?.name ?? room.hotelName}
                isAvailableToday={true}
                linkToHotel={true}  // pill tên hotel dẫn tới trang hotel
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};
