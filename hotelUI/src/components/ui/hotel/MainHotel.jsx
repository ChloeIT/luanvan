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
              <span className="divider" />
              <h6 className="heading-text text-2xl text-primary text-uppercase">List Hotel</h6>
              <span className="divider" />
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
