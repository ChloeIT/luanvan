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
  const [hotelCardColor, setHotelCardColor] = useState("#ffffb0"); // fallback màu vàng nếu chưa có

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

  const hotelName = item?.hotelName || item?.hotel?.name || foundHotel?.name || "Unknown";
  const hotelAddress = item?.hotel?.address || foundHotel?.address || "Unknown";

  const [data, setData] = useState({
    checkIn: todayFormatted,
    checkOut: todayFormatted,
    totalPrice: 0,
    image: item.image,
    name: item.name,
  });

  useEffect(() => {
    // Tính tổng tiền
    const numberOfDays =
      checkIn && checkOut
        ? differenceInCalendarDays(new Date(checkOut), new Date(checkIn))
        : 0;

    const calculatedTotalPrice = item.price * numberOfDays;
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
      <div className="container-xxl px-3 md:px-4">   {/* giống Process */}
        <div
          className="flex flex-col md:flex-row justify-center gap-6 w-full"
          style={{ alignItems: "stretch", minHeight: "320px" }}
        >

          {/* === ẢNH PHÒNG – 30% === */}
          <div
            className="flex"
            style={{
              flexBasis: "35%",
              maxWidth: "35%",
              flexShrink: 0,
            }}
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

          {/* === THÔNG TIN PHÒNG – 70% === */}
          <div
            className="flex items-center justify-center rounded-2xl p-8"
            style={{
              flexBasis: "65%",
              maxWidth: "65%",
              background: "var(--card-yellow)"
            }}
          >
            <div
              className="text-lg font-semibold leading-relaxed"
              style={{
                width: "100%",
                lineHeight: "1.9",
                display: "grid",
                gridTemplateColumns: "160px 1fr", // 2 cột nhãn + nội dung
                alignItems: "center",
                rowGap: "10px",
                columnGap: "8px",
              }}
            >
              <span className="text-[#FFC30B] text-left text-xl ">Hotel name:</span>
              <span className="text-primary text-2xl font-extrabold text-left">{hotelName}</span>

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


        {/* ===== Ô thanh toán ===== */}
        <div className="mt-6">
          <div className="bg-white shadow p-4 rounded-2xl">
            <div className="border rounded-2xl">
              <div className="flex flex-col md:flex-row">
                <div className="py-3 px-4 flex-1">
                  <label>Check in: </label>
                  <input
                    type="date"
                    required
                    value={checkIn}
                    onChange={(ev) => setCheckIn(ev.target.value)}
                  />
                </div>
                <div className="py-3 px-4 border-t md:border-t-0 md:border-l flex-1">
                  <label>Check out: </label>
                  <input
                    type="date"
                    required
                    value={checkOut}
                    onChange={(ev) => setCheckOut(ev.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex mt-2 justify-between">
              <p>Price: {item.price} $ / night</p>
              <p>Total price: {totalPrice}$</p>
            </div>

            <button onClick={bookThisPlace} className="btn btn-primary mt-4">
              Book this place
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
