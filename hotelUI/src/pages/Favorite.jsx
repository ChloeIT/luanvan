import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { RoomCard } from "../components/ui";

export const Favorite = () => {
  const { favorites, myFavorite } =
    useSelector((state) => state.favorite) || {};
  const currentUser = useSelector((state) => state.auth?.user) || null;

  const rooms = useMemo(() => {
    if (Array.isArray(myFavorite?.rooms)) return myFavorite.rooms;

    if (Array.isArray(favorites) && currentUser?.id) {
      const favOfUser = favorites.find(
        (f) => f?.user?.id === currentUser.id
      );
      if (Array.isArray(favOfUser?.rooms)) {
        return favOfUser.rooms;
      }
    }

    return [];
  }, [favorites, myFavorite, currentUser]);

  return (
    <div className="container-xxl py-4">
      <div className="container">

        {/* ===== Heading ===== */}
        <div className="text-center mb-5">
          <div className="sb-heading sb-heading--md mx-auto">
            {/* lines left */}
            <span className="sb-heading__lines sb-heading__lines--left">
              <span className="sb-heading__line sb-heading__line--long" />
              <span className="sb-heading__line sb-heading__line--short" />
            </span>

            {/* LABEL */}
            <h6
              className="sb-heading__label"
              style={{
                fontSize: "26px",      // 👈 to
                fontWeight: 900,       // 👈 đậm
                letterSpacing: "0.18em"
              }}
            >
              My Favorite
            </h6>

            {/* lines right */}
            <span className="sb-heading__lines sb-heading__lines--right">
              <span className="sb-heading__line sb-heading__line--long" />
              <span className="sb-heading__line sb-heading__line--short" />
            </span>
          </div>

          <h1 className="mb-0" style={{ fontSize: "28px" }}>
            {`Where your "favorites" come to life`}
          </h1>
        </div>

        {/* ===== LIST FAVORITE ===== */}
        <div className="row g-4 mt-1"> {/* 👈 thêm mt-1 cho nhẹ nhàng */}
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <div
                className="col-xl-3 col-lg-4 col-md-6 col-sm-12"
                key={room.id}
              >
                <RoomCard
                  room={room}
                  isFavorite={true}
                  hotelName={room.hotel?.name}
                  hotelId={room.hotel?.id}
                />
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-5">
              <h5 className="mb-2">No favorite rooms yet</h5>
              <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
                Tap the <b>heart icon</b> on any room to add it to your
                favorites and find it easily here later.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
