// src/router/index.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { MainLayout } from "@/components";

// Pages
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
  // ✅ ADD: FAQ (nhớ export trong "@/pages/index.js")
  FAQ,
} from "@/pages";

// UI / Other
import { HotelDetail } from "@/components/ui";
import { CheckOut } from "@/components/ui/booking/CheckOut";
import { PaymentSuccess } from "@/pages/PaymentSuccess";

// Admin layouts/pages
import {
  BoardAdmin,
  DashBoard,
  AdUser,
  AdRoom,
  AdHotel,
  AdBooking,
  AdContact,
  AdNewsletter,
  // Mod layouts/pages
  BoardMod,
  ModMyHotel,
  ModRooms,
  ModBookings,
} from "../components/layouts";

import { DashboardStats as ModDashboardStats } from "../components/layouts/mod/components/DashboardStats";

// ================================================
// 🔐 Protect route by role
// ================================================
function RequireRole({ allowedRoles = [], children }) {
  const { user } = useSelector((state) => state.auth || {});

  if (!user) return <Navigate to="/login" replace />;

  const roles = Array.isArray(user.roles) ? user.roles : [];
  const hasRole = roles.some((r) => allowedRoles.includes(r));

  if (!hasRole) return <Navigate to="/" replace />;

  return children;
}

// ================================================
// 📌 Router definitions
// ================================================
const mainRoutes = [
  { index: true, element: <Home /> },

  { path: "profile", element: <Profile /> },

  // Hotels
  { path: "hotel", element: <Hotel /> },
  { path: "hotel/:id", element: <HotelDetail /> },

  // Booking cart + checkout
  { path: "booking", element: <Booking /> },
  { path: "booking/:id", element: <Booking /> }, // giữ để không phá flow cũ
  { path: "checkout", element: <CheckOut /> },
  { path: "booking/:id/checkout", element: <CheckOut /> }, // giữ flow cũ

  // My bookings
  { path: "my-bookings", element: <MyBookings /> },

  // Static pages
  { path: "contact", element: <Contact /> },
  { path: "faq", element: <FAQ /> }, // ✅ NEW
  { path: "payment", element: <Payment /> },
  { path: "review", element: <Review /> },
  { path: "service", element: <Service /> },
  { path: "favorite", element: <Favorite /> },

  // Paypal success
  { path: "success", element: <PaymentSuccess /> },
];

const adminRoutes = [
  { index: true, element: <DashBoard /> },
  { path: "users", element: <AdUser /> },
  { path: "rooms", element: <AdRoom /> },
  { path: "hotels", element: <AdHotel /> },
  { path: "bookings", element: <AdBooking /> },
  { path: "contacts", element: <AdContact /> },
  { path: "newsletter", element: <AdNewsletter /> },
];

const moderatorRoutes = [
  { index: true, element: <ModDashboardStats /> },
  { path: "hotel", element: <ModMyHotel /> },
  { path: "rooms", element: <ModRooms /> },
  { path: "bookings", element: <ModBookings /> },
];

export const router = [
  // ===============================
  // 🌐 PUBLIC AREA
  // ===============================
  {
    path: "/",
    element: <MainLayout />,
    children: mainRoutes,
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
    children: adminRoutes,
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
    children: moderatorRoutes,
  },

  // ===============================
  // 🔓 AUTH ROUTES
  // ===============================
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
];
