import React, { useEffect, useMemo, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import { Image } from "antd";
import { formatDateTime } from "./../../../utils/dateService";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export const BookingItem = ({ item }) => {
  const today = new Date();
  const todayFormatted = formatDateTime(today);
  const todayDate = today.toISOString().split("T")[0];

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(todayDate);
  const [checkOut, setCheckOut] = useState(tomorrowDate);
  const [totalPrice, setTotalPrice] = useState(0);
  const [hotelCardColor, setHotelCardColor] = useState("#ffffb0"); // fallback

  const navigate = useNavigate();
  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;
  const { hotels } = useSelector((state) => state.hotel);

  // Tìm hotel chứa room hiện tại
  const foundHotel = useMemo(() => {
    return hotels.find(
      (hotel) =>
        Array.isArray(hotel.rooms) &&
        hotel.rooms.some((r) => String(r.id) === String(item.id))
    );
  }, [hotels, item]);

  const hotelName =
    item?.hotelName || item?.hotel?.name || foundHotel?.name || "Unknown";
  const hotelAddress =
    item?.hotel?.address || foundHotel?.address || "Unknown";

  const [data, setData] = useState({
    checkIn: todayFormatted,
    checkOut: todayFormatted,
    totalPrice: 0,
    image: item.image,
    name: item.name,
  });

  useEffect(() => {
    const numberOfDays =
      checkIn && checkOut
        ? differenceInCalendarDays(new Date(checkOut), new Date(checkIn))
        : 0;

    const calculatedTotalPrice = item.price * Math.max(0, numberOfDays);
    setTotalPrice(calculatedTotalPrice);

    setData((prev) => ({
      ...prev,
      roomId: item?.id,
      checkIn: formatDateTime(new Date(checkIn)),
      checkOut: formatDateTime(new Date(checkOut)),
      totalPrice: calculatedTotalPrice,
      image: item.image,
      name: item.name,
      hotelName,
      hotelAddress,
    }));
  }, [checkIn, checkOut, item, hotelName, hotelAddress]);

  // Lấy màu vàng từ HotelCard
  useEffect(() => {
    const hotelEl = document.querySelector(".hotel-card-body");
    if (hotelEl) {
      const bg = getComputedStyle(hotelEl).backgroundColor;
      if (bg) setHotelCardColor(bg);
    }
  }, []);

  const bookThisPlace = () => {
    localStorage.setItem("bookData", JSON.stringify(data));
    navigate("checkout");
  };

  // nights để hiển thị badge
  const nights = Math.max(
    0,
    differenceInCalendarDays(new Date(checkOut), new Date(checkIn))
  );
  const isRangeValid = nights > 0;

  // style input dịu màu (inline)
  const inputStyle = {
    width: "100%",
    background: "#F9FAFB",
    color: "#111827",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "10px 12px",
    lineHeight: 1.2,
    outline: "none",
    WebkitAppearance: "auto",
    appearance: "auto",
  };

  return (
    <div className="my-3">
      {/* ===== Heading ===== */}
      <div className="text-center mt-6 mb-4">
        <div className="heading-line mx-auto" style={{ "--heading-gap": "14px" }}>
          <span style={{ display: "grid", justifyItems: "end", gap: "6px", marginRight: "2px" }}>
            <span className="divider" style={{ "--w": "120px" }} />
            <span className="divider" style={{ "--w": "60px", "--alpha": 0.45 }} />
          </span>

          <h6 className="heading-text text-3xl text-primary text-uppercase">Booking</h6>

          <span style={{ display: "grid", justifyItems: "start", gap: "6px", marginLeft: "2px" }}>
            <span className="divider" style={{ "--w": "120px" }} />
            <span className="divider" style={{ "--w": "60px", "--alpha": 0.45 }} />
          </span>
        </div>

        <h1 className="mb-5">Room Information</h1>
      </div>

      {/* ===== Hình + Thông tin ===== */}
      <div className="container-xxl px-3 md:px-4">
        <div
          className="flex flex-col md:flex-row justify-center gap-6 w-full"
          style={{ alignItems: "stretch", minHeight: "320px" }}
        >
          {/* === ẢNH PHÒNG === */}
          <div
            className="flex"
            style={{ flexBasis: "35%", maxWidth: "35%", flexShrink: 0 }}
          >
            <div
              style={{
                flex: 1,
                borderRadius: "18px",
                overflow: "hidden",
                boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
              }}
            >
              <img
                src={`${IMAGE_URL}/rooms/${item.image}`}
                alt={item.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          </div>

          {/* === THÔNG TIN PHÒNG === */}
          <div
            className="flex items-center justify-center rounded-2xl p-8"
            style={{
              flexBasis: "65%",
              maxWidth: "65%",
              background: "var(--card-yellow)",
            }}
          >
            <div
              className="text-lg font-semibold leading-relaxed"
              style={{
                width: "100%",
                lineHeight: "1.9",
                display: "grid",
                gridTemplateColumns: "160px 1fr",
                alignItems: "center",
                rowGap: "10px",
                columnGap: "8px",
              }}
            >
              <span className="text-[#FFC30B] text-left text-xl">Hotel name:</span>
              <span className="text-primary text-2xl font-extrabold text-left">
                {hotelName}
              </span>

              <span className="text-[#FFC30B] text-left text-xl">Room name:</span>
              <span className="text-gray-700 text-left">{item.name}</span>

              <span className="text-[#FFC30B] text-left text-xl">Address:</span>
              <span className="text-gray-700 text-left">{hotelAddress}</span>

              <span className="text-[#FFC30B] text-left text-xl">Capacity:</span>
              <span className="text-gray-700 text-left">{item.capacity} people</span>

              <span className="text-[#FFC30B] text-left text-xl">Price:</span>
              <span className="text-gray-700 text-left">{item.price} $ / night</span>
            </div>
          </div>
        </div>

        {/* ===== Ô thanh toán (inline-only) ===== */}
        <div className="mt-6" style={{ colorScheme: "light" }}>
          <div className="bg-white shadow rounded-2xl p-4 md:p-5">
            {/* HÀNG 1: Ngày vào/ra */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Check in */}
              <label
                className="flex flex-col gap-1 border rounded-xl p-3"
                style={{ borderColor: "#e5e7eb" }}
              >
                <span className="text-sm" style={{ color: "#6b7280" }}>
                  Check in
                </span>
                <input
                  type="date"
                  required
                  value={checkIn}
                  min={todayDate}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCheckIn(v);
                    // nếu checkout <= checkin → auto set checkOut = checkIn + 1
                    const next = new Date(v);
                    next.setDate(next.getDate() + 1);
                    const nextStr = next.toISOString().split("T")[0];
                    if (!checkOut || checkOut <= v) setCheckOut(nextStr);
                  }}
                  style={inputStyle}
                />
              </label>

              {/* Check out */}
              <label
                className="flex flex-col gap-1 border rounded-xl p-3"
                style={{ borderColor: "#e5e7eb" }}
              >
                <span className="text-sm" style={{ color: "#6b7280" }}>
                  Check out
                </span>
                <input
                  type="date"
                  required
                  value={checkOut}
                  min={(() => {
                    const d = new Date(checkIn || todayDate);
                    d.setDate(d.getDate() + 1);
                    return d.toISOString().split("T")[0];
                  })()}
                  onChange={(e) => setCheckOut(e.target.value)}
                  style={inputStyle}
                />
              </label>
            </div>

            {/* HÀNG 2: Tóm tắt giá */}
            <div className="mt-3 md:mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="text-gray-700">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-sm"
                    style={{
                      background: "#FFFBEB",
                      color: "#a16207",
                      border: "1px solid #fde68a",
                    }}
                  >
                    {isRangeValid ? `${nights} night${nights > 1 ? "s" : ""}` : "—"}
                  </span>
                  <span className="text-sm">
                    Price: <b>{item.price}$ / night</b>
                  </span>
                  {isRangeValid && (
                    <span className="text-sm text-gray-500">
                      ({nights} × {item.price}$)
                    </span>
                  )}
                </div>
                {!isRangeValid && (
                  <p className="mt-1 text-sm" style={{ color: "#dc2626" }}>
                    Check-out phải sau check-in ít nhất 1 ngày.
                  </p>
                )}
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500">Total price</div>
                <div className="text-2xl font-bold text-gray-900">
                  {totalPrice}$
                </div>
              </div>
            </div>

            {/* HÀNG 3: CTA */}
            <div className="mt-4 flex items-center justify-end">
              <button
                type="button"
                onClick={bookThisPlace}
                className="btn btn-primary mt-4"
                style={{
                  borderRadius: 9999,        // pill
                  padding: "10px 18px",      // tăng đệm cho đẹp
                  boxShadow: "0 6px 18px rgba(0,0,0,.12)"
                }}
              >
                Book this place
              </button>

            </div>
          </div>
        </div>
        {/* ===== /Ô thanh toán ===== */}
      </div>
    </div>
  );
};
