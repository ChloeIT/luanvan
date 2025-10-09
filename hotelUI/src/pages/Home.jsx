import React, { useEffect, useState } from "react";
import { Image } from "antd";
import { about, hotel1, hotel2, hotel3, hotel4 } from "../assets";
import { FaArrowRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import { HotelCard } from "../components/ui/hotel/HotelCard";
import { Link } from "react-router-dom";

export const Home = () => {
  const { hotels } = useSelector((state) => state.hotel);
  const [popularHotels, setPopularHotels] = useState([]);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const data = hotels.filter((hotel) => hotel.rating >= 4);
    setPopularHotels(data);
  }, [hotels]);

  return (
    <>
      {/* ===== ABOUT ===== */}
      <div className="container-xxl py-5">
        <div className="container">
          {/* 👇 kéo hai cột cao bằng nhau */}
          <div className="row g-5 align-items-stretch">
            {/* LEFT: Image */}
            <div className="col-lg-6 wow fadeInUp d-flex" data-wow-delay="0.1s">
              <div className="position-relative w-100" style={{ maxHeight: 520, marginRight: "-32px" }}>
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
            <div className="col-lg-6 wow fadeInUp d-flex" data-wow-delay="0.3s">
              {/* box này fill full chiều cao cột và căn giữa nội dung theo trục dọc */}
              <div className="w-100 h-100 d-flex flex-column justify-content-center" style={{ minHeight: 380 }}>
                <div className="heading-line" style={{ "--heading-gap": "12px" }}>
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
                    <span className="divider" style={{ "--w": "100px", "--alpha": 0.6 }} />
                  </span>
                </div>

                <h1 className="mb-4">
                  Welcome to <span className="text-primary">SB Hotel</span>
                </h1>

                {user ? (
                  <p>
                    Hello,{" "}
                    <span style={{ fontWeight: 900, color: "var(--primary)" }}>
                      {user?.username}
                    </span>
                  </p>
                ) : (
                  <Link to="/login">Please log in to see your information.</Link>
                )}

                <p className="mb-4">Welcome to our hotel search and booking page!</p>
                <p className="mb-4">
                  Searching and booking hotels has never been easier. With a convenient booking
                  system and extensive hotel database, we’ll help you find the ideal destination
                  for all your trips.
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
                        <FaArrowRight className="mx-2" style={{ color: "var(--primary)" }} />
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
            <div className="heading-line mx-auto" style={{ "--heading-gap": "14px" }}>
              {/* 2 gạch bên trái – căn lề phải */}
              <span
                style={{
                  display: "grid",
                  justifyItems: "end", // 👈 gạch thẳng hàng mép phải chữ
                  gap: "6px",
                  marginRight: "2px", // tạo khoảng cách nhỏ giữa chữ và gạch
                }}
              >
                <span className="divider" style={{ "--w": "120px" }} />
                <span className="divider" style={{ "--w": "60px", "--alpha": .45 }} />
              </span>

              <h6 className="heading-text text-3xl text-primary text-uppercase">
                Discount
              </h6>

              {/* 2 gạch bên phải */}
              <span
                style={{
                  display: "grid",
                  justifyItems: "start", // 👈 gạch bắt đầu từ mép trái chữ
                  gap: "6px",
                  marginLeft: "2px", // tạo khoảng cách nhỏ giữa chữ và gạch
                }}
              >
                <span className="divider" style={{ "--w": "120px" }} />
                <span className="divider" style={{ "--w": "60px", "--alpha": .45 }} />
              </span>
            </div>

            <h1 className="mb-5">Save big today!</h1>
          </div>

          <div className="row g-3">
            <div className="col-lg-7 col-md-6">
              <div className="row g-3">
                {/* Big Discount */}
                <div className="col-lg-12 col-md-12 wow zoomIn" data-wow-delay="0.1s">
                  <div className="position-relative d-block overflow-hidden">
                    <Image src={hotel1} alt="des-1 Image" width="860" height="200" />
                    <div className="bg-white text-danger fw-bold position-absolute top-0 start-0 m-3 py-1 px-2">
                      30% OFF
                    </div>
                    <div className="bg-white text-primary fw-bold position-absolute bottom-0 end-0 m-3 py-1 px-2">
                      Flower
                    </div>
                  </div>
                </div>

                {/* Two Smaller */}
                <div className="col-lg-6 col-md-12 wow zoomIn" data-wow-delay="0.3s">
                  <div className="position-relative d-block overflow-hidden">
                    <Image src={hotel2} alt="MeKong" width="380" height="200" />
                    <div className="bg-white text-danger fw-bold position-absolute top-0 start-0 m-3 py-1 px-2">
                      25% OFF
                    </div>
                    <div className="bg-white text-primary fw-bold position-absolute bottom-0 end-0 m-3 py-1 px-2">
                      MeKong
                    </div>
                  </div>
                </div>

                <div className="col-lg-6 col-md-12 wow zoomIn" data-wow-delay="0.5s">
                  <div className="position-relative d-block overflow-hidden">
                    <Image src={hotel3} alt="Thịnh Vượng" width="380" height="200" />
                    <div className="bg-white text-danger fw-bold position-absolute top-0 start-0 m-3 py-1 px-2">
                      35% OFF
                    </div>
                    <div className="bg-white text-primary fw-bold position-absolute bottom-0 end-0 m-3 py-1 px-2">
                      Thịnh Vượng
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Large */}
            <div className="col-lg-5 col-md-6 wow zoomIn min-h-80" data-wow-delay="0.7s">
              <div className="position-relative d-block h-100 overflow-hidden">
                <Image src={hotel4} alt="Tây Đô" width="500" height="415" />
                <div className="bg-white text-danger fw-bold position-absolute top-0 start-0 m-3 py-1 px-2">
                  20% OFF
                </div>
                <div className="bg-white text-primary fw-bold position-absolute bottom-0 end-0 m-3 py-1 px-2">
                  Tây Đô
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== HOTEL ===== */}
      <div className="container-xxl py-5 destination">
        <div className="container">
          <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
            <div className="heading-line mx-auto" style={{ "--heading-gap": "14px" }}>
              {/* 2 gạch bên trái – căn lề phải */}
              <span
                style={{
                  display: "grid",
                  justifyItems: "end", // 👈 gạch thẳng hàng mép phải chữ
                  gap: "6px",
                  marginRight: "2px", // tạo khoảng cách nhỏ giữa chữ và gạch
                }}
              >
                <span className="divider" style={{ "--w": "120px" }} />
                <span className="divider" style={{ "--w": "60px", "--alpha": .45 }} />
              </span>

              <h6 className="heading-text text-3xl text-primary text-uppercase">
                Hotel
              </h6>

              {/* 2 gạch bên phải */}
              <span
                style={{
                  display: "grid",
                  justifyItems: "start", // 👈 gạch bắt đầu từ mép trái chữ
                  gap: "6px",
                  marginLeft: "2px", // tạo khoảng cách nhỏ giữa chữ và gạch
                }}
              >
                <span className="divider" style={{ "--w": "120px" }} />
                <span className="divider" style={{ "--w": "60px", "--alpha": .45 }} />
              </span>
            </div>

            <h1 className="mb-5">Popular Hotel!</h1>
          </div>

          <div className="row g-4">
            {popularHotels.map((hotel, index) => (
              <HotelCard hotel={hotel} key={index} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
