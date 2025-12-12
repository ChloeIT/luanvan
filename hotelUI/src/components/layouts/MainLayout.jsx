import React, { useEffect, useMemo, useRef } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Footer, Header } from "../ui";
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
import { ChatbotWidget } from "../ui/chatbot/ChatbotWidget";

export const MainLayout = () => {
  const dispatch = useDispatch();

  const favorites = useSelector((state) => state.favorite?.favorites || []);
  const myFavoriteInStore = useSelector((state) => state.favorite?.myFavorite);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const userId = user?.id ?? null;

  useEffect(() => {
    if (user) dispatch(authAction.setUser(user));
    dispatch(fetchAllHotel());
    dispatch(fetchAllUser());
    dispatch(fetchAllBooking());
    dispatch(fetchAllRoom());
    dispatch(fetchAllFavorite());
  }, [dispatch, user]);

  const lastSetIdRef = useRef(null);

  useEffect(() => {
    if (!userId) {
      if (myFavoriteInStore != null) dispatch(favoriteAction.setMyFavorite(null));
      lastSetIdRef.current = null;
      return;
    }

    if (!Array.isArray(favorites) || favorites.length === 0) return;

    const found =
      favorites.find((f) => String(f?.user?.id) === String(userId)) || null;

    const nextId = found?.id ?? null;
    const currId = myFavoriteInStore?.id ?? null;

    if (currId === nextId) return;
    if (lastSetIdRef.current === nextId) return;

    lastSetIdRef.current = nextId;
    dispatch(favoriteAction.setMyFavorite(found));
  }, [favorites, userId, myFavoriteInStore, dispatch]);

  return (
    <div>
      <Header className="relative z-50" />
      <div className="relative z-10">
        <Outlet />
      </div>

      <ChatbotWidget right={45} bottom={90 + 56 + 12} size={56} />
      <CompareButton />


      <Footer />
    </div>
  );
};
