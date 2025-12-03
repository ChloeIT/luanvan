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
  Favorite,
  MyBookings,          // 👈 nhớ export MyBookings trong "@/pages"
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

import { DashboardStats as ModDashboardStats } from "../components/layouts/mod/components/DashboardStats";

import { HotelDetail } from "@/components/ui";
import { CheckOut } from "@/components/ui/booking/CheckOut";
import { PaymentSuccess } from "@/pages/PaymentSuccess";

// ================================================
// 🔐 BẢO VỆ ROUTE THEO ROLE
// ================================================
function RequireRole({ allowedRoles, children }) {
  const { user } = useSelector((state) => state.auth);

  // chưa đăng nhập -> về login
  if (!user) return <Navigate to="/login" replace />;

  const roles = Array.isArray(user.roles) ? user.roles : [];
  const hasRole = roles.some((r) => allowedRoles.includes(r));

  // không đủ quyền -> đá về home
  if (!hasRole) return <Navigate to="/" replace />;

  return children;
}

// ================================================
// 📌 ROUTER DEFINITIONS
// ================================================
export const router = [
  // ===============================
  // 🌐 PUBLIC PAGES (MainLayout)
  // ===============================
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },

      { path: "profile", element: <Profile /> },
      { path: "hotel", element: <Hotel /> },
      { path: "hotel/:id", element: <HotelDetail /> },

      // Trang flow booking / checkout
      { path: "booking", element: <Booking /> },
      { path: "booking/:id", element: <Booking /> },
      { path: "booking/:id/checkout", element: <CheckOut /> },

      // Trang xem lại tất cả booking của user hiện tại
      { path: "my-bookings", element: <MyBookings /> },

      { path: "contact", element: <Contact /> },
      { path: "payment", element: <Payment /> },
      { path: "review", element: <Review /> },
      { path: "service", element: <Service /> },
      { path: "favorite", element: <Favorite /> },

      // 🎉 Trang báo thành công Paypal
      { path: "success", element: <PaymentSuccess /> },
    ],
  },

  // ===============================
  // 🔐 ADMIN AREA
  // ===============================
  {
    path: "/admin",
    element: (
      <RequireRole allowedRoles={["ROLE_ADMIN"]}>
        <BoardAdmin />
      </RequireRole>
    ),
    children: [
      { index: true, element: <DashBoard /> },
      { path: "users", element: <AdUser /> },
      { path: "rooms", element: <AdRoom /> },
      { path: "hotels", element: <AdHotel /> },
      { path: "bookings", element: <AdBooking /> },
    ],
  },

  // ===============================
  // 🔐 MODERATOR AREA
  // ===============================
  {
    path: "/moderator",
    element: (
      <RequireRole allowedRoles={["ROLE_MODERATOR"]}>
        <BoardMod />
      </RequireRole>
    ),
    children: [
      { index: true, element: <ModDashboardStats /> },
      { path: "hotel", element: <ModMyHotel /> },
      { path: "rooms", element: <ModRooms /> },
      { path: "bookings", element: <ModBookings /> },
    ],
  },

  // ===============================
  // 🔓 AUTH ROUTES
  // ===============================
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
];
