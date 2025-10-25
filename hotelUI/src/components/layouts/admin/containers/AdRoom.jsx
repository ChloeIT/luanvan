import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { AdEditRoom } from "./room/AdEditRoom";
import { AdDeleteRoom } from "./room/AdDeleteRoom";
import { AdAddRoom } from "./room/AdAddRoom";
import { Avatar, Button, Table } from "antd";
import Column from "antd/es/table/Column";
import { useLocation, useNavigate } from "react-router-dom";
import { IoLocationOutline } from "react-icons/io5";
import { HomeOutlined } from "@ant-design/icons";

export const AdRoom = () => {
  const { rooms } = useSelector((state) => state.room);
  const { hotels } = useSelector((state) => state.hotel);

  const [isModalEditVisible, setIsModalEditVisible] = useState(false);
  const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false);
  const [isModalAddVisible, setIsModalAddVisible] = useState(false);
  const [itemACtion, setItemACtion] = useState();

  const { search } = useLocation();
  const navigate = useNavigate();
  const hotelId = new URLSearchParams(search).get("hotelId");

  // Lấy rooms theo hotelId từ state.hotel (state.room không chứa hotelId)
  const { dataSource, hotelName, hotelAddress } = useMemo(() => {
    if (hotelId) {
      const hotel = (hotels || []).find((h) => String(h.id) === String(hotelId));
      return {
        dataSource: hotel?.rooms || [],
        hotelName: hotel?.name || `Hotel #${hotelId}`,
        hotelAddress: hotel?.address || "",
      };
    }
    return { dataSource: rooms || [], hotelName: null, hotelAddress: "" };
  }, [rooms, hotels, hotelId]);

  // Pagination UI
  const [page, setPage] = useState(1);
  const pagerBase = {
    backgroundColor: "#1677ff",
    border: "1px solid #1677ff",
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
  const pagerActive = { backgroundColor: "#155bd6", borderColor: "#155bd6", color: "#fff" };
  const itemRender = (pageNum, type, original) => {
    if (type === "page") {
      const isActive = pageNum === page;
      return React.cloneElement(original, {
        style: { ...pagerBase, ...(isActive ? pagerActive : null) },
        children: pageNum,
      });
    }
    if (type === "prev" || type === "next") return React.cloneElement(original, { style: pagerBase });
    return original;
  };

  // Pills base
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

  // Availability (giữ nguyên xanh lá & đỏ)
  const availabilityGreen = { backgroundColor: "#D9F7BE", color: "#237804", border: "1px solid #95DE64" };
  const availabilityRed = { backgroundColor: "#FFCCC7", color: "#A8071A", border: "1px solid #FF7875" };
  const availabilityPill = (av) => (av ? { ...basePill, ...availabilityGreen } : { ...basePill, ...availabilityRed });

  // Type palette (không dùng đỏ/xanh lá để tránh trùng Availability)
  const pillBlue = { backgroundColor: "#BAE0FF", color: "#0958D9", border: "1px solid #69B1FF" }; // Standard/Basic/Single/Twin/Double
  const pillOrange = { backgroundColor: "#FFE7BA", color: "#AD4E00", border: "1px solid #FFC069" }; // Deluxe/Family/Executive
  const pillIndigo = { backgroundColor: "#D6E4FF", color: "#1D39C4", border: "1px solid #ADC6FF" }; // Superior/Premium/Executive
  const pillPurple = { backgroundColor: "#EFDBFF", color: "#722ED1", border: "1px solid #D3ADF7" }; // Suite/Exec Suite/Business Suite
  const pillDeepPurple = { backgroundColor: "#F9F0FF", color: "#531DAB", border: "1px solid #D3ADF7" }; // VIP/Luxury
  const pillBrown = { backgroundColor: "#FFF2CC", color: "#AD6800", border: "1px solid #FFD666" }; // Duplex/Apartment/Villa
  const pillGray = { backgroundColor: "#F5F5F5", color: "#595959", border: "1px solid #D9D9D9" }; // Budget/Economy/Compact & fallback

  // Chuẩn hoá & mapping theo type trong DB
  const typePillStyle = (raw) => {
    const key = String(raw || "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // bỏ dấu
      .toLowerCase().trim();

    if (/(vip|luxury)/.test(key)) return pillDeepPurple;
    if (/(suite|executive\s*suite|business\s*suite)/.test(key)) return pillPurple;
    if (/(deluxe|family\s*deluxe)/.test(key)) return pillOrange;
    if (/(superior|premium|executive)/.test(key)) return pillIndigo;
    if (/(standard|basic|single|twin|double)/.test(key)) return pillBlue;
    if (/(budget|economy|compact)/.test(key)) return pillGray;
    if (/(duplex|apartment|villa)/.test(key)) return pillBrown;

    return pillGray; // fallback cho các giá trị lạ
  };

  const fmtPrice = (v) => v; // tuỳ bạn thêm formatter VND

  const handleEditRoom = (room) => { setIsModalEditVisible(true); setItemACtion(room); };
  const handleDeleteRoom = (room) => { setIsModalDeleteVisible(true); setItemACtion(room); };
  const handleAddRoom = () => { setIsModalAddVisible(true); setItemACtion(); };

  useEffect(() => { }, [itemACtion]);

  return (
    <div className="p-4">
      {/* Header: Title + Address + Buttons */}
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
                maxWidth: "600px",
              }}
              title={hotelName || undefined}
            >
              {hotelName}
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
          align="center"
          render={(image) => (
            <Avatar
              src={`${import.meta.env.VITE_IMAGE_URL}/rooms/${image}`}
              alt={`image ${image}`}
            />
          )}
        />
        <Column title="Name" dataIndex="name" key="name" align="center" />
        <Column
          title="Price"
          dataIndex="price"
          key="price"
          align="center"
          render={(v) => <span style={{ fontWeight: 700 }}>{fmtPrice(v)}</span>}
        />
        <Column title="Capacity" dataIndex="capacity" key="capacity" align="center" />
        <Column
          title="Type"
          dataIndex="type"
          key="type"
          align="center"
          render={(type) => (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                justifyContent: "center",
              }}
            >
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
          align="center"
          render={(av) => (
            <span style={availabilityPill(Boolean(av))}>
              {av ? "available" : "not available"}
            </span>
          )}
        />
        <Column title="Created At" dataIndex="create_at" key="create_at" align="center" />
        <Column title="Updated At" dataIndex="update_at" key="update_at" align="center" />
        <Column
          title="Action"
          key="action"
          align="center"
          fixed="right"
          render={(_, room) => (
            <div
              key={room.id}
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
