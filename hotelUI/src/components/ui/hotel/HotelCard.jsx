import { Image } from "antd";
import React from "react";
import { CiLocationOn } from "react-icons/ci";
import { FaPhoneAlt } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
import { IoLocation } from "react-icons/io5";
import { PiPhoneCallLight } from "react-icons/pi";
import { TiStarOutline } from "react-icons/ti";
import { Link } from "react-router-dom";
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

// Ưu tiên lat/lng; nếu không có thì dùng địa chỉ text
const buildDirectionsUrl = (hotel) => {
  const hasLL = hotel?.lat != null && hotel?.lng != null;
  const destination = hasLL
    ? `${hotel.lat},${hotel.lng}`
    : (hotel?.address ? encodeURIComponent(hotel.address) : "");

  if (!destination) return null;

  // origin để Google tự lấy vị trí hiện tại (My Location)
  return `https://www.google.com/maps/dir/?api=1&origin=My%20Location&destination=${destination}&travelmode=driving`;
};


// Link tới trang đánh giá Google của KS
const buildGoogleReviewsUrl = (hotel) => {
  const placeId = hotel?.placeId || hotel?.googlePlaceId || hotel?.place_id;

  // Ưu tiên Place ID (chính xác nhất)
  if (placeId) {
    // Cách 1 (khuyên dùng): mở trang địa điểm trên Google Maps
    return `https://www.google.com/maps/place/?q=place_id:${placeId}`;
    // Hoặc: `https://www.google.com/maps/search/?api=1&query_place_id=${placeId}`;
  }

  // Fallback: tìm theo TÊN + ĐỊA CHỈ
  const q = [hotel?.name, hotel?.address].filter(Boolean).join(" ");
  if (q) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

  // Fallback cuối: theo lat/lng
  if (hotel?.lat != null && hotel?.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${hotel.lat},${hotel.lng}`;
  }

  return null;
};


export const HotelCard = ({ hotel }) => {
  return (
    hotel && (
      <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
        <div className="team-item hotel-card">
          <div className="image-box">
            <Image
              className="hotel-image"
              style={{ width: '100%', height: '100%' }}        // kích thước cho wrapper
              imgStyle={{                           // kích thước cho <img> bên trong
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                borderRadius: 12
              }}

              // src={`/images/hotels/${hotel.image}`}
              src={`${IMAGE_URL}/hotels/${hotel.image}`}
              alt=""
            />
          </div>
          <Link to={`/hotel/${hotel.id}`}>
            <div className="position-relative d-flex justify-content-center mt-4">
              {(() => {
                const reviewsUrl = buildGoogleReviewsUrl(hotel);
                return (
                  <div
                    className={`btn btn-primary rounded-pill py-10 px-15 group ${reviewsUrl ? "rating-clickable" : ""}`}
                    onClick={(e) => {
                      if (!reviewsUrl) return;
                      e.preventDefault();          // vì toàn card bọc bởi <Link>
                      e.stopPropagation();
                      window.open(reviewsUrl, "_blank", "noopener");
                    }}
                    onKeyDown={(e) => {
                      if (!reviewsUrl) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault(); e.stopPropagation();
                        window.open(reviewsUrl, "_blank", "noopener");
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    title="Xem đánh giá Google"
                    aria-label={`Xem đánh giá Google của ${hotel?.name ?? "khách sạn"}`}
                  >
                    <div className="d-flex justify-content-center mt-2">
                      <FaStar className="text-yellow-300 group-hover:text-white" />
                      <p className="ml-1 text-yellow-300 group-hover:text-white">
                        {hotel.rating}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="hotel-card-body">
              <h5 className=" hotel-name primarycolor mb-0">{hotel.name}</h5>

              {/* ĐỊA CHỈ: click mở Google Maps */}
              {(() => {
                const directionsUrl = buildDirectionsUrl(hotel);
                return (
                  <div
                    className={`hotel-address ${directionsUrl ? "clickable" : ""}`}
                    onClick={(e) => {
                      if (!directionsUrl) return;
                      e.preventDefault();    // chặn Link card
                      e.stopPropagation();
                      window.open(directionsUrl, "_blank", "noopener");
                    }}
                    onKeyDown={(e) => {
                      if (!directionsUrl) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(directionsUrl, "_blank", "noopener");
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    title="Open Google Maps for directions"
                    aria-label={`Directions to ${hotel?.name ?? "hotel"}`}
                  >
                    <IoLocation size={16} className="me-2 flex-shrink-0" />
                    <span className="text">{hotel.address}</span>
                  </div>
                );
              })()}

              <div className="hotel-phone">
                <FaPhoneAlt size={16} className="me-2 flex-shrink-0" />
                <a className="text" href={`tel:${hotel.phone}`}>{hotel.phone}</a>
              </div>

            </div>


            <div
              className="add-to-compare absolute cursor-pointer"
              data-hotel-id="{{ $hotel->hotel_id }}"
              data-hotel-name="{{ $hotel->hotel_name }}"
              data-hotel-rating="{{ $hotel->rating}}"
              data-hotel-image="{{ $hotel->hotel_image }}"
            >
              {" "}
              <i className="fas fa-plus-circle"></i>
            </div>
          </Link>
        </div>
      </div>
    )
  );
};
