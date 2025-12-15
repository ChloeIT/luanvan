// src/pages/Home.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Image } from "antd";
import { about } from "../assets";
import { FaArrowRight } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { HotelCard } from "../components/ui/hotel/HotelCard";
import { RoomCard } from "../components/ui/Room/RoomCard";
import { Link } from "react-router-dom";
import { fetchAllRoom } from "@/store/room/thunk";

// Hero search bar
import { HeroContent } from "../components/ui/home/HeroContent";

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

export const Home = () => {
  const dispatch = useDispatch();

  const { hotels = [] } = useSelector((state) => state.hotel || {});
  const { rooms = [] } = useSelector((state) => state.room || {});
  const { user } = useSelector((state) => state.auth || {});

  const [popularHotels, setPopularHotels] = useState([]);

  // Show more / less popular hotels
  const [showAllPopular, setShowAllPopular] = useState(false);
  const MAX_POPULAR_DISPLAY = 4;

  /* ===== FETCH ROOMS NẾU CHƯA CÓ ===== */
  useEffect(() => {
    if (!rooms || rooms.length === 0) {
      dispatch(fetchAllRoom());
    }
  }, [rooms?.length, dispatch]);

  /* ===== POPULAR HOTELS ===== */
  useEffect(() => {
    const data = Array.isArray(hotels)
      ? hotels
        .filter((hotel) => Number(hotel.rating) > 4.5)
        .sort((a, b) => Number(b.rating) - Number(a.rating))
      : [];
    setPopularHotels(data);
  }, [hotels]);

  /* ===== ROOMS CÓ DISCOUNT > 0 ===== */
  const discountedRooms = useMemo(() => {
    if (!Array.isArray(rooms)) return [];
    return rooms
      .map((r) => ({ ...r, discountPercent: getDiscountValue(r) }))
      .filter((r) => r.discountPercent > 0)
      .sort((a, b) => b.discountPercent - a.discountPercent);
  }, [rooms]);

  /* ===== POPULAR HOTELS ĐANG HIỂN THỊ ===== */
  const popularHotelsToShow = useMemo(() => {
    if (!Array.isArray(popularHotels)) return [];
    if (showAllPopular) return popularHotels;
    return popularHotels.slice(0, MAX_POPULAR_DISPLAY);
  }, [popularHotels, showAllPopular]);

  return (
    <>
      {/* ✅ HERO SEARCH BAR */}
      <HeroContent />

      {/* ===== ABOUT ===== */}
      <div className="container-xxl py-4">
        <div className="container">
          <div className="row g-5 align-items-center">
            {/* LEFT: Image */}
            <div className="col-lg-6">
              <div
                style={{
                  width: "100%",
                  height: 520,                 // ✅ card có chiều cao cố định đẹp
                  borderRadius: 18,
                  overflow: "hidden",
                  boxShadow: "0 10px 26px rgba(0,0,0,.14)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  background: "#fff",
                }}
              >
                <Image
                  src={about}
                  alt="About Image"
                  preview={false}
                  style={{
                    width: "100%",
                    height: "100%",            // ✅ cho ảnh ăn full card
                    objectFit: "cover",        // ✅ không còn khoảng trắng
                    display: "block",
                  }}
                />
              </div>
            </div>


            {/* RIGHT: Content */}
            <div className="col-lg-6">
              <div style={{ maxWidth: 560, margin: "0 auto" }}>
                {/* Heading */}
                <div className="sb-heading sb-heading--md" style={{ marginBottom: 10 }}>

                  <h6
                    className="sb-heading__label"
                    style={{
                      fontSize: 26,
                      fontWeight: 900,
                      letterSpacing: "0.18em",
                    }}
                  >
                    ABOUT US
                  </h6>

                  <span className="sb-heading__lines sb-heading__lines--right">
                    <span className="sb-heading__line sb-heading__line--long" />
                    <span className="sb-heading__line sb-heading__line--short" />
                  </span>
                </div>

                <h1 className="mb-2" style={{ fontSize: 30, lineHeight: 1.2 }}>
                  Welcome to <span className="text-primary">SB Hotel</span>
                </h1>

                {user ? (
                  <p className="mb-2" style={{ fontSize: 16 }}>
                    Hello,{" "}
                    <span style={{ fontWeight: 900, color: "var(--primary)" }}>
                      {user?.fullName}
                    </span>
                    .
                  </p>
                ) : (
                  <p className="mb-2" style={{ fontSize: 16 }}>
                    <Link to="/login">Please log in to see your information.</Link>
                  </p>
                )}

                <p className="mb-2" style={{ fontSize: 16 }}>
                  Welcome to our hotel search and booking page!
                </p>

                <p className="mb-3" style={{ fontSize: 16, lineHeight: 1.7 }}>
                  Searching and booking hotels has never been easier. With a
                  convenient booking system and extensive hotel database, we’ll help
                  you find the ideal destination for all your trips.
                </p>

                {/* ✅ list 2 cột đều + spacing đẹp */}
                <div className="row g-2">
                  {[
                    "24/7 Service",
                    "Handpicked Hotels",
                    "5 Star Accommodations",
                    "Provide enough information",
                    "Promotions and offers",
                    "Upgrade membership",
                  ].map((item, i) => (
                    <div className="col-md-6" key={i}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: 14,
                          background: "rgba(255,255,255,0.55)",
                          border: "1px solid rgba(0,0,0,0.06)",
                          fontWeight: 700,
                        }}
                      >
                        <FaArrowRight style={{ color: "var(--primary)", marginTop: 3 }} />
                        <span style={{ fontSize: 15, lineHeight: 1.35 }}>{item}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* /RIGHT */}
          </div>
        </div>
      </div>


      {/* ===== DISCOUNT ===== */}
      <div className="container-xxl py-4 destination">
        <div className="container">
          <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
            {/* ✅ Heading (sb-heading giống Service) */}
            <div className="sb-heading sb-heading--md mx-auto" style={{ marginBottom: 6 }}>
              <span className="sb-heading__lines sb-heading__lines--left">
                <span className="sb-heading__line sb-heading__line--long" />
                <span className="sb-heading__line sb-heading__line--short" />
              </span>

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

              <span className="sb-heading__lines sb-heading__lines--right">
                <span className="sb-heading__line sb-heading__line--long" />
                <span className="sb-heading__line sb-heading__line--short" />
              </span>
            </div>

            <h1 className="mb-4" style={{ fontSize: "28px" }}>
              Save big today!
            </h1>
          </div>

          {discountedRooms.length === 0 ? (
            <p className="text-center text-muted mb-0">
              Currently there are no discount rooms.
            </p>
          ) : (
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
              style={{ padding: "4px 0 16px" }}
              breakpoints={{
                0: { slidesPerView: 1 },
                576: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1200: { slidesPerView: 4 },
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
          )}
        </div>
      </div>

      {/* ===== HOTEL (POPULAR) ===== */}
      <div className="container-xxl py-4 destination">
        <div className="container">
          <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
            {/* ✅ Heading (sb-heading giống Service) */}
            <div className="sb-heading sb-heading--md mx-auto" style={{ marginBottom: 6 }}>
              <span className="sb-heading__lines sb-heading__lines--left">
                <span className="sb-heading__line sb-heading__line--long" />
                <span className="sb-heading__line sb-heading__line--short" />
              </span>

              <h6
                className="sb-heading__label"
                style={{
                  fontSize: "26px",
                  fontWeight: 900,
                  letterSpacing: "0.18em",
                }}
              >
                HOTEL
              </h6>

              <span className="sb-heading__lines sb-heading__lines--right">
                <span className="sb-heading__line sb-heading__line--long" />
                <span className="sb-heading__line sb-heading__line--short" />
              </span>
            </div>

            <h1 className="mb-4" style={{ fontSize: "28px" }}>
              Popular Hotel!
            </h1>
          </div>

          {popularHotels.length === 0 ? (
            <p className="text-center text-muted mb-0">
              Popular hotels will appear here when ratings are available.
            </p>
          ) : (
            <>
              <div className="row g-4">
                {popularHotelsToShow.map((hotel, index) => (
                  <HotelCard hotel={hotel} key={hotel.id ?? index} />
                ))}
              </div>

              {popularHotels.length > MAX_POPULAR_DISPLAY && (
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAllPopular((prev) => !prev)}
                    className="btn d-inline-flex align-items-center gap-2"
                    style={{
                      borderRadius: 999,
                      padding: "10px 22px",
                      fontSize: 15,
                      fontWeight: 700,
                      color: showAllPopular ? "#1f2937" : "#fff",
                      background: showAllPopular
                        ? "rgba(134,184,23,0.12)"
                        : "linear-gradient(135deg, #86B817, #9ad13b)",
                      border: showAllPopular
                        ? "1px solid rgba(134,184,23,0.45)"
                        : "none",
                      boxShadow: showAllPopular
                        ? "none"
                        : "0 10px 22px rgba(134,184,23,0.35)",
                      transition: "all .25s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 14px 28px rgba(134,184,23,0.45)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = showAllPopular
                        ? "none"
                        : "0 10px 22px rgba(134,184,23,0.35)";
                    }}
                  >
                    {showAllPopular ? (
                      <>
                        <span>Show less</span>
                        <span style={{ fontSize: 18 }}>↑</span>
                      </>
                    ) : (
                      <>
                        <span>Show more hotels</span>
                        <span style={{ fontSize: 18 }}>↓</span>
                      </>
                    )}
                  </button>
                </div>

              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
