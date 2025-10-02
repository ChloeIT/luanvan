// src/components/ui/Room/RoomCard.jsx
import React, { useEffect, useState } from "react";
import { Button, Image } from "antd";
import { BsCurrencyDollar } from "react-icons/bs";
import { FaUserLarge } from "react-icons/fa6";
import { IoMdPricetags } from "react-icons/io";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { CiCirclePlus, CiCircleMinus } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { favoriteServices } from "../../../services/favorite";
import { favoriteAction } from "../../../store";

// ---- compare storage helpers
const readCompare = () => {
  try { return JSON.parse(localStorage.getItem("compareRooms") || "[]"); }
  catch { return []; }
};
const writeCompare = (list) => {
  localStorage.setItem("compareRooms", JSON.stringify(list));
  window.dispatchEvent(new Event("compare:changed"));
};

export const RoomCard = ({
  room,
  isFavorite,
  inCompare = false,
  variant, // "default" | "compact"
}) => {
  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;
  const { myFavorite } = useSelector((s) => s.favorite);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Biến thể: mặc định compact khi ở compare
  const cardVariant = variant ?? (inCompare ? "compact" : "default");
  const isCompact = cardVariant === "compact";
  const ACTION_ICON = isCompact ? 26 : 32;
  const HEART_FS = isCompact ? "1.35rem" : "1.5rem";
  const BTN_SIZE = isCompact ? "small" : "middle";

  const [isCompare, setIsCompare] = useState(
    () => readCompare().some((r) => r.id === room.id)
  );

  // đồng bộ compare
  useEffect(() => {
    const sync = () => setIsCompare(readCompare().some((r) => r.id === room.id));
    const onStorage = (e) => { if (e.key === "compareRooms") sync(); };
    window.addEventListener("storage", onStorage);
    window.addEventListener("compare:changed", sync);
    sync();
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("compare:changed", sync);
    };
  }, [room.id]);

  // handlers
  const addToCompare = (e) => {
    e?.preventDefault?.(); e?.stopPropagation?.();
    const cur = readCompare();
    if (!cur.some((r) => r.id === room.id)) {
      writeCompare([...cur, room]);
      setIsCompare(true);
    }
  };
  const removeFromCompare = (e) => {
    e?.preventDefault?.(); e?.stopPropagation?.();
    writeCompare(readCompare().filter((r) => r.id !== room.id));
    setIsCompare(false);
  };
  const onToggleFavorite = async (e) => {
    e.preventDefault(); e.stopPropagation();
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
  const onBook = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (room.availability) navigate(`/booking/${room.id}`);
  };

  return (
    <div className={`room-card ${isCompact ? "room-card--compact" : ""}`}>
      {/* Pills */}
      <div className="room-pill pill-top">{room.type}</div>
      <div className="room-pill pill-middle">{room.name}</div>

      {/* Ảnh */}
      <div className="image-box">
        <Image
          preview={false}
          style={{ width: "100%", height: "100%" }}
          imgStyle={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            borderRadius: "12px 12px 0 0",
          }}
          src={`${IMAGE_URL}/rooms/${room.image}`}
          alt={room.name}
        />
      </div>

      {/* Body */}
      <div className="room-card-body">
        <div className="text-center" style={{ padding: "8px 12px 4px" }}>
          <h5 className="primarycolor mb-1 room-title">{room.name}</h5>
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
            onClick={onBook}
            disabled={!room.availability}
          >
            {room.availability ? "Book now" : "Booked"}
          </Button>

          {isCompare ? (
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
