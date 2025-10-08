import { Image } from "antd";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Discount } from "./Discount";
import { FilterHotel } from "./FilterHotel";
import { HotelCard } from "./HotelCard";

export const MainHotel = () => {
  const { hotels } = useSelector((state) => state.hotel);
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(hotels)
  }, [hotels])
  return (
    <>
      <Discount />
      <FilterHotel hotels={hotels} setHotels={setData} />{" "}
      <div className="container-xxl py-5">
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

              <h6 className="heading-text text-3xl text-primary text-uppercase">List Hotel</h6>

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


          <div className="row g-4">
            {data &&
              data.map((hotel, index) => {
                return <HotelCard hotel={hotel} key={index} />;
              })}
          </div>
        </div>
      </div>
    </>
  );
};
