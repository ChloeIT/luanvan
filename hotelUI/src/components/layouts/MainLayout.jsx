import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "../ui";
import { useDispatch } from "react-redux";
import { authAction } from "../../store/auth/slice";

export const MainLayout = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      dispatch(authAction.setUser(user));
    }
  }, [dispatch]);
  return (
    <div className="">
      <Header />
      <div className="">
        <Outlet />
      </div>
    </div>
  );
};
