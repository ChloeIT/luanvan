// src/components/ui/hotel/MainHotel.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { Discount } from "./Discount";
import { FilterHotel } from "./FilterHotel";
import { HotelCard } from "./HotelCard";

export const MainHotel = () => {
  const { hotels } = useSelector((state) => state.hotel);
  const { rooms } = useSelector((state) => state.room);

  // list hotel sau khi FILTER
  const [data, setData] = useState([]);

  /* ===== 1. Tính minPrice, maxPrice, maxCapacity cho từng hotel từ Redux.rooms ===== */
  const statsByHotel = useMemo(() => {
    if (!Array.isArray(rooms)) return {};

    const map = {};

    rooms.forEach((r) => {
      const hotelId = r?.hotel?.id ?? r?.hotelId ?? r?.hotel_id;

      const rawPrice = r?.finalPrice ?? r?.final_price ?? r?.price;
      const price = Number(rawPrice);

      const capacity = Number(r?.capacity ?? 0);

      if (!hotelId) return;

      if (!map[hotelId]) {
        map[hotelId] = {
          min: Number.isFinite(price) ? price : null,
          max: Number.isFinite(price) ? price : null,
          maxCapacity: Number.isFinite(capacity) ? capacity : null,
        };
        return;
      }

      // update min / max price
      if (Number.isFinite(price)) {
        if (map[hotelId].min == null || price < map[hotelId].min) {
          map[hotelId].min = price;
        }
        if (map[hotelId].max == null || price > map[hotelId].max) {
          map[hotelId].max = price;
        }
      }

      // update maxCapacity
      if (Number.isFinite(capacity)) {
        if (
          map[hotelId].maxCapacity == null ||
          capacity > map[hotelId].maxCapacity
        ) {
          map[hotelId].maxCapacity = capacity;
        }
      }
    });

    return map;
  }, [rooms]);

  /* ===== 2. Gắn stats vào mỗi hotel ===== */
  const hotelsWithPrice = useMemo(() => {
    if (!Array.isArray(hotels)) return [];
    return hotels.map((h) => {
      const info = statsByHotel[h.id] || {};
      return {
        ...h,
        minPrice: info.min ?? null,
        maxPrice: info.max ?? null,
        maxCapacity: info.maxCapacity ?? null,
      };
    });
  }, [hotels, statsByHotel]);

  /* ===== 3. Ban đầu hiển thị tất cả hotel ===== */
  useEffect(() => {
    setData(hotelsWithPrice);
  }, [hotelsWithPrice]);

  return (
    <>
      <Discount />

      <FilterHotel hotels={hotelsWithPrice} setHotels={setData} />

      <div className="container-xxl pb-5 pt-3">
        <div className="container">
          <div className="row g-4 mt-1">
            {data.length === 0 ? (
              <p className="text-center text-muted w-100">
                No hotels match your search.
              </p>
            ) : (
              data.map((hotel, index) => (
                <HotelCard hotel={hotel} key={index} />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};
