// src/components/layouts/admin/containers/AdRoom.jsx
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, Button, Table, Switch, message, Tooltip } from "antd";
import Column from "antd/es/table/Column";
import { useLocation, useNavigate } from "react-router-dom";
import { IoLocationOutline } from "react-icons/io5";
import { HomeOutlined } from "@ant-design/icons";

import { AdEditRoom } from "./room/AdEditRoom";
import { AdAddRoom } from "./room/AdAddRoom";

import { roomServices } from "../../../../services";
import { roomAction } from "../../../../store/room/slice";

/* ========= DISCOUNT HELPERS (like MOD) ========= */
const formatDateShort = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const getDiscountInfo = (room) => {
  const raw =
    room?.discountPercent ?? room?.discount_percent ?? room?.discount ?? 0;
  const percent = Number(raw);

  if (!Number.isFinite(percent) || percent <= 0) {
    return {
      percent: 0,
      state: "none",
      startRaw: null,
      endRaw: null,
      label: "0%",
    };
  }

  const startRaw = room.discountStart ?? room.discount_start ?? null;
  const endRaw = room.discountEnd ?? room.discount_end ?? null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const toDate = (v) => {
    if (!v) return null;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const start = toDate(startRaw);
  const end = toDate(endRaw);

  let state = "active";
  if (start && today < start) state = "scheduled";
  else if (end && today > end) state = "expired";

  let label = `${percent}% Active`;
  if (state === "scheduled") label = `${percent}% Scheduled`;
  if (state === "expired") label = `${percent}% Ended`;

  return { percent, state, startRaw, endRaw, label };
};

const buildDiscountTooltip = (info) => {
  if (!info || info.percent <= 0 || info.state === "none") return "No discount";

  const range = [
    info.startRaw ? formatDateShort(info.startRaw) : null,
    info.endRaw ? formatDateShort(info.endRaw) : null,
  ].filter(Boolean);

  let stateLabel = "";
  if (info.state === "active") stateLabel = "Currently active";
  if (info.state === "scheduled") stateLabel = "Scheduled period";
  if (info.state === "expired") stateLabel = "Ended period";

  if (range.length === 2)
    return `${info.percent}% • ${stateLabel} (${range[0]} → ${range[1]})`;
  if (range.length === 1)
    return `${info.percent}% • ${stateLabel} (${range[0]})`;
  return `${info.percent}% • ${stateLabel}`;
};

export const AdRoom = () => {
  const dispatch = useDispatch();
  const { rooms } = useSelector((state) => state.room);
  const { hotels } = useSelector((state) => state.hotel);

  const [isModalEditVisible, setIsModalEditVisible] = useState(false);
  const [isModalAddVisible, setIsModalAddVisible] = useState(false);
  const [itemACtion, setItemACtion] = useState(null);

  const [togglingId, setTogglingId] = useState(null);

  const { search } = useLocation();
  const navigate = useNavigate();
  const hotelId = new URLSearchParams(search).get("hotelId");

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

  /* ================= Pagination UI ================= */
  const [page, setPage] = useState(1);

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
    padding: "2px 10px",
    borderRadius: 9999,
    fontWeight: 700,
    fontSize: 11,
    lineHeight: "18px",
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
    av
      ? { ...basePill, ...availabilityGreen }
      : { ...basePill, ...availabilityRed };

  // Discount pill colors theo state (giống MOD)
  const discountActivePill = {
    ...basePill,
    backgroundColor: "#D1FAE5",
    color: "#047857",
    border: "1px solid #A7F3D0",
  };
  const discountScheduledPill = {
    ...basePill,
    backgroundColor: "#FEF3C7",
    color: "#B45309",
    border: "1px solid #FDE68A",
  };
  const discountExpiredPill = {
    ...basePill,
    backgroundColor: "#F5F5F5",
    color: "#737373",
    border: "1px solid #E5E5E5",
  };
  const discountNonePill = {
    ...basePill,
    backgroundColor: "#F5F5F5",
    color: "#8C8C8C",
    border: "1px solid #D9D9D9",
  };

  const fmtPrice = (v) => v;

  const handleEditRoom = (room) => {
    setItemACtion(room);
    setIsModalEditVisible(true);
  };

  const handleAddRoom = () => {
    setItemACtion(null);
    setIsModalAddVisible(true);
  };

  const handleToggleAvailability = async (room, nextValue) => {
    if (!room?.id) return;

    try {
      setTogglingId(room.id);

      const res = await roomServices.setAvailability(room.id, nextValue);

      const updatedRoom = res?.data?.data ?? res?.data?.room ?? res?.data;
      const finalRoom = updatedRoom?.id
        ? updatedRoom
        : { ...room, availability: nextValue };

      dispatch(roomAction.updateRooms(finalRoom));
      message.success(
        `Room is now ${nextValue ? "available" : "maintenance"} ✅`
      );
    } catch (err) {
      console.error("Toggle availability error:", err);
      message.error(
        err?.response?.data?.message || "Update availability failed."
      );
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div style={{ minWidth: 0 }}>
          <h2 className="text-2xl font-extrabold text-[#2a2a2a] flex items-center gap-2">
            Rooms of{" "}
            <span
              style={{
                color: "var(--primary)",
                fontSize: 22,
                fontWeight: 900,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 520,
                display: "inline-block",
                verticalAlign: "bottom",
              }}
              title={hotelName || undefined}
            >
              {hotelName || "All Hotels"}
            </span>
          </h2>

          {hotelId && hotelAddress && (
            <p
              className="mt-1 text-sm text-gray-700 flex items-center gap-2"
              style={{ minWidth: 0 }}
            >
              <IoLocationOutline />
              <span
                className="block whitespace-nowrap overflow-hidden text-ellipsis"
                style={{ maxWidth: 520 }}
              >
                {hotelAddress}
              </span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hotelId && (
            <>
              <Button
                onClick={() => navigate("/admin/hotels")}
                icon={<HomeOutlined />}
              >
                Back
              </Button>
              <Button onClick={() => navigate("/admin/rooms")} ghost>
                Clear
              </Button>
            </>
          )}
          <Button type="primary" onClick={handleAddRoom}>
            Add
          </Button>
        </div>
      </div>

      {/* Modals */}
      <AdEditRoom
        isModalEditVisible={isModalEditVisible}
        setIsModalEditVisible={setIsModalEditVisible}
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
        pagination={{
          current: page,
          onChange: setPage,
          pageSize: 10,
          showSizeChanger: false,
          itemRender,
        }}
      >
        <Column
          title="Img"
          dataIndex="image"
          key="image"
          width={56}
          align="center"
          render={(image) => (
            <Avatar
              size={32}
              src={`${import.meta.env.VITE_IMAGE_URL}/rooms/${image}`}
              alt={`image ${image}`}
            />
          )}
        />

        <Column
          title="Name"
          dataIndex="name"
          key="name"
          width={160}
          align="left"
          ellipsis
          render={(name) => (
            <Tooltip title={name}>
              <span style={{ fontWeight: 700 }}>{name}</span>
            </Tooltip>
          )}
        />

        <Column
          title="Hotel"
          key="hotel"
          width={160}
          align="left"
          responsive={["md"]}
          ellipsis
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
              }
            }

            if (!resolvedHotelId) return "—";

            return (
              <Tooltip title={resolvedHotelName || `Hotel #${resolvedHotelId}`}>
                <Button
                  type="link"
                  style={{ padding: 0, maxWidth: 150 }}
                  onClick={() => navigate(`/hotel/${resolvedHotelId}`)}
                >
                  <span
                    style={{
                      display: "inline-block",
                      maxWidth: 150,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {resolvedHotelName || `Hotel #${resolvedHotelId}`}
                  </span>
                </Button>
              </Tooltip>
            );
          }}
        />

        <Column
          title="Price"
          dataIndex="price"
          key="price"
          width={90}
          align="right"
          render={(v) => <span style={{ fontWeight: 800 }}>{fmtPrice(v)}</span>}
        />

        {/* ✅ Discount: hiển thị giống MOD (tooltip có thời gian) */}
        <Column
          title="Disc"
          key="discount"
          width={130}
          align="center"
          responsive={["sm"]}
          render={(_, room) => {
            const info = getDiscountInfo(room);

            if (info.percent <= 0) {
              return <span style={discountNonePill}>No</span>;
            }

            let style = discountActivePill;
            if (info.state === "scheduled") style = discountScheduledPill;
            if (info.state === "expired") style = discountExpiredPill;

            return (
              <Tooltip title={buildDiscountTooltip(info)}>
                <span style={style}>{info.label}</span>
              </Tooltip>
            );
          }}
        />

        <Column
          title="Cap"
          dataIndex="capacity"
          key="capacity"
          width={70}
          align="center"
        />

        <Column
          title="Type"
          dataIndex="type"
          key="type"
          width={140}
          align="left"
          responsive={["lg"]}
          ellipsis
          render={(type) => (
            <Tooltip title={type}>
              <span style={{ fontWeight: 600 }}>{type}</span>
            </Tooltip>
          )}
        />

        <Column
          title="Avail"
          dataIndex="availability"
          key="availability"
          width={120}
          align="center"
          render={(av, room) => (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Switch
                checked={Boolean(av)}
                size="small"
                loading={togglingId === room.id}
                onChange={(checked) => handleToggleAvailability(room, checked)}
              />
              <span style={availabilityPill(Boolean(av))}>
                {av ? "ON" : "OFF"}
              </span>
            </div>
          )}
        />

        <Column
          title="Action"
          key="action"
          width={90}
          align="center"
          render={(_, room) => (
            <Button
              size="small"
              type="primary"
              onClick={() => handleEditRoom(room)}
            >
              Edit
            </Button>
          )}
        />
      </Table>
    </div>
  );
};

export default AdRoom;
