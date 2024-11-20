import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Footer, Header } from "../ui";
import { useDispatch, useSelector } from "react-redux";
import { authAction } from "../../store/auth/slice";
import {
  favoriteAction,
  fetchAllBooking,
  fetchAllFavorite,
  fetchAllHotel,
  fetchAllRoom,
} from "../../store";
import { fetchAllUser } from "../../store/user/thunk";
import { CompareButton } from "../ui/compare/CompareButton";

export const MainLayout = () => {
  const dispatch = useDispatch();
  const { favorites } = useSelector((state) => state.favorite);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (user) {
      dispatch(authAction.setUser(user));
    }
    dispatch(fetchAllHotel());
    dispatch(fetchAllUser());
    dispatch(fetchAllBooking());
    dispatch(fetchAllRoom());
    dispatch(fetchAllFavorite());
  }, [dispatch]);

  useEffect(() => {
    if (favorites) {
      const myFavorite = favorites.find(
        (favorite) => favorite.user.id == user?.id
      );
      dispatch(favoriteAction.setMyFavorite(myFavorite));
    }
  }, [favorites, dispatch]);

  return (
    <div className="">
      <Header className="relative z-50" />
      <div className="relative z-10">
        <Outlet />
      </div>
      <CompareButton />
      <Footer />
    </div>
  );
};
