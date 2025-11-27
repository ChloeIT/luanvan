// src/router/index.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { MainLayout } from "@/components";
import {
  Home,
  Hotel,
  Booking,
  Contact,
  Login,
  Payment,
  Profile,
  Register,
  Review,
  Service,
} from "@/pages";

import {
  // ADMIN
  AdBooking,
  AdHotel,
  AdRoom,
  AdUser,
  BoardAdmin,
  DashBoard,

  // MOD
  BoardMod,
  ModMyHotel,
  ModRooms,
  ModBookings,
} from "../components/layouts";

// 👇 THÊM: import dashboard của MOD, alias tên lại cho dễ phân biệt
import { DashboardStats as ModDashboardStats } from "../components/layouts/mod/components/DashboardStats";

import { HotelDetail } from "../components/ui";
import { CheckOut } from "../components/ui/booking/CheckOut";
import { Favorite } from "../pages/Favorite";

// ✅ Component dùng để check role
function RequireRole({ allowedRoles, children }) {
  const { user } = useSelector((state) => state.auth);

  if (!user) return <Navigate to="/login" replace />;

  const roles = Array.isArray(user.roles) ? user.roles : [];
  const hasRole = roles.some((r) => allowedRoles.includes(r));

  if (!hasRole) return <Navigate to="/" replace />;

  return children;
}

export const router = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "/profile", element: <Profile /> },
      { path: "/hotel", element: <Hotel /> },
      { path: "/hotel/:id", element: <HotelDetail /> },
      { path: "/booking", element: <Booking /> },
      { path: "/booking/:id", element: <Booking /> },
      { path: "/booking/:id/checkout", element: <CheckOut /> },
      { path: "/contact", element: <Contact /> },
      { path: "/payment", element: <Payment /> },
      { path: "review", element: <Review /> },
      { path: "service", element: <Service /> },
      { path: "favorite", element: <Favorite /> },
    ],
  },

  // 🔐 ADMIN
  {
    path: "/admin",
    element: (
      <RequireRole allowedRoles={["ROLE_ADMIN"]}>
        <BoardAdmin />
      </RequireRole>
    ),
    children: [
      { index: true, element: <DashBoard /> }, // dashboard tổng cho admin
      { path: "users", element: <AdUser /> },
      { path: "rooms", element: <AdRoom /> },
      { path: "hotels", element: <AdHotel /> },
      { path: "bookings", element: <AdBooking /> },
    ],
  },

  // 🔐 MODERATOR
  {
    path: "/moderator",
    element: (
      <RequireRole allowedRoles={["ROLE_MODERATOR"]}>
        <BoardMod />
      </RequireRole>
    ),
    children: [
      // 👇 DÙNG DashboardStats riêng của MOD
      { index: true, element: <ModDashboardStats /> },
      { path: "hotel", element: <ModMyHotel /> },
      { path: "rooms", element: <ModRooms /> },
      { path: "bookings", element: <ModBookings /> },
    ],
  },

  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
];
