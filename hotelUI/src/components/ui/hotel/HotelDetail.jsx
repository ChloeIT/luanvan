import React, { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa6";
import { IoIosArrowForward } from "react-icons/io";
import { IoLocation } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RoomCard } from "../Room";

export const HotelDetail = () => {
  const { id } = useParams();
  const { hotels } = useSelector((state) => state.hotel);
  const { myFavorite } = useSelector((state) => state.favorite);
  const [hotel, setHotel] = useState();

  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

  useEffect(() => {
    const data = hotels.find((ho) => String(ho.id) === String(id));
    setHotel(data);
  }, [id, hotels]);

  return (
    <>
      {hotel && (
        <div className="container-xxl py-5">
          <div className="container">
            <div className="row g-5">
              <div className="col-lg-6" style={{ minHeight: "400px" }}>
                <div className="position-relative h-100">
                  <img
                    src={`${IMAGE_URL}/hotels/${hotel.image}`}
                    alt={hotel.name}
                    width="500"
                    height="500"
                  />
                </div>
              </div>
              <div className="col-lg-6">
                <h6 className=" text-2xl text-start text-primary pe-3">Hotel</h6>
                <h1 className="mb-4">
                  Welcome to <span className="text-primary">{hotel.name}</span>
                </h1>

                <div className="d-flex mt-2">
                  <p className="mb-2 d-flex align-items-center">
                    <FaStar className="me-2" />
                    {hotel.rating}
                  </p>
                </div>
                <div className="d-flex mt-2">
                  <p className="mb-2 d-flex align-items-center">
                    <IoLocation className="me-2" />
                    {hotel.address}
                  </p>
                </div>
                <div className="d-flex mt-2 mb-2">
                  <p className="mb-2 d-flex align-items-center">
                    <IoLocation className="me-2" />
                    {hotel.amenities}
                  </p>
                </div>

                <div className="gy-4 gx-4 mb-4">
                  <div className="col-sm-6">
                    <p className="mb-3 d-flex align-items-center">
                      <IoIosArrowForward className="me-2" />
                      24/7 Service
                    </p>
                  </div>
                  <div className="col-sm-6">
                    <p className="mb-3 d-flex align-items-center">
                      <IoIosArrowForward className="me-2" />
                      Provide enough information
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Collection Section */}
      <div className="container-xxl py-5">
        <div className="container">
          <div className="text-center">
            <h6 className=" text-2xl text-center text-primary px-3">Room</h6>
            <h1 className="mb-5">Explore Our Room Collection</h1>
          </div>

          <div className="row g-5">
            {hotel &&
              hotel.rooms.map((room) => {
                const isFavorite =
                  myFavorite?.rooms?.some((fav) => fav.id === room.id) || false;

                return (
                  <RoomCard
                    key={room.id}
                    room={room}
                    isFavorite={isFavorite}
                    hotelName={hotel.name}
                    hotelId={hotel.id}
                  />
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
};
