// src/components/layouts/admin/AdRoom.jsx
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Avatar, Button, Table } from "antd";
import Column from "antd/es/table/Column";
import { useLocation, useNavigate } from "react-router-dom";
import { IoLocationOutline } from "react-icons/io5";
import { HomeOutlined } from "@ant-design/icons";

import { AdEditRoom } from "./room/AdEditRoom";
import { AdDeleteRoom } from "./room/AdDeleteRoom";
import { AdAddRoom } from "./room/AdAddRoom";

/* ========= Helper: Discount info ========= */
const getDiscountInfo = (room) => {
  const raw =
    room?.discountPercent ?? room?.discount_percent ?? room?.discount ?? 0;

  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return { value: 0, isActive: false };

  const start = room.discountStart ?? room.discount_start ?? null;
  const end = room.discountEnd ?? room.discount_end ?? null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const toDate = (d) => {
    if (!d) return null;
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return null;
    dt.setHours(0, 0, 0, 0);
    return dt;
  };

  const startDate = toDate(start);
  const endDate = toDate(end);

  let isActive = true;
  if (startDate && today < startDate) isActive = false;
  if (endDate && today > endDate) isActive = false;

  return { value, isActive };
};

export const AdRoom = () => {
  const { rooms } = useSelector((state) => state.room);
  const { hotels } = useSelector((state) => state.hotel);

  const [isModalEditVisible, setIsModalEditVisible] = useState(false);
  const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false);
  const [isModalAddVisible, setIsModalAddVisible] = useState(false);
  const [itemACtion, setItemACtion] = useState(null);

  const { search } = useLocation();
  const navigate = useNavigate();
  const hotelId = new URLSearchParams(search).get("hotelId");

  // Lọc rooms theo hotelId (rooms có field hotel.id)
  const { dataSource, hotelName, hotelAddress } = useMemo(() => {
    const allRooms = rooms || [];

    if (!hotelId) {
      return { dataSource: allRooms, hotelName: null, hotelAddress: "" };
    }

    const hotel = (hotels || []).find((h) => String(h.id) === String(hotelId));

    const filteredRooms = allRooms.filter((r) => {
      const roomHotelId = r.hotel?.id ?? r.hotelId ?? r.hotel_id;
      return String(roomHotelId) === String(hotelId);
    });

    return {
      dataSource: filteredRooms,
      hotelName: hotel?.name || `Hotel #${hotelId}`,
      hotelAddress: hotel?.address || "",
    };
  }, [rooms, hotels, hotelId]);

  /* ================= Pagination UI (FIX warning border/borderColor) ================= */
  const [page, setPage] = useState(1);

  // ✅ Không dùng `border` shorthand nữa -> tránh warning
  const pagerBase = {
    backgroundColor: "#1677ff",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#1677ff",
    color: "#fff",
    height: 28,
    minWidth: 28,
    padding: "0 10px",
    lineHeight: "26px",
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 1px 0 rgba(0,0,0,.06)",
  };

  const pagerActive = {
    backgroundColor: "#155bd6",
    borderColor: "#155bd6",
    color: "#fff",
  };

  const itemRender = (pageNum, type, original) => {
    if (type === "page") {
      const isActive = pageNum === page;
      return React.cloneElement(original, {
        style: { ...pagerBase, ...(isActive ? pagerActive : {}) },
        children: pageNum,
      });
    }
    if (type === "prev" || type === "next") {
      return React.cloneElement(original, { style: pagerBase });
    }
    return original;
  };

  /* ================= Pills ================= */
  const basePill = {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: 9999,
    fontWeight: 700,
    fontSize: 12,
    lineHeight: "20px",
    boxShadow: "0 1px 0 rgba(0,0,0,.06)",
    whiteSpace: "nowrap",
  };

  const availabilityGreen = {
    backgroundColor: "#D9F7BE",
    color: "#237804",
    border: "1px solid #95DE64",
  };
  const availabilityRed = {
    backgroundColor: "#FFCCC7",
    color: "#A8071A",
    border: "1px solid #FF7875",
  };
  const availabilityPill = (av) =>
    av ? { ...basePill, ...availabilityGreen } : { ...basePill, ...availabilityRed };

  const pillBlue = { backgroundColor: "#BAE0FF", color: "#0958D9", border: "1px solid #69B1FF" };
  const pillOrange = { backgroundColor: "#FFE7BA", color: "#AD4E00", border: "1px solid #FFC069" };
  const pillIndigo = { backgroundColor: "#D6E4FF", color: "#1D39C4", border: "1px solid #ADC6FF" };
  const pillPurple = { backgroundColor: "#EFDBFF", color: "#722ED1", border: "1px solid #D3ADF7" };
  const pillDeepPurple = { backgroundColor: "#F9F0FF", color: "#531DAB", border: "1px solid #D3ADF7" };
  const pillBrown = { backgroundColor: "#FFF2CC", color: "#AD6800", border: "1px solid #FFD666" };
  const pillGray = { backgroundColor: "#F5F5F5", color: "#595959", border: "1px solid #D9D9D9" };

  const discountActivePill = {
    ...basePill,
    backgroundColor: "#FFF1B8",
    color: "#AD6800",
    border: "1px solid #FFD666",
    fontSize: 11,
  };
  const discountScheduledPill = {
    ...basePill,
    backgroundColor: "#E6F4FF",
    color: "#0958D9",
    border: "1px solid #91CAFF",
    fontSize: 11,
  };
  const discountNonePill = {
    ...basePill,
    backgroundColor: "#F5F5F5",
    color: "#8C8C8C",
    border: "1px solid #D9D9D9",
    fontSize: 11,
  };

  const typePillStyle = (raw) => {
    const key = String(raw || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

    if (/(vip|luxury)/.test(key)) return pillDeepPurple;
    if (/(suite|executive\s*suite|business\s*suite)/.test(key)) return pillPurple;
    if (/(deluxe|family\s*deluxe)/.test(key)) return pillOrange;
    if (/(superior|premium|executive)/.test(key)) return pillIndigo;
    if (/(standard|basic|single|twin|double)/.test(key)) return pillBlue;
    if (/(budget|economy|compact)/.test(key)) return pillGray;
    if (/(duplex|apartment|villa)/.test(key)) return pillBrown;

    return pillGray;
  };

  const fmtPrice = (v) => v; // bạn có thể format VND

  const handleEditRoom = (room) => {
    setItemACtion(room);
    setIsModalEditVisible(true);
  };
  const handleDeleteRoom = (room) => {
    setItemACtion(room);
    setIsModalDeleteVisible(true);
  };
  const handleAddRoom = () => {
    setItemACtion(null);
    setIsModalAddVisible(true);
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#2a2a2a] flex items-center gap-2">
            Rooms of{" "}
            <span
              style={{
                color: "var(--primary)",
                fontSize: 26,
                fontWeight: 900,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 600,
              }}
              title={hotelName || undefined}
            >
              {hotelName || "All Hotels"}
            </span>
          </h2>

          {hotelId && hotelAddress && (
            <p className="mt-1 text-sm text-gray-700 flex items-center gap-2">
              <IoLocationOutline />
              <span className="block max-w-[520px] whitespace-nowrap overflow-hidden text-ellipsis">
                {hotelAddress}
              </span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hotelId && (
            <>
              <Button onClick={() => navigate("/admin/hotels")} icon={<HomeOutlined />}>
                Back to Hotels
              </Button>
              <Button onClick={() => navigate("/admin/rooms")} ghost>
                Clear filter
              </Button>
            </>
          )}
          <Button type="primary" onClick={handleAddRoom}>
            Add Room
          </Button>
        </div>
      </div>

      {/* Modals */}
      <AdEditRoom
        isModalEditVisible={isModalEditVisible}
        setIsModalEditVisible={setIsModalEditVisible}
        itemACtion={itemACtion}
      />
      <AdDeleteRoom
        isModalDeleteVisible={isModalDeleteVisible}
        setIsModalDeleteVisible={setIsModalDeleteVisible}
        itemACtion={itemACtion}
      />
      <AdAddRoom
        isModalAddVisible={isModalAddVisible}
        setIsModalAddVisible={setIsModalAddVisible}
      />

      {/* Table */}
      <Table
        dataSource={dataSource}
        rowKey="id"
        className="themed-table themed-table--center"
        scroll={{ x: 1100 }}
        pagination={{
          current: page,
          onChange: setPage,
          pageSize: 10,
          showSizeChanger: false,
          itemRender,
        }}
      >
        <Column
          title="Image"
          dataIndex="image"
          key="image"
          width={80}
          align="center"
          render={(image) => (
            <Avatar
              src={`${import.meta.env.VITE_IMAGE_URL}/rooms/${image}`}
              alt={`image ${image}`}
            />
          )}
        />

        <Column title="Name" dataIndex="name" key="name" width={160} align="center" />

        <Column
          title="Hotel"
          key="hotel"
          width={220}
          align="center"
          responsive={["md"]}
          render={(_, room) => {
            let resolvedHotelId = null;
            let resolvedHotelName = "";

            if (hotelId && hotelName) {
              resolvedHotelId = hotelId;
              resolvedHotelName = hotelName;
            } else {
              const hotelFromRoom = room.hotel;
              if (hotelFromRoom?.id) {
                resolvedHotelId = hotelFromRoom.id;
                resolvedHotelName = hotelFromRoom.name;
              } else {
                const possibleId = room.hotelId ?? room.hotel_id;
                if (possibleId != null) {
                  const byId = (hotels || []).find(
                    (ht) => String(ht.id) === String(possibleId)
                  );
                  if (byId) {
                    resolvedHotelId = byId.id;
                    resolvedHotelName = byId.name;
                  }
                }
                if (!resolvedHotelId) {
                  const byRoomInHotel = (hotels || []).find((ht) =>
                    (ht.rooms || []).some((r) => String(r.id) === String(room.id))
                  );
                  if (byRoomInHotel) {
                    resolvedHotelId = byRoomInHotel.id;
                    resolvedHotelName = byRoomInHotel.name;
                  }
                }
              }
            }

            if (!resolvedHotelId) return "—";

            return (
              <Button
                type="link"
                style={{ padding: 0 }}
                onClick={() => navigate(`/hotel/${resolvedHotelId}`)}
              >
                {resolvedHotelName || `Hotel #${resolvedHotelId}`}
              </Button>
            );
          }}
        />

        <Column
          title="Price"
          dataIndex="price"
          key="price"
          width={110}
          align="center"
          render={(v) => <span style={{ fontWeight: 700 }}>{fmtPrice(v)}</span>}
        />

        <Column
          title="Discount"
          key="discount"
          width={150}
          align="center"
          render={(_, room) => {
            const { value, isActive } = getDiscountInfo(room);
            if (value > 0) {
              const style = isActive ? discountActivePill : discountScheduledPill;
              return (
                <span style={style}>
                  {value}% {isActive ? "Active" : "Scheduled"}
                </span>
              );
            }
            return <span style={discountNonePill}>No discount</span>;
          }}
        />

        <Column title="Capacity" dataIndex="capacity" key="capacity" width={100} align="center" />

        <Column
          title="Type"
          dataIndex="type"
          key="type"
          width={230}
          align="center"
          responsive={["sm"]}
          render={(type) => (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
              {String(type || "")
                .split(",")
                .map((t, i) => (
                  <span key={i} style={{ ...basePill, ...typePillStyle(t) }}>
                    {String(t).trim()}
                  </span>
                ))}
            </div>
          )}
        />

        <Column
          title="Availability"
          dataIndex="availability"
          key="availability"
          width={140}
          align="center"
          render={(av) => (
            <span style={availabilityPill(Boolean(av))}>
              {av ? "available" : "not available"}
            </span>
          )}
        />

        <Column
          title="Action"
          key="action"
          width={120}
          align="center"
          fixed="right"
          render={(_, room) => (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                alignItems: "center",
              }}
            >
              <a
                onClick={() => handleEditRoom(room)}
                className="px-3 py-1 rounded-md font-medium text-white bg-blue-500 hover:bg-blue-600"
              >
                Edit
              </a>
              <a
                onClick={() => handleDeleteRoom(room)}
                className="px-3 py-1 rounded-md font-medium text-white bg-red-500 hover:bg-red-600"
              >
                Delete
              </a>
            </div>
          )}
        />
      </Table>
    </div>
  );
};

export default AdRoom;
