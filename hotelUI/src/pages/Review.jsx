// src/pages/Review.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllBooking } from "@/store/booking/thunk";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/autoplay";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";

import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

// Fallback avatars
import review1 from "../assets/images/review/review1.jpg";
import review2 from "../assets/images/review/review2.jpg";
import review3 from "../assets/images/review/review3.jpg";
import review4 from "../assets/images/review/review4.jpg";
import review5 from "../assets/images/review/review5.jpg";
import review6 from "../assets/images/review/review6.jpg";
import review7 from "../assets/images/review/review7.jpg";
import review8 from "../assets/images/review/review8.jpg";

const FALLBACK_IMAGES = [
  review1, review2, review3, review4,
  review5, review6, review7, review8,
];

const RAW_IMAGE_URL = (import.meta.env.VITE_IMAGE_URL || "").replace(/\/+$/, "");
const buildUserImageUrl = (fileName) => {
  if (!fileName || !RAW_IMAGE_URL) return null;
  return `${RAW_IMAGE_URL}/users/${fileName}`;
};

// ================= CARD =================
const TestimonialCard = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const [imgSrc, setImgSrc] = useState(item.image);

  const maxChars = 100;
  const needsClamp = item.review.length > maxChars;
  const text = expanded
    ? item.review
    : needsClamp
      ? item.review.slice(0, maxChars) + "..."
      : item.review;

  // ⭐ RATING
  const rating = Number(item.rating) || 0;
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const totalShown = fullStars + (hasHalf ? 1 : 0);
  const emptyStars = Math.max(0, 5 - totalShown);

  return (
    <div className="h-full rounded-3xl bg-amber-100/80 border border-amber-200/60 p-4 text-center transition-all">
      {/* Avatar */}
      <div className="relative mx-auto mb-3 w-16 h-16">
        <img
          src={imgSrc}
          onError={() => setImgSrc(item.fallbackImage)}
          alt={`Avatar`}
          className="w-16 h-16 rounded-full object-cover ring-2 ring-yellow-200"
        />
        <span className="absolute -bottom-1 -right-1 text-[9px] bg-green-600 text-white px-1.5 py-[1px] rounded-full shadow">
          ✓
        </span>
      </div>

      {/* Name */}
      <h5 className="mb-0 font-semibold text-[15px]">{item.name}</h5>
      <p className="text-xs text-gray-600">{item.location}</p>

      {/* Hotel + room */}
      {(item.hotelName || item.roomName) && (
        <p className="text-[11px] text-gray-500 mt-1">
          {item.hotelName}
          {item.roomName ? ` · ${item.roomName}` : ""}
        </p>
      )}

      {/* ⭐ Rating */}
      <div className="flex items-center justify-center gap-[2px] my-2">
        {Array.from({ length: fullStars }).map((_, i) => (
          <FaStar key={`full-${i}`} className="text-yellow-400 text-sm" />
        ))}
        {hasHalf && <FaStarHalfAlt className="text-yellow-300 text-sm" />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="text-gray-300 text-sm" />
        ))}
        <span className="ml-1 text-xs text-gray-700 font-semibold">
          {rating.toFixed(1)}
        </span>
      </div>

      {/* Review text */}
      <p className="mt-1 text-[13px] leading-relaxed text-gray-700">
        {text}
        {needsClamp && (
          <button
            className="ml-1 text-primary underline text-[12px]"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Thu gọn" : "Xem thêm"}
          </button>
        )}
      </p>

      {/* Date */}
      <p className="mt-2 text-[10px] text-gray-500">
        {item.date ? new Date(item.date).toLocaleDateString() : ""}
      </p>
    </div>
  );
};

// ================= PAGE =================
export const Review = () => {
  const dispatch = useDispatch();
  const { bookings } = useSelector((s) => s.booking || {});

  useEffect(() => {
    dispatch(fetchAllBooking());
  }, [dispatch]);

  // Convert bookings -> testimonials
  const testimonials = useMemo(() => {
    if (!Array.isArray(bookings)) return [];

    return bookings
      .filter((b) => b.review)
      .map((b, idx) => {
        const r = b.review || {};
        const u = b.user || {};

        let room = b.room || b.rooms?.[0] || b.bookingDetails?.[0]?.room || {};
        const hotel = room?.hotel || b.hotel || {};

        const avatar = buildUserImageUrl(u.image);
        const fallbackImg = FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];

        return {
          id: r.id || b.id,
          name: r.author || u.fullName || "Guest",
          location: u.address || hotel.address || "Viet Nam",
          rating: Number(r.rating) || 5,
          date: r.review_date || b.checkOut,
          review: r.comment || "",
          image: avatar || fallbackImg,
          fallbackImage: fallbackImg,
          hotelName: hotel.name || "",
          roomName: room.name || "",
        };
      });
  }, [bookings]);

  // Avg rating + total
  const { avgRating, totalReviews } = useMemo(() => {
    if (!testimonials.length) return { avgRating: 0, totalReviews: 0 };
    const sum = testimonials.reduce((a, t) => a + t.rating, 0);
    return {
      avgRating: sum / testimonials.length,
      totalReviews: testimonials.length,
    };
  }, [testimonials]);

  return (
    <div className="container-xxl py-4 review-section">
      <div className="container">
        {/* ===== Heading ===== */}
        <div className="text-center">
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
                fontSize: "26px",      // 👈 to
                fontWeight: 900,       // 👈 đậm
                letterSpacing: "0.18em"
              }}
            >
              Review
            </h6>

            {/* lines right */}
            <span className="sb-heading__lines sb-heading__lines--right">
              <span className="sb-heading__line sb-heading__line--long" />
              <span className="sb-heading__line sb-heading__line--short" />
            </span>
          </div>

          <h1 className="mt-1 mb-2" style={{ fontSize: "28px" }}>
            Our Customers Say!
          </h1>

          <p className="text-gray-600 text-sm mt-1">
            ⭐ {avgRating.toFixed(1)}/5 · {totalReviews} reviews · Verified guests
          </p>
        </div>


        {/* ===== Swiper ===== */}
        <div className="mt-4">
          {testimonials.length === 0 ? (
            <p className="text-center text-gray-600">Chưa có đánh giá nào.</p>
          ) : (
            <Swiper
              modules={[FreeMode, Autoplay]}
              freeMode
              speed={700}
              autoplay={{ delay: 2300, disableOnInteraction: false }}
              loop
              spaceBetween={20}
              breakpoints={{
                0: { slidesPerView: 1.1 },
                480: { slidesPerView: 1.4 },
                640: { slidesPerView: 2 },
                768: { slidesPerView: 2.3 },
                1024: { slidesPerView: 3 },
                1280: { slidesPerView: 3.4 },
              }}
            >
              {testimonials.map((item) => (
                <SwiperSlide key={item.id} className="!h-auto">
                  <TestimonialCard item={item} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-6">
          <a
            href="/hotel"
            className="inline-block px-5 py-2 rounded-full bg-primary text-white text-sm hover:opacity-90"
          >
            Xem phòng trống & Đặt ngay
          </a>
        </div>
      </div>
    </div>
  );
};
