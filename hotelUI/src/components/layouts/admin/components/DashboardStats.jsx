import React from "react";
import { useSelector } from "react-redux";
import { LuUsers2, LuHotel } from "react-icons/lu";
import { MdOutlineBedroomParent } from "react-icons/md";
import { BsCartFill } from "react-icons/bs";

const StatBox = ({ title, value, Icon }) => (
  <div className="stats shadow themed-card rounded-xl">
    <div className="stat p-4">
      <div className="stat-figure" style={{ color: "var(--primary)" }}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="stat-title" style={{ color: "var(--muted)" }}>
        {title}
      </div>
      <div className="stat-value" style={{ color: "var(--text)" }}>
        {value}
      </div>
    </div>
  </div>
);

export const DashboardStats = () => {
  const { users } = useSelector((state) => state.user);
  const { hotels } = useSelector((state) => state.hotel);
  const { rooms } = useSelector((state) => state.room);
  const { bookings } = useSelector((state) => state.booking);

  const stats = [
    { title: "Users", value: users.length, Icon: LuUsers2 },
    { title: "Hotels", value: hotels.length, Icon: LuHotel },
    { title: "Rooms", value: rooms.length, Icon: MdOutlineBedroomParent },
    { title: "Bookings", value: bookings.length, Icon: BsCartFill },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <StatBox key={i} title={s.title} value={s.value} Icon={s.Icon} />
      ))}
    </div>
  );
};

export default DashboardStats;
