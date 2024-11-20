import { VscLayoutMenubar } from "react-icons/vsc";
import { LuUsers2 } from "react-icons/lu";
import { LuHotel } from "react-icons/lu";
import { MdOutlineBedroomParent } from "react-icons/md";
import { BsCartFill } from "react-icons/bs";

export const routeAdmin = [
  {
    path: "/admin",
    icon: VscLayoutMenubar,
    name: "Dashboard",
  },
  {
    path: "/admin/users",
    icon: LuUsers2,
    name: "Users",
  },
  {
    path: "/admin/hotels",
    icon: LuHotel,
    name: "Hotels",
  },
  {
    path: "/admin/bookings",
    icon: BsCartFill,
    name: "Bookings",
  },
  {
    path: "/admin/rooms",
    icon: MdOutlineBedroomParent,
    name: "Rooms",
  },
];
