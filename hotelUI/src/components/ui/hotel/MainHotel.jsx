import { Image } from "antd";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Discount } from "./Discount";
import { FilterHotel } from "./FilterHotel";
import { HotelCard } from "./HotelCard";

export const MainHotel = () => {
  const { hotels } = useSelector((state) => state.hotel);
  const [data, setData] = useState([]);

  useEffect(()=> {
    setData(hotels)
  },[hotels])
  return (
    <>
      <Discount />
      <FilterHotel hotels={hotels} setHotels={setData} />{" "}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
            <h6 className=" text-2xl text-center text-primary px-3">
              List Hotel
            </h6>
            <h1 className="mb-5">For every need, every budget!</h1>
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
