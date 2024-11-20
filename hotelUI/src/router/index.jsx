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
  AdBooking,
  AdHotel,
  AdRoom,
  AdUser,
  BoardAdmin,
  DashBoard,
} from "../components/layouts";
import { BoardMod } from "../components/layouts/mod";
import { HotelDetail } from "../components/ui";
import { CheckOut } from "../components/ui/booking/CheckOut";
import { Favorite } from "../pages/Favorite";

export const router = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/hotel",
        element: <Hotel />,
      },
      {
        path: "/hotel/:id",
        element: <HotelDetail />,
      },
      {
        path: "/booking",
        element: <Booking />,
      },
      {
        path: "/booking/:id",
        element: <Booking />,
      },
      {
        path: "/booking/:id/checkout",
        element: <CheckOut />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },

      {
        path: "/payment",
        element: <Payment />,
      },
      {
        path: "review",
        element: <Review />,
      },
      {
        path: "service",
        element: <Service />,
      },
      {
        path: "favorite",
        element: <Favorite />,
      },
    ],
  },

  {
    path: "/admin",
    element: <BoardAdmin />,
    children: [
      {
        index: true,
        element: <DashBoard />,
      },
      {
        path: "users",
        element: <AdUser />,
      },
      {
        path: "rooms",
        element: <AdRoom />,
      },
      {
        path: "hotels",
        element: <AdHotel />,
      },
      {
        path: "bookings",
        element: <AdBooking />,
      },
    ],
  },
  {
    path: "/moderator",
    element: <BoardMod />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
];
