// src/pages/Review.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllBooking } from "@/store/booking/thunk";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/autoplay";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
// ⭐ dùng thêm half + empty
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
  review1,
  review2,
  review3,
  review4,
  review5,
  review6,
  review7,
  review8,
];

// URL ảnh BE: http://localhost:8080/images/users/<fileName>
const RAW_IMAGE_URL = (import.meta.env.VITE_IMAGE_URL || "").replace(/\/+$/, "");
const buildUserImageUrl = (fileName) => {
  if (!fileName || !RAW_IMAGE_URL) return null;
  return `${RAW_IMAGE_URL}/users/${fileName}`;
};

// ================= CARD =================
const TestimonialCard = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const [imgSrc, setImgSrc] = useState(item.image);

  const maxChars = 110;
  const needsClamp = item.review.length > maxChars;
  const text = expanded
    ? item.review
    : needsClamp
      ? item.review.slice(0, maxChars) + "..."
      : item.review;

  // ⭐ TÍNH SAO
  const rating = Number(item.rating) || 0;
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const totalShown = fullStars + (hasHalf ? 1 : 0);
  const emptyStars = Math.max(0, 5 - totalShown);

  return (
    <div className="h-full rounded-3xl bg-amber-100/90 border border-amber-200/70 p-5 text-center review-card transition-all duration-300">
      {/* Avatar */}
      <div className="relative mx-auto mb-3 w-20 h-20">
        <img
          src={imgSrc}
          onError={() => setImgSrc(item.fallbackImage)}
          alt={`Ảnh khách ${item.name}`}
          className="w-20 h-20 rounded-full object-cover ring-4 ring-yellow-200"
        />
        <span className="absolute -bottom-1 -right-1 text-[10px] bg-green-600 text-white px-2 py-[2px] rounded-full shadow">
          ✓ Verified
        </span>
      </div>

      {/* Name + location */}
      <h5 className="mb-0 font-semibold">{item.name}</h5>
      <p className="text-sm text-gray-600">{item.location}</p>

      {/* Hotel + room */}
      {(item.hotelName || item.roomName) && (
        <p className="text-xs text-gray-500 mt-1">
          {item.hotelName}
          {item.roomName ? ` · ${item.roomName}` : ""}
        </p>
      )}

      {/* ⭐ RATING – màu vàng + icon đẹp */}
      <div
        className="flex items-center justify-center gap-[3px] my-2"
        aria-label={`Rating ${rating} out of 5`}
      >
        {/* full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <FaStar
            key={`full-${i}`}
            className="text-yellow-400 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
          />
        ))}

        {/* half star */}
        {hasHalf && (
          <FaStarHalfAlt
            key="half"
            className="text-yellow-300 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]"
          />
        )}

        {/* empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <FaRegStar
            key={`empty-${i}`}
            className="text-gray-300"
          />
        ))}

        {/* numeric rating */}
        <span className="ml-2 text-sm text-gray-700 font-semibold">
          {rating.toFixed(1)}
        </span>
      </div>

      {/* Review text */}
      <p className="mt-2 text-[15px] leading-relaxed">
        {text}
        {needsClamp && (
          <button
            className="ml-1 text-primary underline decoration-dotted"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Thu gọn" : "Xem thêm"}
          </button>
        )}
      </p>

      {/* Date */}
      <p className="mt-3 text-xs text-gray-500">
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

  // Map bookings -> testimonials
  const testimonials = useMemo(() => {
    if (!Array.isArray(bookings)) return [];

    return bookings
      .filter((b) => b.review)
      .map((b, idx) => {
        const r = b.review || {};
        const u = b.user || {};

        // Lấy room từ nhiều dạng khác nhau
        let room = null;

        if (b.room) {
          room = b.room;
        } else if (Array.isArray(b.rooms) && b.rooms.length > 0) {
          room = b.rooms[0];
        } else if (
          Array.isArray(b.bookingDetails) &&
          b.bookingDetails.length > 0 &&
          b.bookingDetails[0].room
        ) {
          room = b.bookingDetails[0].room;
        }

        const hotel = room?.hotel || b.hotel || {};

        const avatar = buildUserImageUrl(u.image);
        const fallbackImg = FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];

        return {
          id: r.id || b.id,
          name: r.author || u.fullName || u.username || "Guest",
          location: u.address || hotel.address || "Việt Nam",
          rating: Number(r.rating) || 5,
          date: r.review_date || r.reviewDate || b.checkOut || b.checkIn,
          review: r.comment || "",
          image: avatar || fallbackImg,
          fallbackImage: fallbackImg,
          hotelName:
            hotel.hotelName ||
            hotel.name ||
            b.hotelName ||
            (b.hotel && b.hotel.hotelName) ||
            "",
          roomName:
            room?.roomName ||
            room?.name ||
            room?.roomType ||
            "",
        };
      });
  }, [bookings]);

  // Avg rating + total reviews
  const { avgRating, totalReviews } = useMemo(() => {
    if (!testimonials.length) return { avgRating: 0, totalReviews: 0 };
    const sum = testimonials.reduce((acc, it) => acc + it.rating, 0);
    return {
      avgRating: sum / testimonials.length,
      totalReviews: testimonials.length,
    };
  }, [testimonials]);

  return (
    <div className="container-xxl py-5 review-section">
      <div className="container">
        {/* Heading */}
        <div className="text-center">
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
              REVIEW
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

          <h1 className="mb-1">Our Customers Say!!!</h1>
          <p className="text-gray-600 review-stats">
            ⭐ {avgRating.toFixed(1)}/5 · {totalReviews} reviews · Verified
            guests
          </p>
        </div>

        {/* Swiper */}
        <div className="mt-4 review-swiper-wrapper">
          {testimonials.length === 0 ? (
            <p className="text-center text-gray-600">
              Chưa có đánh giá nào.
            </p>
          ) : (
            <Swiper
              modules={[FreeMode, Autoplay]}
              freeMode
              speed={850}
              autoplay={{ delay: 2500, disableOnInteraction: false }}
              loop
              spaceBetween={24}
              breakpoints={{
                0: { slidesPerView: 1.1 },
                480: { slidesPerView: 1.4 },
                640: { slidesPerView: 2.1 },
                768: { slidesPerView: 2.4 },
                1024: { slidesPerView: 3.1 },
                1280: { slidesPerView: 3.6 },
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
        <div className="text-center mt-7">
          <a
            href="/hotel"
            className="inline-block px-6 py-3 rounded-full bg-primary text-white hover:opacity-90"
          >
            Xem phòng trống & Đặt ngay
          </a>
        </div>
      </div>
    </div>
  );
};
