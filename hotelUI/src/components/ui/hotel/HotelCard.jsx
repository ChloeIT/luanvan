// src/components/ui/hotel/HotelCard.jsx
import React, { useState } from "react";
import { Image } from "antd";
import { FaPhoneAlt, FaStar } from "react-icons/fa";
import { IoLocation } from "react-icons/io5";
import { Link } from "react-router-dom";

const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "";

/* ================== HELPERS ================== */

// Copy với fallback (HTTPS dùng Clipboard API, còn lại dùng execCommand)
const copyText = async (text) => {
  if (!text) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    return true;
  } catch {
    return false;
  }
};

// Ưu tiên lat/lng; nếu không có thì dùng địa chỉ text
const buildDirectionsUrl = (hotel) => {
  const hasLL = hotel?.lat != null && hotel?.lng != null;
  const destination = hasLL
    ? `${hotel.lat},${hotel.lng}`
    : hotel?.address
      ? encodeURIComponent(hotel.address)
      : "";

  if (!destination) return null;

  // origin để Google tự lấy vị trí hiện tại (My Location)
  return `https://www.google.com/maps/dir/?api=1&origin=My%20Location&destination=${destination}&travelmode=driving`;
};

// Link tới trang đánh giá Google của KS
const buildGoogleReviewsUrl = (hotel) => {
  const placeId = hotel?.placeId || hotel?.googlePlaceId || hotel?.place_id;

  // Ưu tiên Place ID (chính xác nhất)
  if (placeId) {
    return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
    // Hoặc: `https://www.google.com/maps/search/?api=1&query_place_id=${placeId}`;
  }

  // Fallback: theo TÊN + ĐỊA CHỈ
  const q = [hotel?.name, hotel?.address].filter(Boolean).join(" ");
  if (q) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      q
    )}`;
  }

  // Fallback cuối: theo lat/lng
  if (hotel?.lat != null && hotel?.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${hotel.lat},${hotel.lng
      }`;
  }

  return null;
};

/* ================== COMPONENT ================== */

export const HotelCard = ({ hotel }) => {
  const [copied, setCopied] = useState(false);

  if (!hotel) return null;

  const directionsUrl = buildDirectionsUrl(hotel);
  const reviewsUrl = buildGoogleReviewsUrl(hotel);

  const handleOpenReviews = (e) => {
    if (!reviewsUrl) return;
    e.preventDefault();
    e.stopPropagation();
    window.open(reviewsUrl, "_blank", "noopener");
  };

  const handleReviewsKeyDown = (e) => {
    if (!reviewsUrl) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      window.open(reviewsUrl, "_blank", "noopener");
    }
  };

  const handleOpenDirections = (e) => {
    if (!directionsUrl) return;
    e.preventDefault();
    e.stopPropagation();
    window.open(directionsUrl, "_blank", "noopener");
  };

  const handleDirectionsKeyDown = (e) => {
    if (!directionsUrl) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      window.open(directionsUrl, "_blank", "noopener");
    }
  };

  const handleCopyPhone = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = await copyText(String(hotel.phone || "").trim());
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 800);
    }
  };

  const handleCopyPhoneKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleCopyPhone(e);
    }
  };

  return (
    <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
      <div className="team-item hotel-card">
        <div className="image-box">
          <Image
            className="hotel-image"
            preview={false}
            src={`${IMAGE_URL}/hotels/${hotel.image}`}
            alt={hotel.name || "Hotel"}
            // ❌ KHÔNG dùng imgStyle nữa
            // ✅ Nếu muốn ép kích thước, dùng style hoặc CSS
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: 12,
              display: "block",
              overflow: "hidden",
            }}
          />
        </div>

        <Link to={`/hotel/${hotel.id}`}>
          {/* Rating badge (click → mở đánh giá Google) */}
          <div className="position-relative d-flex justify-content-center mt-4">
            <div
              className={`btn btn-primary rounded-pill py-10 px-15 group ${reviewsUrl ? "rating-clickable" : ""
                }`}
              onClick={handleOpenReviews}
              onKeyDown={handleReviewsKeyDown}
              role={reviewsUrl ? "button" : undefined}
              tabIndex={reviewsUrl ? 0 : -1}
              title={reviewsUrl ? "See reviews" : undefined}
              aria-label={
                reviewsUrl
                  ? `See reviews of ${hotel?.name ?? "hotel"}`
                  : undefined
              }
            >
              <div className="d-flex justify-content-center mt-2">
                <FaStar className="text-yellow-300 group-hover:text-white" />
                <p className="ml-1 text-yellow-300 group-hover:text-white mb-0">
                  {hotel.rating}
                </p>
              </div>
            </div>
          </div>

          <div className="hotel-card-body">
            <h5 className="hotel-name primarycolor mb-0">{hotel.name}</h5>

            {/* ĐỊA CHỈ: click mở Google Maps */}
            <div
              className={`hotel-address ${directionsUrl ? "clickable" : ""
                }`.trim()}
              onClick={handleOpenDirections}
              onKeyDown={handleDirectionsKeyDown}
              role={directionsUrl ? "button" : undefined}
              tabIndex={directionsUrl ? 0 : -1}
              title={
                directionsUrl ? "Open Google Maps for directions" : undefined
              }
              aria-label={
                directionsUrl
                  ? `Directions to ${hotel?.name ?? "hotel"}`
                  : undefined
              }
            >
              <IoLocation size={16} className="me-2 flex-shrink-0" />
              <span className="text">{hotel.address}</span>
            </div>

            {/* PHONE: click để copy */}
            <div
              className="hotel-phone copyable"
              onClick={handleCopyPhone}
              onKeyDown={handleCopyPhoneKeyDown}
              role="button"
              tabIndex={0}
              title="Nhấn để sao chép số điện thoại"
              aria-label={`Copy phone number of ${hotel?.name ?? "hotel"}`}
            >
              <FaPhoneAlt size={16} className="me-2 flex-shrink-0" />
              <span className="text">
                {copied ? "Copied" : hotel.phone}
              </span>
            </div>
          </div>

          {/* (giữ nguyên block compare nếu bạn còn dùng CSS cũ) */}
          <div
            className="add-to-compare absolute cursor-pointer"
            data-hotel-id="{{ $hotel->hotel_id }}"
            data-hotel-name="{{ $hotel->hotel_name }}"
            data-hotel-rating="{{ $hotel->rating}}"
            data-hotel-image="{{ $hotel->hotel_image }}"
          >
            <i className="fas fa-plus-circle"></i>
          </div>
        </Link>
      </div>
    </div>
  );
};
