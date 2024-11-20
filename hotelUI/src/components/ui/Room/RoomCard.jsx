import { Button } from "antd";
import React, { useState } from "react";
import { BsCurrencyDollar } from "react-icons/bs";
import { FaUserLarge } from "react-icons/fa6";
import { IoMdPricetags } from "react-icons/io";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { CiCirclePlus, CiCircleMinus } from "react-icons/ci";
import { Link } from "react-router-dom";

export const RoomCard = ({ room, isFavorite }) => {
  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

  const [isCompare, setIsCompare] = useState(() => {
    const compareList = JSON.parse(localStorage.getItem("compareRooms")) || [];
    return compareList.some((r) => r.id === room.id);
  });

  const addToCompare = (room) => {
    const currentCompareList =
      JSON.parse(localStorage.getItem("compareRooms")) || [];
    if (!isCompare) {
      currentCompareList.push(room);
      localStorage.setItem("compareRooms", JSON.stringify(currentCompareList));
      setIsCompare(true); // Cập nhật trạng thái
      console.log(`Room ${room.name} added to compare list`);
    }
  };

  const removeFromCompare = (room) => {
    const currentCompareList =
      JSON.parse(localStorage.getItem("compareRooms")) || [];
    const updatedCompareList = currentCompareList.filter(
      (r) => r.id !== room.id
    );
    localStorage.setItem("compareRooms", JSON.stringify(updatedCompareList));
    setIsCompare(false); // Cập nhật trạng thái
    console.log(`Room ${room.name} removed from compare list`);
  };

  return (
    <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
      <div>
        <div className="team-item bg-[#fdff7c]">
          <div className="overflow-hidden">
            <img
              className="img-fluid"
              src={`${IMAGE_URL}/rooms/${room.image}`}
              alt=""
            />
          </div>
          <div
            className="position-relative d-flex justify-content-center"
            style={{ marginTop: "-35px" }}
          >
            <button className="btn btn-primary text-white rounded-pill py-2 px-4">
              <i className="fas fa-hand-holding-usd text-warning"></i>
              <span className="ms-2">
                {room.type}
                <i className="fas fa-dollar-sign"></i>
              </span>
            </button>
          </div>
          <div className="text-center p-3" style={{ marginTop: "-2px" }}>
            <h5 className="primarycolor mb-1">{room.name}</h5>
          </div>
          <div className="d-flex justify-content-center mt-1">
            <p className="mb-2 d-flex align-items-center">
              <IoMdPricetags className="me-2" />
              {room.price} <BsCurrencyDollar />
            </p>
          </div>
          <div className="d-flex justify-content-center mt-2">
            <p className="mb-2 d-flex align-items-center">
              <FaUserLarge className="me-2" />
              {room.capacity}
            </p>
          </div>
          <div className="d-flex justify-content-center text-primary">
            {isFavorite ? (
              <FaHeart
                onClick={() => console.log("Remove from favorites")}
                title="Remove room from favorites"
                className="me-2 cursor-pointer"
                style={{ fontSize: "1.5rem" }}
              />
            ) : (
              <FaRegHeart
                onClick={() => console.log("Add to favorites")}
                title="Add room to favorites"
                className="me-2 cursor-pointer"
                style={{ fontSize: "1.5rem" }}
              />
            )}
            <Button>
              {room.availability ? (
                <Link to={`/booking/${room.id}`}>Book now</Link>
              ) : (
                "Booked"
              )}
            </Button>
            {isCompare ? (
              <CiCircleMinus
                onClick={() => removeFromCompare(room)}
                title="Remove from compare"
                className="cursor-pointer"
                size={32}
              />
            ) : (
              <CiCirclePlus
                onClick={() => addToCompare(room)}
                title="Add to compare"
                className="cursor-pointer"
                size={32}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
