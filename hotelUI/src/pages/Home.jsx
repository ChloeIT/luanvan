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

// 👇 import HeroContent (hero search bar)
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

  const { hotels } = useSelector((state) => state.hotel);
  const { rooms = [] } = useSelector((state) => state.room || {});
  const { user } = useSelector((state) => state.auth);

  const [popularHotels, setPopularHotels] = useState([]);

  // ➕ NEW: state điều khiển Show more / Show less
  const [showAllPopular, setShowAllPopular] = useState(false);
  const MAX_POPULAR_DISPLAY = 4;

  /* ===== POPULAR HOTELS ===== */
  useEffect(() => {
    const data = Array.isArray(hotels)
      ? hotels
        .filter((hotel) => Number(hotel.rating) > 4.5) // chỉ lấy > 4.5 sao
        .sort((a, b) => Number(b.rating) - Number(a.rating)) // sắp xếp từ cao xuống thấp
      : [];

    setPopularHotels(data);
  }, [hotels]);

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
      .sort((a, b) => b.discountPercent - a.discountPercent); // giảm dần theo % giảm
  }, [rooms]);

  /* ===== POPULAR HOTELS TO SHOW (SHOW MORE / LESS) ===== */
  const popularHotelsToShow = useMemo(() => {
    if (!Array.isArray(popularHotels)) return [];
    if (showAllPopular) return popularHotels;
    return popularHotels.slice(0, MAX_POPULAR_DISPLAY);
  }, [popularHotels, showAllPopular]);

  return (
    <>
      {/* ✅ HERO SEARCH BAR – đè lên nền banner từ Header.jsx */}
      <HeroContent />

      {/* ===== ABOUT ===== */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-5 align-items-stretch">
            {/* LEFT: Image */}
            <div
              className="col-lg-6 wow fadeInUp d-flex"
              data-wow-delay="0.1s"
            >
              <div
                className="position-relative w-100"
                style={{ maxHeight: 520, marginRight: "-32px" }}
              >
                <Image
                  src={about}
                  alt="About Image"
                  preview={false}
                  style={{ width: "110%", height: 480, display: "block" }}
                  imgStyle={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
              </div>
            </div>

            {/* RIGHT: Content */}
            <div
              className="col-lg-6 wow fadeInUp d-flex"
              data-wow-delay="0.3s"
            >
              <div
                className="w-100 h-100 d-flex flex-column justify-content-center"
                style={{ minHeight: 380 }}
              >
                <div
                  className="heading-line"
                  style={{ "--heading-gap": "12px" }}
                >
                  <h6 className="heading-text text-2xl text-primary text-uppercase">
                    About Us
                  </h6>
                  <span
                    style={{
                      display: "grid",
                      justifyItems: "start",
                      gap: "6px",
                      marginLeft: "2px",
                    }}
                  >
                    <span className="divider" style={{ "--w": "150px" }} />
                    <span
                      className="divider"
                      style={{ "--w": "100px", "--alpha": 0.6 }}
                    />
                  </span>
                </div>

                <h1 className="mb-4">
                  Welcome to <span className="text-primary">SB Hotel</span>
                </h1>

                {user ? (
                  <p>
                    Hello,{" "}
                    <span
                      style={{ fontWeight: 900, color: "var(--primary)" }}
                    >
                      {user?.fullName}
                    </span>
                  </p>
                ) : (
                  <Link to="/login">
                    Please log in to see your information.
                  </Link>
                )}

                <p className="mb-4">
                  Welcome to our hotel search and booking page!
                </p>
                <p className="mb-4">
                  Searching and booking hotels has never been easier. With a
                  convenient booking system and extensive hotel database, we’ll
                  help you find the ideal destination for all your trips.
                </p>

                <div className="row gy-2 gx-4 mb-0">
                  {[
                    "24/7 Service",
                    "Handpicked Hotels",
                    "5 Star Accommodations",
                    "Provide enough information",
                    "Promotions and offers",
                    "Upgrade membership",
                  ].map((item, i) => (
                    <div className="col-sm-6" key={i}>
                      <p className="mb-0 d-flex align-items-start fw-bold">
                        <FaArrowRight
                          className="mx-2"
                          style={{ color: "var(--primary)" }}
                        />
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== DISCOUNT ===== */}
      <div className="container-xxl py-5 destination">
        <div className="container">
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

          {discountedRooms.length === 0 ? (
            <p className="text-center text-muted">
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
              style={{ padding: "4px 0 20px" }}
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
                    linkToHotel={true} // pill tên hotel ở DISCOUNT có link
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>

      {/* ===== HOTEL (POPULAR) ===== */}
      <div className="container-xxl py-5 destination">
        <div className="container">
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
                Hotel
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

            <h1 className="mb-5">Popular Hotel!</h1>
          </div>

          {popularHotels.length === 0 ? (
            <p className="text-center text-muted">
              Popular hotels will appear here when ratings are available.
            </p>
          ) : (
            <>
              <div className="row g-4">
                {popularHotelsToShow.map((hotel, index) => (
                  <HotelCard
                    hotel={hotel}
                    key={hotel.id ?? index}
                  />
                ))}
              </div>

              {popularHotels.length > MAX_POPULAR_DISPLAY && (
                <div className="text-center mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-primary rounded-pill px-4"
                    onClick={() => setShowAllPopular((prev) => !prev)}
                  >
                    {showAllPopular ? "Show less" : "Show more"}
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
