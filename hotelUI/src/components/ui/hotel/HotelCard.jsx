// src/components/ui/hotel/HotelCard.jsx
import React, { useState } from "react";
import { Image } from "antd";
import { FaPhoneAlt, FaStar } from "react-icons/fa";
import { IoLocation } from "react-icons/io5";
import { Link } from "react-router-dom";

const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || "";

/* ================== HELPERS ================== */
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

const buildDirectionsUrl = (hotel) => {
  const hasLL = hotel?.lat != null && hotel?.lng != null;
  const destination = hasLL
    ? `${hotel.lat},${hotel.lng}`
    : hotel?.address
      ? encodeURIComponent(hotel.address)
      : "";

  if (!destination) return null;

  return `https://www.google.com/maps/dir/?api=1&origin=My%20Location&destination=${destination}&travelmode=driving`;
};

const buildGoogleReviewsUrl = (hotel) => {
  const placeId = hotel?.placeId || hotel?.googlePlaceId || hotel?.place_id;
  if (placeId) return `https://www.google.com/maps/place/?q=place_id:${placeId}`;

  const q = [hotel?.name, hotel?.address].filter(Boolean).join(" ");
  if (q)
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      q
    )}`;

  if (hotel?.lat != null && hotel?.lng != null)
    return `https://www.google.com/maps/search/?api=1&query=${hotel.lat},${hotel.lng}`;

  return null;
};

/* ================== COMPONENT ================== */
export const HotelCard = ({ hotel }) => {
  const [copied, setCopied] = useState(false);
  if (!hotel) return null;

  const directionsUrl = buildDirectionsUrl(hotel);
  const reviewsUrl = buildGoogleReviewsUrl(hotel);

  const open = (url, e) => {
    if (!url) return;
    e.preventDefault();
    e.stopPropagation();
    window.open(url, "_blank", "noopener");
  };

  const onKeyOpen = (url, e) => {
    if (!url) return;
    if (e.key === "Enter" || e.key === " ") open(url, e);
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
    if (e.key === "Enter" || e.key === " ") handleCopyPhone(e);
  };

  return (
    <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
      <div className="team-item hotel-card hotel-card--v3">
        {/* IMAGE (không chứa pill rating nữa) */}
        <div className="hotel-imgbox">
          <Image
            preview={false}
            className="hotel-img"
            src={`${IMAGE_URL}/hotels/${hotel.image}`}
            alt={hotel.name || "Hotel"}
          />
        </div>

        {/* BODY (click vào detail) */}
        <Link to={`/hotel/${hotel.id}`} className="hotel-linkwrap">
          <div className="hotel-card-body hotel-card-body--v3">
            {/* ⭐ Rating pill: nằm phía trên tên */}
            <div className="hotel-rating-wrap">
              <div
                className={`hotel-rating-pill ${reviewsUrl ? "is-clickable" : "is-disabled"}`}
                onClick={(e) => open(reviewsUrl, e)}
                onKeyDown={(e) => onKeyOpen(reviewsUrl, e)}
                role={reviewsUrl ? "button" : undefined}
                tabIndex={reviewsUrl ? 0 : -1}
                aria-label={
                  reviewsUrl ? `See reviews of ${hotel?.name ?? "hotel"}` : undefined
                }
                title={reviewsUrl ? "See reviews" : undefined}
              >
                <FaStar className="hotel-rating-pill__icon" />
                <span className="hotel-rating-pill__text">{hotel.rating}</span>
              </div>
            </div>

            {/* ✅ Tên to + đậm */}
            <h5 className="hotel-name primarycolor mb-0 hotel-name--strong">
              {hotel.name}
            </h5>

            {/* ĐỊA CHỈ: click mở Maps */}
            <div
              className={`hotel-address ${directionsUrl ? "clickable" : ""}`.trim()}
              onClick={(e) => open(directionsUrl, e)}
              onKeyDown={(e) => onKeyOpen(directionsUrl, e)}
              role={directionsUrl ? "button" : undefined}
              tabIndex={directionsUrl ? 0 : -1}
              title={directionsUrl ? "Open Google Maps for directions" : undefined}
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
            >
              <FaPhoneAlt size={16} className="me-2 flex-shrink-0" />
              <span className="text">{copied ? "Copied" : hotel.phone}</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};
