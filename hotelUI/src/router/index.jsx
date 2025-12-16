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
  MyBookings,
} from "@/pages";

import {
  // ADMIN
  AdBooking,
  AdHotel,
  AdRoom,
  AdUser,
  BoardAdmin,
  DashBoard,
  AdContact,
  AdNewsletter,

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

  if (!user) return <Navigate to="/login" replace />;

  const roles = Array.isArray(user.roles) ? user.roles : [];
  const hasRole = roles.some((r) => allowedRoles.includes(r));

  if (!hasRole) return <Navigate to="/" replace />;

  return children;
}

// ================================================
// 📌 ROUTER DEFINITIONS
// ================================================
export const router = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },

      { path: "profile", element: <Profile /> },
      { path: "hotel", element: <Hotel /> },
      { path: "hotel/:id", element: <HotelDetail /> },

      // ==========================
      // ✅ Booking cart + Checkout
      // ==========================
      // Cart page (nhiều room): /booking
      { path: "booking", element: <Booking /> },
      // (giữ lại route cũ nếu bạn vẫn còn navigate /booking/:id)
      { path: "booking/:id", element: <Booking /> },

      // ✅ NEW: Checkout độc lập (checkout theo selected rooms)
      { path: "checkout", element: <CheckOut /> },

      // (giữ lại route cũ để không phá flow cũ)
      { path: "booking/:id/checkout", element: <CheckOut /> },

      // My bookings
      { path: "my-bookings", element: <MyBookings /> },

      { path: "contact", element: <Contact /> },
      { path: "payment", element: <Payment /> },
      { path: "review", element: <Review /> },
      { path: "service", element: <Service /> },
      { path: "favorite", element: <Favorite /> },

      // Paypal success page
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

      { path: "contacts", element: <AdContact /> },
      { path: "newsletter", element: <AdNewsletter /> },
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
