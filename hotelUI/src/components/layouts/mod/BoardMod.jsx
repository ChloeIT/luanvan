// src/components/layouts/mod/BoardMod.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  authAction,
  fetchAllBooking,
  fetchAllHotel,
  fetchAllRoom,
} from "../../../store";
import { fetchAllUser } from "../../../store/user/thunk";
import { SideBar } from "./components";
import { Outlet, useNavigate } from "react-router-dom";

export const BoardMod = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Lấy user từ localStorage
    const saved = localStorage.getItem("user");
    let parsed = null;

    if (saved) {
      try {
        parsed = JSON.parse(saved);
        dispatch(authAction.setUser(parsed));
      } catch (err) {
        console.error("Failed to parse user from localStorage:", err);
      }
    }

    // Nếu chưa login → đẩy về login
    if (!parsed) {
      navigate("/login");
      return;
    }

    // Kiểm tra quyền MOD
    if (!parsed.roles?.includes("ROLE_MODERATOR")) {
      navigate("/");
      return;
    }

    // Load data giống BoardAdmin (có thể filter lại ở FE hoặc viết API riêng sau)
    dispatch(fetchAllHotel());
    dispatch(fetchAllUser());
    dispatch(fetchAllBooking());
    dispatch(fetchAllRoom());
  }, [dispatch, navigate]);

  return (
    <div className="flex flex-1">
      {/* Sidebar MOD */}
      <SideBar />

      {/* Khu vực render nội dung */}
      <div className="flex-1 h-screen px-2 py-2 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};
