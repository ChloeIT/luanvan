import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AdEditRoom } from "./room/AdEditRoom";
import { AdDeleteRoom } from "./room/AdDeleteRoom";
import { AdAddRoom } from "./room/AdAddRoom";
import { Avatar, Button, Table } from "antd";
import Column from "antd/es/table/Column";

export const AdRoom = () => {
  const { rooms } = useSelector((state) => state.room);

  const [isModalEditVisible, setIsModalEditVisible] = useState(false);
  const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false);
  const [isModalAddVisible, setIsModalAddVisible] = useState(false);
  const [itemACtion, setItemACtion] = useState();

  // Pagination (JSX-only) – giống AdUser/AdHotel
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
  const pagerActive = {
    backgroundColor: "#155bd6",
    borderColor: "#155bd6",
    color: "#fff",
  };
  const itemRender = (pageNum, type, original) => {
    if (type === "page") {
      const isActive = pageNum === page;
      return React.cloneElement(original, {
        style: { ...pagerBase, ...(isActive ? pagerActive : null) },
        children: pageNum,
      });
    }
    if (type === "prev" || type === "next") {
      return React.cloneElement(original, { style: pagerBase });
    }
    return original;
  };

  const handleEditRoom = (room) => {
    setIsModalEditVisible(true);
    setItemACtion(room);
  };
  const handleDeleteRoom = (room) => {
    setIsModalDeleteVisible(true);
    setItemACtion(room);
  };
  const handleAddRoom = () => {
    setIsModalAddVisible(true);
    setItemACtion();
  };

  useEffect(() => {
    // console.log(itemACtion);
  }, [itemACtion]);

  // Pill styles (đồng bộ Roles)
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
  // Green (ROLE_USER) – dùng cho available
  const pillGreen = {
    backgroundColor: "#E9F9D8",
    color: "#237804",
    border: "1px solid #95DE64",
  };
  // Orange (ROLE_MODERATOR)
  const pillOrange = {
    backgroundColor: "#FFF1D6",
    color: "#AD4E00",
    border: "1px solid #FFC069",
  };
  // Red (ROLE_ADMIN)
  const pillRed = {
    backgroundColor: "#FFE8E6",
    color: "#A8071A",
    border: "1px solid #FF7875",
  };
  // Blue (bổ sung cho Standard để không trùng available)
  const pillBlue = {
    backgroundColor: "#E6F4FF",
    color: "#0958D9",
    border: "1px solid #69B1FF",
  };

  // Mapping màu cho TYPE
  const typePillStyle = (t) => {
    const key = String(t || "").toLowerCase().trim();
    if (/(suite|presidential|royal)/.test(key)) return pillRed;        // cao cấp
    if (/(deluxe|family|executive)/.test(key)) return pillOrange;      // trung cấp
    if (/(standard|basic|single|twin)/.test(key)) return pillBlue;     // thường (xanh dương)
    return pillGreen;                                                  // fallback
  };

  const availabilityPill = (available) =>
    available ? { ...basePill, ...pillGreen } : { ...basePill, ...pillRed };

  const fmtPrice = (v) => v; // thay bằng formatter VND nếu muốn

  return (
    <div className="p-4">
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

      {/* Actions */}
      <div className="mb-3 flex items-center justify-end">
        <Button type="primary" onClick={handleAddRoom}>
          Add Room
        </Button>
      </div>

      {/* Table */}
      <Table
        dataSource={rooms}
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
        {/* Bỏ ColumnGroup để không có chữ "Rooms" */}
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
