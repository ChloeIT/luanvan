import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { RoomCard } from "@/components/ui/Room/RoomCard";
import { CompareButton } from "@/components/ui/compare/CompareButton";
import { FaStar } from "react-icons/fa6";
import { IoLocation } from "react-icons/io5";
import { FaConciergeBell, FaHeadset, FaInfoCircle } from "react-icons/fa";

export function HotelDetail({
  rooms: roomsProp,
  hotel: hotelProp,
  showHeader = true,
}) {
  const { hotels } = useSelector((state) => state.hotel);
  const { myFavorite } = useSelector((state) => state.favorite);
  const { id: routeId } = useParams();
  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

  // === màu icon – chỉnh nhanh tại đây ===
  const iconColor = "#FFC30B"; // gợi ý: "#d4af37", "#ffcc00", ...

  // === chiều cao khối hero dùng chung cho 2 cột ===
  const HERO_H = 420; // có thể đổi 400–500 tuỳ ý

  // Xác định hotel
  const hotel = useMemo(() => {
    if (hotelProp) return hotelProp;
    if (routeId) return hotels.find((h) => String(h.id) === String(routeId));
    return undefined;
  }, [hotelProp, routeId, hotels]);

  // Danh sách phòng
  const rooms = useMemo(() => {
    if (hotel) return hotel.rooms ?? [];
    if (roomsProp) return roomsProp;
    return [];
  }, [hotel, roomsProp]);

  return (
    <>
      {hotel && showHeader && (
        <div className="container-xxl py-5">
          <div className="container">
            <div className="row g-5 align-items-stretch">
              {/* Ảnh khách sạn */}
              <div className="col-lg-6 d-flex" style={{ minHeight: HERO_H }}>
                <div className="position-relative h-100 w-100">
                  <img
                    src={`${IMAGE_URL}/hotels/${hotel.image}`}
                    alt={hotel.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 12,
                    }}
                  />
                </div>
              </div>

              {/* Nội dung */}
              <div className="col-lg-6 d-flex" style={{ minHeight: HERO_H }}>
                <div className="h-100 w-100 d-flex flex-column justify-content-center">
                  {/* Welcome to + 2 gạch xanh bên phải */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 8,
                    }}
                  >
                    <h1 className="m-0" style={{ lineHeight: 1.3, fontWeight: 900 }}>
                      Welcome to
                    </h1>

                    {/* 2 gạch xanh */}
                    <span
                      style={{
                        display: "grid",
                        justifyItems: "start",
                        gap: 6,
                        marginLeft: 2,
                      }}
                    >
                      <span className="divider" style={{ "--w": "150px" }} />
                      <span className="divider" style={{ "--w": "100px", "--alpha": 0.6 }} />
                    </span>
                  </div>

                  {/* Tên khách sạn – in đậm */}
                  <h1
                    className="text-primary mb-4"
                    style={{ lineHeight: 1.3, fontWeight: 900 }}
                  >
                    {hotel.name}
                  </h1>

                  {/* Rating + Địa chỉ + Tiện nghi + 2 bullet */}
                  <div className="gy-4 gx-4 mb-2">
                    {/* Rating */}
                    <div className="d-flex mt-2">
                      <p
                        className="mb-2 d-flex align-items-center"
                        style={{ gap: 8, fontSize: "1.05rem", fontWeight: 600 }}
                      >
                        <FaStar style={{ color: iconColor }} />
                        {hotel.rating}
                      </p>
                    </div>

                    {/* Địa chỉ */}
                    <div className="d-flex mt-2">
                      <p
                        className="mb-2 d-flex align-items-center"
                        style={{ gap: 8, fontSize: "1.05rem", fontWeight: 600 }}
                      >
                        <IoLocation style={{ color: iconColor }} />
                        {hotel.address}
                      </p>
                    </div>

                    {/* Tiện nghi */}
                    {hotel.amenities && (
                      <div className="d-flex mt-2">
                        <p
                          className="mb-2 d-flex align-items-center"
                          style={{ gap: 8, fontSize: "1.05rem", fontWeight: 600 }}
                        >
                          <FaConciergeBell style={{ color: iconColor }} />
                          {hotel.amenities}
                        </p>
                      </div>
                    )}

                    {/* 24/7 Service */}
                    <div className="col-sm-6 mt-2">
                      <p
                        className="mb-3 d-flex align-items-center"
                        style={{ gap: 8, fontSize: "1.05rem", fontWeight: 600 }}
                      >
                        <FaHeadset style={{ color: iconColor }} />
                        24/7 Service
                      </p>
                    </div>

                    {/* Provide info */}
                    <div className="col-sm-6">
                      <p
                        className="mb-0 d-flex align-items-center"
                        style={{ gap: 8, fontSize: "1.05rem", fontWeight: 600 }}
                      >
                        <FaInfoCircle style={{ color: iconColor }} />
                        Provide enough information
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* end .col-lg-6 */}
            </div>
          </div>
        </div>
      )}

      {/* ===== GRID PHÒNG ===== */}
      <div className="container-xxl py-5">
        <div className="container">
          {!hotel && showHeader && (
            <div className="text-center">
              <h6 className="text-2xl text-center text-primary px-3">Room</h6>
              <h1 className="mb-5">Explore Our Room Collection</h1>
            </div>
          )}

          <div className="rooms-grid">
            {rooms.map((room, idx) => {
              const isFavorite =
                myFavorite?.rooms?.some((fav) => fav.id === room.id) || false;

              return (
                <div
                  className="room-cell wow fadeInUp"
                  data-wow-delay={`${0.1 + idx * 0.05}s`}
                  key={room.id}
                >
                  <div className="inner">
                    <RoomCard
                      room={room}
                      isFavorite={isFavorite}
                      hotelName={hotel?.name}
                      hotelId={hotel?.id}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Nút Compare nổi */}
      <CompareButton />
    </>
  );
}
