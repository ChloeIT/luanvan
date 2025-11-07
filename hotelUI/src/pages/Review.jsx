import React, { useState } from "react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/autoplay";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import { FaStar } from "react-icons/fa";

// images
import review1 from "../assets/images/review/review1.jpg";
import review2 from "../assets/images/review/review2.jpg";
import review3 from "../assets/images/review/review3.jpg";
import review4 from "../assets/images/review/review4.jpg";
import review5 from "../assets/images/review/review5.jpg";
import review6 from "../assets/images/review/review6.jpg";
import review7 from "../assets/images/review/review7.jpg";
import review8 from "../assets/images/review/review8.jpg";

const testimonialData = [
  { name: "Chloe", location: "Hà Nội - Việt Nam", rating: 5, date: "2024-11-01", review: "Khách sạn view đẹp, rộng rãi, nhân viên nhiệt tình.", image: review2, verified: true },
  { name: "Khanh Linh", location: "Đà Nẵng - Việt Nam", rating: 5, date: "2024-11-02", review: "Một kì nghỉ tuyệt vời cùng gia đình.", image: review3, verified: true },
  { name: "Hoàng Bách", location: "Sài Gòn - Việt Nam", rating: 4.5, date: "2024-11-03", review: "Khách sạn sạch sẽ, thoáng mát, được giải quyết nâng hạng phòng nhanh chóng.", image: review4, verified: true },
  { name: "Emma", location: "Singapore", rating: 4.8, date: "2024-11-04", review: "Great vacation, my family was very satisfied.", image: review5, verified: true },
  { name: "Pamela", location: "Rạch Giá - Việt Nam", rating: 4.6, date: "2024-11-05", review: "Convenient location, spacious rooms and attentive service.", image: review8, verified: true },
  { name: "Tuệ Mẫn", location: "Bình Phước - Việt Nam", rating: 4.7, date: "2024-11-06", review: "Phòng ốc sạch sẽ và thoải mái, nhân viên thân thiện và nhiệt tình.", image: review6, verified: true },
  { name: "Daisy", location: "Thailand", rating: 4.9, date: "2024-11-06", review: "Beautiful room, great view and professional service. I will recommend to my friends and family.", image: review7, verified: false },
  { name: "Harry Potter", location: "Hogwarts", rating: 4.4, date: "2024-11-07", review: "Great service and reasonable prices. I had a relaxing vacation.", image: review1, verified: false }
];

// Small, reusable card
const TestimonialCard = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const maxChars = 110;
  const needsClamp = item.review.length > maxChars;
  const text = expanded ? item.review : (needsClamp ? item.review.slice(0, maxChars) + "..." : item.review);

  const fullStars = Math.floor(item.rating);
  const half = item.rating - fullStars >= 0.5;

  return (
    <div className="h-full rounded-3xl bg-amber-100/90 border border-amber-200/70 p-5 text-center shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="relative mx-auto mb-3 w-20 h-20">
        <img
          src={item.image}
          alt={`Ảnh khách ${item.name}`}
          loading="lazy"
          className="w-20 h-20 rounded-full object-cover ring-4 ring-yellow-200"
        />
        {item.verified && (
          <span
            className="absolute -bottom-1 -right-1 text-[10px] bg-green-600 text-white px-2 py-[2px] rounded-full shadow"
            title="Verified guest"
            aria-label="Verified guest"
          >
            ✓ Verified
          </span>
        )}
      </div>

      <h5 className="mb-0 font-semibold">{item.name}</h5>
      <p className="text-sm text-gray-600">{item.location}</p>

      {/* Stars */}
      <div className="flex items-center justify-center gap-1 my-2" aria-label={`Rating ${item.rating} out of 5`}>
        {Array.from({ length: fullStars }).map((_, i) => <FaStar key={`s${i}`} />)}
        {half && <FaStar className="opacity-60" title="half" />}
        <span className="ml-2 text-sm text-gray-600">{item.rating.toFixed(1)}</span>
      </div>

      {/* Review text */}
      <p className="mt-2 text-[15px] leading-relaxed">
        {text}
        {needsClamp && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="ml-1 text-primary underline decoration-dotted"
            aria-expanded={expanded}
          >
            {expanded ? "Thu gọn" : "Xem thêm"}
          </button>
        )}
      </p>

      <p className="mt-3 text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
    </div>
  );
};

export const Review = () => {
  return (
    <div className="container-xxl py-5 wow fadeInUp" data-wow-delay="0.1s">
      <div className="container">
        {/* Heading block */}
        <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
          <div className="heading-line mx-auto" style={{ "--heading-gap": "14px" }}>
            <span style={{ display: "grid", justifyItems: "end", gap: "6px", marginRight: "2px" }}>
              <span className="divider" style={{ "--w": "120px" }} />
              <span className="divider" style={{ "--w": "60px", "--alpha": .45 }} />
            </span>
            <h6 className="heading-text text-3xl text-primary text-uppercase">Review</h6>
            <span style={{ display: "grid", justifyItems: "start", gap: "6px", marginLeft: "2px" }}>
              <span className="divider" style={{ "--w": "120px" }} />
              <span className="divider" style={{ "--w": "60px", "--alpha": .45 }} />
            </span>
          </div>
          <h1 className="mb-1">Our Customers Say!!!</h1>
          {/* Summary quick stats (tĩnh, có thể thay bằng API) */}
          <p className="text-gray-600">⭐ 4.7/5 · 230+ reviews · Verified guests</p>
        </div>

        {/* Carousel */}
        <div className="mt-6">
          <Swiper
            modules={[FreeMode, Autoplay]}
            freeMode
            speed={900}                 // ✅ sửa peed -> speed
            autoplay={{ delay: 2600, disableOnInteraction: false }}
            loop
            spaceBetween={18}
            breakpoints={{
              0: { slidesPerView: 1.1 },
              480: { slidesPerView: 1.4 },
              640: { slidesPerView: 2.1 },
              768: { slidesPerView: 2.6 },
              1024: { slidesPerView: 3.2 },
              1280: { slidesPerView: 4.0 },
            }}
          >
            {testimonialData.map((item, idx) => (
              <SwiperSlide key={idx} className="!h-auto">
                <TestimonialCard item={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <a href="/hotel" className="inline-block px-6 py-3 rounded-full bg-primary text-white hover:opacity-90">
            Xem phòng trống & Đặt ngay
          </a>
        </div>
      </div>
    </div>
  );
};
