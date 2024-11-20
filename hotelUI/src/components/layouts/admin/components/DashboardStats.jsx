import React from "react";
import { useSelector } from "react-redux";
import { LuUsers2 } from "react-icons/lu";
import { LuHotel } from "react-icons/lu";
import { MdOutlineBedroomParent } from "react-icons/md";
import { BsCartFill } from "react-icons/bs";

export const DashboardStats = () => {
  const { users } = useSelector((state) => state.user);
  const { hotels } = useSelector((state) => state.hotel);
  const { rooms } = useSelector((state) => state.room);
  const { bookings } = useSelector((state) => state.booking);
  return (
    <>
      <div className="stats shadow">
        <div className="stat">
          <div className={`stat-figure dark:text-slate-300`}>
            <LuUsers2 />
          </div>
          <div className="stat-title dark:text-slate-300">Users</div>
          <div className={`stat-value dark:text-slate-300`}>{users.length}</div>
        </div>
      </div>
      <div className="stats shadow">
        <div className="stat">
          <div className={`stat-figure dark:text-slate-300`}>
            <LuHotel />
          </div>
          <div className="stat-title dark:text-slate-300">Hotels</div>
          <div className={`stat-value dark:text-slate-300`}>{hotels.length}</div>
        </div>
      </div>
      <div className="stats shadow">
        <div className="stat">
          <div className={`stat-figure dark:text-slate-300`}>
            <MdOutlineBedroomParent />
          </div>
          <div className="stat-title dark:text-slate-300">Rooms</div>
          <div className={`stat-value dark:text-slate-300`}>{rooms.length}</div>
        </div>
      </div>
      <div className="stats shadow">
        <div className="stat">
          <div className={`stat-figure dark:text-slate-300`}>
            <BsCartFill />
          </div>
          <div className="stat-title dark:text-slate-300">Bookings</div>
          <div className={`stat-value dark:text-slate-300`}>{bookings.length}</div>
        </div>
      </div>
    </>
  );
};
