// src/components/ui/Room/RoomCard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Button, Image } from "antd";
import { BsCurrencyDollar } from "react-icons/bs";
import { FaUserLarge, FaHeart, FaRegHeart } from "react-icons/fa6";
import { IoMdPricetags } from "react-icons/io";
import { CiCirclePlus, CiCircleMinus } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { favoriteServices } from "@/services/favorite";
import { favoriteAction } from "@/store";
import { bookingAction } from "@/store/booking"; // ✅ thêm

/* ================= helpers ================= */
const readCompare = () => {
  try {
    return JSON.parse(localStorage.getItem("compareRooms") || "[]");
  } catch {
    return [];
  }
};

const writeCompare = (list) => {
  localStorage.setItem("compareRooms", JSON.stringify(list));
  window.dispatchEvent(new Event("compare:changed"));
};

const toNum = (v) =>
  v === 0 || v === "0" ? 0 : v != null && v !== "" ? Number(v) : NaN;

const getHotelIdFromRoom = (room) =>
  toNum(room?.hotel_id ?? room?.hotelId ?? room?.hotel?.id);

const resolveHotelName = (room, hotels, hotelNameProp) => {
  if (hotelNameProp) return hotelNameProp;
  if (room?.hotel?.name) return room.hotel.name;
  if (room?.hotelName) return room.hotelName;
  if (room?.hotel_name) return room.hotel_name;

  const hid = getHotelIdFromRoom(room);
  if (!Number.isNaN(hid) && Array.isArray(hotels) && hotels.length) {
    const match = hotels.find((h) => toNum(h.id) === hid);
    if (match?.name) return match.name;
  }
  return "";
};

/* ================= Component ================= */
export const RoomCard = ({
  room,
  hotelName: hotelNameProp,
  hotelId: hotelIdProp,
  isFavorite,
  variant = "default",
  inCompare,
  isAvailableToday = true,
  linkToHotel = false,
}) => {
  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;
  const { myFavorite } = useSelector((s) => s.favorite);
  const hotels = useSelector((s) => s.hotel?.hotels || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cardVariant = inCompare ? "compact" : variant;
  const isCompact = cardVariant === "compact";
  const ACTION_ICON = isCompact ? 24 : 28;
  const HEART_FS = isCompact ? "1.25rem" : "1.45rem";
  const BTN_SIZE = isCompact ? "small" : "middle";

  const resolvedHotelId = useMemo(
    () => hotelIdProp ?? getHotelIdFromRoom(room),
    [hotelIdProp, room]
  );

  const hotelName = useMemo(
    () => resolveHotelName(room, hotels, hotelNameProp) || room?.name || "",
    [room, hotels, hotelNameProp]
  );

  const rawDiscount =
    room?.discountPercent ?? room?.discount_percent ?? room?.discount ?? 0;
  const discountPercent = Number(rawDiscount) || 0;
  const showDiscount = discountPercent > 0;

  const [isInCompare, setIsInCompare] = useState(() =>
    readCompare().some((r) => r.id === room.id)
  );

  useEffect(() => {
    const sync = () =>
      setIsInCompare(readCompare().some((r) => r.id === room.id));

    const onStorage = (e) => {
      if (e.key === "compareRooms") sync();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("compare:changed", sync);
    sync();

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("compare:changed", sync);
    };
  }, [room.id]);

  const addToCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const cur = readCompare();
    if (cur.some((r) => r.id === room.id)) return;

    const payload = {
      ...room,
      hotel_id:
        resolvedHotelId ??
        room?.hotel_id ??
        room?.hotelId ??
        room?.hotel?.id ??
        null,
      hotelName,
    };

    writeCompare([...cur, payload]);
    setIsInCompare(true);
  };

  const removeFromCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    writeCompare(readCompare().filter((r) => r.id !== room.id));
    setIsInCompare(false);
  };

  const onToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (!myFavorite?.id) return;
      const res = isFavorite
        ? await favoriteServices.removeRoom(room.id, myFavorite.id)
        : await favoriteServices.addRoom(room.id, myFavorite.id);
      dispatch(favoriteAction.setMyFavorite(res.data));
    } catch (err) {
      console.error("Favorite toggle error:", err);
    }
  };

  // ✅ ADD TO CART (thay vì navigate /booking/:id)
  const onAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!room?.availability || !isAvailableToday) return;

    dispatch(
      bookingAction.addToCart({
        room,
        hotelName, // cho BookingItem hiển thị nhanh
        // hotelAddress: ... (nếu bạn có field address ở đây thì truyền thêm)
      })
    );

    // ✅ đi tới cart page (BookingItem)
    navigate("/booking");
  };

  const canAdd = !!room.availability && !!isAvailableToday;

  return (
    <div className={`room-card ${isCompact ? "room-card--compact" : ""}`}>
      <div className="image-box" style={{ position: "relative" }}>
        {showDiscount && (
          <div className="room-discount-badge">-{discountPercent}%</div>
        )}

        <Image
          preview={false}
          className="room-image"
          style={{ width: "100%", height: "100%" }}
          src={`${IMAGE_URL}/rooms/${room.image}`}
          alt={room.name}
        />
      </div>

      {hotelName && (
        linkToHotel && resolvedHotelId ? (
          <Link
            to={`/hotel/${resolvedHotelId}`}
            className="room-pill pill-top room-pill--link"
            style={{ textDecoration: "none", color: "inherit" }}
            onClick={(e) => e.stopPropagation()}
          >
            {hotelName}
          </Link>
        ) : (
          <div className="room-pill pill-top">{hotelName}</div>
        )
      )}

      <div className="room-pill pill-middle">{room.type}</div>

      <div className="room-card-body">
        <div className="text-center" style={{ padding: "8px 12px 4px" }}>
          <h5 className="primarycolor mb-1 room-title">
            {room.name || "\u00A0"}
          </h5>
        </div>

        <div className="room-info d-flex flex-column align-items-center">
          <div className="d-flex justify-content-center">
            <p className="mb-1 d-flex align-items-center room-info-line">
              <IoMdPricetags className="me-2" />
              {room.price} <BsCurrencyDollar />
            </p>
          </div>
          <div className="d-flex justify-content-center">
            <p className="mb-0 d-flex align-items-center room-info-line">
              <FaUserLarge className="me-2" />
              {room.capacity}
            </p>
          </div>
        </div>

        <div className="room-actions d-flex justify-content-center align-items-center text-primary">
          <span
            role="button"
            title={isFavorite ? "Remove room from favorites" : "Add room to favorites"}
            className="me-2"
            style={{ fontSize: HEART_FS, lineHeight: 1, cursor: "pointer" }}
            onClick={onToggleFavorite}
            aria-pressed={!!isFavorite}
          >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
          </span>

          <Button
            className="mx-1"
            size={BTN_SIZE}
            onClick={onAddToCart}
            disabled={!canAdd}
          >
            {canAdd ? "Add to cart" : "Booked"}
          </Button>

          {isInCompare ? (
            <CiCircleMinus
              onClick={removeFromCompare}
              title="Remove from compare"
              className="cursor-pointer"
              size={ACTION_ICON}
            />
          ) : (
            <CiCirclePlus
              onClick={addToCompare}
              title="Add to compare"
              className="cursor-pointer"
              size={ACTION_ICON}
            />
          )}
        </div>
      </div>
    </div>
  );
};
