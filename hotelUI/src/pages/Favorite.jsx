import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { RoomCard } from "../components/ui";

export const Favorite = () => {
  // === Lấy state từ Redux ===
  const { favorites, myFavorite, loading, error } =
    useSelector((state) => state.favorite) || {};
  const currentUser = useSelector((state) => state.auth?.user) || null;

  // === LOG ĐỂ DEBUG ===
  console.log("[Favorite] currentUser:", currentUser);
  console.log("[Favorite] favorites raw:", favorites);
  console.log("[Favorite] myFavorite raw:", myFavorite);

  // === Tính toán rooms được yêu thích của user hiện tại ===
  const rooms = useMemo(() => {
    // Nếu đã có myFavorite.rooms thì ưu tiên (trường hợp sau này bạn set lại)
    if (Array.isArray(myFavorite?.rooms)) {
      console.log(
        "[Favorite] Using myFavorite.rooms, length =",
        myFavorite.rooms.length
      );
      return myFavorite.rooms;
    }

    // Ngược lại: lấy từ favorites theo user
    if (Array.isArray(favorites) && currentUser?.id) {
      const favOfUser = favorites.find(
        (f) => f?.user?.id === currentUser.id
      );
      console.log("[Favorite] favOfUser:", favOfUser);

      if (Array.isArray(favOfUser?.rooms)) {
        console.log(
          "[Favorite] Using favOfUser.rooms, length =",
          favOfUser.rooms.length
        );
        return favOfUser.rooms;
      }
    }

    console.log("[Favorite] No favorite rooms found, return []");
    return [];
  }, [favorites, myFavorite, currentUser]);

  console.log("[Favorite] Final rooms array:", rooms);

  return (
    <div className="container-xxl py-5">
      <div className="container">
        <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
          <div
            className="heading-line mx-auto"
            style={{ "--heading-gap": "14px" }}
          >
            {/* 2 gạch bên trái */}
            <span
              style={{
                display: "grid",
                justifyItems: "end",
                gap: "6px",
                marginRight: "2px",
              }}
            >
              <span className="divider" style={{ "--w": "120px" }} />
              <span
                className="divider"
                style={{ "--w": "60px", "--alpha": 0.45 }}
              />
            </span>

            <h6 className="heading-text text-3xl text-primary text-uppercase">
              MY FAVORITE
            </h6>

            {/* 2 gạch bên phải */}
            <span
              style={{
                display: "grid",
                justifyItems: "start",
                gap: "6px",
                marginLeft: "2px",
              }}
            >
              <span className="divider" style={{ "--w": "120px" }} />
              <span
                className="divider"
                style={{ "--w": "60px", "--alpha": 0.45 }}
              />
            </span>
          </div>

          <h1 className="mb-5">{`Where your "favorites" come to life`}</h1>
        </div>

        <div className="row g-5">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <div
                className="col-lg-4 col-md-6 col-sm-12"
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
              <h5 className="mb-3">No room favorite!</h5>
              <p className="text-muted">
                You haven&apos;t added any rooms to your favorites yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
