import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  authAction,
  fetchAllBooking,
  fetchAllHotel,
  fetchAllRoom,
} from "../../../store";
import { fetchAllUser } from "../../../store/user/thunk";
import { Sidebar } from "./components";
import { Outlet, useNavigate } from "react-router-dom";

export const BoardAdmin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      dispatch(authAction.setUser(user));
    }
    dispatch(fetchAllHotel());
    dispatch(fetchAllUser());
    dispatch(fetchAllBooking());
    dispatch(fetchAllRoom());
    if (!user?.roles.includes("ROLE_ADMIN")) {
      navigate("/");
    }
  }, []);

  return (
    <>
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 h-screen  px-2 py-2 overflow-auto">
          <Outlet />
        </div>
      </div>
    </>
  );
};
