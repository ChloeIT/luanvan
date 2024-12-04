import React from "react";
import { useSelector } from "react-redux";
import { RoomCard } from "../components/ui";

export const Favorite = () => {
  const { myFavorite } = useSelector((state) => state.favorite);

  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

  return (
    <div className="container-xxl py-5">
      <div className="container">
        <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
          <h6 className=" text-2xl text-center text-primary px-3">
            My Favorite
          </h6>
          <h1 className="mb-5">{`Where your "favorites" come to life`}</h1>
        </div>
        <div className="row g-5">
          {myFavorite && myFavorite.rooms.length > 0 ? (
            myFavorite.rooms.map((room) => {
              const isFavorite = true;
              return <RoomCard key={room.id} room={room} isFavorite={isFavorite} />;
            })
          ) : (
            <div>No room favorite !</div>
          )}
        </div>
      </div>
    </div>
  );
};
