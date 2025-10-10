import React from "react";
import { Image } from "antd";
import { useSelector } from "react-redux";
import { imgUserDefault } from "../../../assets";
import { FaUser, FaMapMarkerAlt, FaPhoneAlt } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";

export const PaypalInfoUser = () => {
  const { user } = useSelector((state) => state.auth);
  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

  const avatarSrc = user?.image
    ? `${IMAGE_URL}/users/${user.image}`
    : imgUserDefault;

  const avatarSize = "clamp(96px, 14vw, 140px)";
  const iconCls = "shrink-0 text-gray-500";
  const labelCls = "text-gray-500 text-sm font-medium";

  return (
    <div className="w-full h-full flex flex-col">
      {/* Avatar */}
      <div className="flex justify-center mb-5">
        <Image
          src={avatarSrc}
          preview={false}
          alt="avatar"
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: 9999,
            objectFit: "cover",
            boxShadow: "0 6px 18px rgba(0,0,0,.18)",
            border: "3px solid rgba(0,0,0,.06)",
          }}
        />
      </div>

      {/* Info rows */}
      <div className="divide-y flex-1">
        {/* Name */}
        <div className="py-2 grid grid-cols-[96px,1fr] items-start gap-x-3">
          <span className="flex items-center gap-2">
            <FaUser size={16} className={iconCls} />
            <span className={labelCls}>Name</span>
          </span>
          <span className="text-gray-900 text-sm font-semibold break-words">
            {user?.username || "—"}
          </span>
        </div>

        {/* Address */}
        <div className="py-2 grid grid-cols-[96px,1fr] items-start gap-x-3">
          <span className="flex items-center gap-2">
            <FaMapMarkerAlt size={16} className={iconCls} />
            <span className={labelCls}>Address</span>
          </span>
          <span className="text-gray-900 text-sm font-semibold break-words">
            {user?.address || "—"}
          </span>
        </div>

        {/* Phone */}
        <div className="py-2 grid grid-cols-[96px,1fr] items-start gap-x-3">
          <span className="flex items-center gap-2">
            <FaPhoneAlt size={16} className={iconCls} />
            <span className={labelCls}>Phone</span>
          </span>
          <span className="text-gray-900 text-sm font-semibold break-words">
            {user?.phone || "—"}
          </span>
        </div>

        {/* Email */}
        <div className="py-2 grid grid-cols-[96px,1fr] items-start gap-x-3">
          <span className="flex items-center gap-2">
            <IoMdMail size={16} className={iconCls} />
            <span className={labelCls}>Email</span>
          </span>
          <span className="text-gray-900 text-sm font-semibold break-all">
            {user?.email || "—"}
          </span>
        </div>
      </div>
    </div>
  );
};
