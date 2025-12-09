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
  // số thẻ đang hiển thị
  const [visibleCount, setVisibleCount] = useState(4);

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

  /* ===== 3. Ban đầu hiển thị tất cả hotel (reset visibleCount = 4) ===== */
  useEffect(() => {
    setData(hotelsWithPrice);
    setVisibleCount(4);
  }, [hotelsWithPrice]);

  /* ===== 4. Nếu filter làm số lượng kết quả < visibleCount → thu lại ===== */
  useEffect(() => {
    setVisibleCount((prev) => {
      if (!Array.isArray(data)) return 4;
      const len = data.length;
      if (len === 0) return 0;
      // giữ số đang xem nhưng không vượt quá length, tối thiểu 4
      return Math.min(Math.max(4, prev), len);
    });
  }, [data]);

  /* ===== HANDLER "Show more" ===== */
  const handleShowMore = () => {
    setVisibleCount((prev) => {
      if (!Array.isArray(data)) return prev;
      const next = prev + 4; // mỗi lần thêm 4
      return next > data.length ? data.length : next;
    });
  };

  return (
    <>
      {/* Discount section – thu nhỏ một chút */}
      <div className="mt-2 mb-1">
        <Discount />
      </div>

      {/* Filter section */}
      <div className="mt-0 mb-2">
        <FilterHotel hotels={hotelsWithPrice} setHotels={setData} />
      </div>

      {/* List hotel + Show more */}
      <div className="container-xxl pt-2 pb-4">
        <div className="container">
          <div className="row g-4 mt-1">
            {(!data || data.length === 0) ? (
              <p className="text-center text-muted w-100 mt-3" style={{ fontSize: "15px" }}>
                No hotels match your search.
              </p>
            ) : (
              // CHỈ HIỂN THỊ TỚI visibleCount
              data.slice(0, visibleCount).map((hotel, index) => (
                <HotelCard hotel={hotel} key={index} />
              ))
            )}
          </div>

          {/* Nút Show more */}
          {data && data.length > visibleCount && (
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={handleShowMore}
                className="btn rounded-pill px-4 py-2"
                style={{
                  color: "var(--primary)",
                  border: "2px solid var(--primary)",
                  backgroundColor: "transparent",
                  fontWeight: 600,
                  transition: "all 0.25s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--primary)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--primary)";
                }}
              >
                Show more hotels
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
};
