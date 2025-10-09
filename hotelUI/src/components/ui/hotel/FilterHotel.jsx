import React, { useState } from "react";

export const FilterHotel = ({ hotels, setHotels }) => {
  const [selectedRating, setSelectedRating] = useState(0);

  const handleRatingChange = (e) => {
    const rating = Number(e.target.value);
    setSelectedRating(rating);
    setHotels(
      selectedRating == 0
        ? hotels
        : hotels.filter((hotel) => hotel.rating >= rating)
    );
  };

  return (
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

            <h6 className="heading-text text-3xl text-primary text-uppercase">Filter</h6>

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

          <h1 className="mb-5">Your hotel, your way!</h1>
        </div>


        <form onSubmit={(e) => e.preventDefault()}>
          <div className="row g-3">
            <div className="">
              <label htmlFor="star_rating" className="form-label">
                Rating:
              </label>
              <select
                className="form-select"
                id="star_rating"
                name="star_rating"
                value={selectedRating}
                onChange={handleRatingChange}
              >
                <option value={0}>All</option>
                <option value={1}>1 star</option>
                <option value={2}>2 stars</option>
                <option value={3}>3 stars</option>
                <option value={4}>4 stars</option>
                <option value={5}>5 stars</option>
              </select>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
