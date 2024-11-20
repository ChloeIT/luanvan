import React, { useEffect, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import { Image } from "antd";
import { formatDateTime } from "./../../../utils/dateService";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;
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
    const calculatedTotalPrice = item.price * numberOfDays;

    setTotalPrice(calculatedTotalPrice);

    // Cập nhật `data` state với thông tin đầy đủ bao gồm giờ, phút, giây
    setData({
      ...data,
      roomId: item?.id,
      checkIn: formatDateTime(new Date(checkIn)), // Chuyển ngày input sang định dạng đầy đủ
      checkOut: formatDateTime(new Date(checkOut)), // Chuyển ngày input sang định dạng đầy đủ
      totalPrice: calculatedTotalPrice,
      image: item.image,
      name: item.name,
    });
  }, [checkIn, checkOut, item]);

  useEffect(() => {
    console.log(data);
  }, [data]);

  const bookThisPlace = () => {
    localStorage.setItem("bookData", JSON.stringify(data));
    navigate("checkout");
  };

  return (
    <div className="my-3">
      <p className="text-4xl text-center text-primary items-center justify-center font-extrabold mt-6 ">
        ROOM INFORMATION
      </p>
      <div className="flex space-x-3 justify-center items-center">
        <div>
          <Image width={200} src={`${IMAGE_URL}/rooms/${item.image}`} />
        </div>
        <div className=" ">
          <p>Room name: {item.name}</p>
          <p>Room type: {item.type}</p>
          <p>Capacity: {item.capacity}</p>
          <p>Price: {item.price} $/night</p>
        </div>
        <div>
          <div className="bg-white shadow p-4 rounded-2xl">
            <div className="border rounded-2xl">
              <div className="flex">
                <div className=" py-3 px-4 ">
                  <label>Check in: </label>
                  <input
                    type="date"
                    required
                    value={checkIn} // Chỉ hiển thị ngày (YYYY-MM-DD) trong input
                    onChange={(ev) => setCheckIn(ev.target.value)} // Cập nhật ngày khi thay đổi
                  />
                </div>
                <div className=" py-3 px-4 border-l ">
                  <label>Check Out: </label>
                  <input
                    type="date"
                    required
                    value={checkOut} // Chỉ hiển thị ngày (YYYY-MM-DD) trong input
                    onChange={(ev) => setCheckOut(ev.target.value)} // Cập nhật ngày khi thay đổi
                  />
                </div>
              </div>
            </div>
            <div className="flex mt-2 justify-between">
              <p>Price: {item.price} $/per night</p>
              <p>Total price: {totalPrice}$</p>
            </div>
            <button
              onClick={bookThisPlace}
              className=" primary btn btn-primary mt-4"
            >
              Book this place
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
