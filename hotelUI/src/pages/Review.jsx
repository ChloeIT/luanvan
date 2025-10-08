import React from "react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/autoplay";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";

// Bạn cần import hình ảnh ở đây
import review1 from "../assets/images/review/review1.jpg";
import review2 from "../assets/images/review/review2.jpg";
import review3 from "../assets/images/review/review3.jpg";
import review4 from "../assets/images/review/review4.jpg";
import review5 from "../assets/images/review/review5.jpg";
import review6 from "../assets/images/review/review6.jpg";
import review7 from "../assets/images/review/review7.jpg";
import review8 from "../assets/images/review/review8.jpg";
import { Link } from "react-router-dom";

const testimonialData = [
  {
    name: "Chloe",
    location: "Hà Nội - Việt Nam",
    review: "Khách sạn view đẹp, rộng rãi, nhân viên nhiệt tình.",
    image: review2,
  },
  {
    name: "Khanh Linh",
    location: "Đà Nẵng - Việt Nam",
    review: "Một kì nghỉ tuyệt vời cùng gia đình.",
    image: review3,
  },
  {
    name: "Hoàng Bách",
    location: "Sài Gòn - Việt Nam",
    review:
      "Khách sạn sạch sẽ, thoáng mát, được giải quyết nâng hạng phòng nhanh chóng.",
    image: review4,
  },
  {
    name: "Emma",
    location: "Singapore",
    review: "Great vacation, my family was very satisfied.",
    image: review5,
  },
  {
    name: "Pamela",
    location: "Rạch Giá - Việt Nam",
    review: "Convenient location, spacious rooms and attentive service.",
    image: review8,
  },
  {
    name: "Tuệ Mẫn",
    location: "Bình Phước - Việt Nam",
    review:
      "Phòng ốc sạch sẽ và thoải mái, nhân viên thân thiện và nhiệt tình.",
    image: review6,
  },
  {
    name: "Daisy",
    location: "Thailand",
    review:
      "Beautiful room, great view and professional service. I am very satisfied and will recommend to my friends and family.",
    image: review7,
  },
  {
    name: "Harry Potter",
    location: "Hogwarts",
    review:
      "Great service and reasonable prices. I had a relaxing vacation and will come back when the opportunity arises.",
    image: review1,
  },
];

export const Review = () => {
  return (
    <div className="container-xxl py-5 wow fadeInUp" data-wow-delay="0.1s">
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
            <h6 className="heading-text text-3xl text-primary">Review</h6>

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

          <h1 className="mb-5">Our Customers Say!!!</h1>
        </div>


        <div className="owl-carousel rounded-full testimonial-carousel position-relative">
          <Swiper
            slidesPerView="auto"
            spaceBetween={15}
            freeMode
            modules={[FreeMode, Autoplay]}
            peed={1000}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            className="mt-4"
          >
            {testimonialData?.map((testimonial, index) => {
              if (!testimonial) {
                return null;
              }
              return (
                <SwiperSlide
                  key={index}
                  style={{ width: "25%", height: "auto" }}
                  className="shadow-lg rounded-full animate-slideright"
                >
                  <div
                    key={index}
                    className="testimonial-item h-full rounded-full bg-amber-200 text-center border p-4"
                  >
                    <img
                      className="  shadow p-1 mx-auto mb-3"
                      src={testimonial.image}
                      alt={testimonial.name}
                      style={{ width: "80px", height: "80px" }}
                    />
                    <h5 className="mb-0">{testimonial.name}</h5>
                    <p>{testimonial.location}</p>
                    <p className="mt-2 mb-0">{testimonial.review}</p>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </div>
  );
};
