// src/contant/linkmod.js
import { VscLayoutMenubar } from "react-icons/vsc";
import { LuHotel } from "react-icons/lu";
import { MdOutlineBedroomParent } from "react-icons/md";
import { BsCartFill } from "react-icons/bs";

export const routeMod = [
  {
    path: "/moderator",
    icon: VscLayoutMenubar,
    name: "Dashboard",
  },
  {
    path: "/moderator/hotel",
    icon: LuHotel,
    name: "My Hotel",
  },
  {
    path: "/moderator/rooms",
    icon: MdOutlineBedroomParent,
    name: "Rooms",
  },
  {
    path: "/moderator/bookings",
    icon: BsCartFill,
    name: "Bookings",
  },
];
