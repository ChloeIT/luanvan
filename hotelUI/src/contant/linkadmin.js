// src/contant/linkadmin.js
import { VscLayoutMenubar } from "react-icons/vsc";
import { LuUsers2 } from "react-icons/lu";
import { LuHotel } from "react-icons/lu";
import { MdOutlineBedroomParent } from "react-icons/md";
import { BsCartFill } from "react-icons/bs";
import { MdOutlineMail } from "react-icons/md";
import { HiOutlineNewspaper } from "react-icons/hi";

export const routeAdmin = [
  // DASHBOARD
  {
    path: "/admin",
    icon: VscLayoutMenubar,
    name: "Dashboard",
  },

  // USERS
  {
    path: "/admin/users",
    icon: LuUsers2,
    name: "Users",
  },

  // HOTELS
  {
    path: "/admin/hotels",
    icon: LuHotel,
    name: "Hotels",
  },

  // BOOKINGS
  {
    path: "/admin/bookings",
    icon: BsCartFill,
    name: "Bookings",
  },

  // ROOMS
  {
    path: "/admin/rooms",
    icon: MdOutlineBedroomParent,
    name: "Rooms",
  },

  // CONTACTS
  {
    path: "/admin/contacts",
    icon: MdOutlineMail,
    name: "Contacts",
  },

  // NEWSLETTER
  {
    path: "/admin/newsletter",
    icon: HiOutlineNewspaper,
    name: "Newsletter",
  },
];
