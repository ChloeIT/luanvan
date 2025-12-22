// src/components/layouts/admin/AdHotel.jsx
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { AdAddHotel, AdDeleteHotel, AdEditHotel } from "./hotel";
import { Avatar, Button, Table } from "antd";
import Column from "antd/es/table/Column";
import { Link } from "react-router-dom";

const IMAGE_ROOT = import.meta.env.VITE_IMAGE_URL || "";

/** Preset amenities (vừa chọn vừa nhập) */
const AMENITY_PRESETS = [
  "Free WiFi",
  "Restaurant",
  "Beach",
  "Private Beach",
  "Pool",
  "Spa",
  "Gym",
  "Golf",
  "Villas",
  "Kids Club",
  "Theme Park Access",
  "Parking",
  "Airport Shuttle",
  "Breakfast",
  "Bar",
  "Pet Friendly",
];

const normalizeAmenities = (amenities) => {
  if (!amenities) return [];
  if (Array.isArray(amenities)) {
    return amenities.map((x) => String(x).trim()).filter(Boolean);
  }
  return String(amenities)
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
};

export const joinAmenities = (list) =>
  (Array.isArray(list) ? list : [])
    .map((x) => String(x).trim())
    .filter(Boolean)
    .join(", ");

export const AdHotel = () => {
  const { hotels } = useSelector((state) => state.hotel);

  const [isModalEditVisible, setIsModalEditVisible] = useState(false);
  const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false);
  const [isModalAddVisible, setIsModalAddVisible] = useState(false);
  const [itemACtion, setItemACtion] = useState();

  /* Pagination */
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

  const handleEditHotel = (hotel) => {
    setIsModalEditVisible(true);
    setItemACtion(hotel);
  };
  const handleDeleteHotel = (hotel) => {
    setIsModalDeleteVisible(true);
    setItemACtion(hotel);
  };
  const handleAddHotel = () => {
    setIsModalAddVisible(true);
    setItemACtion(undefined);
  };

  // build URL chỉ đường tới address (Google Maps Directions)
  const buildDirectionsUrl = (address) =>
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      address || ""
    )}`;

  // base style cho amenities pill
  const amenityBase = {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: 9999,
    fontWeight: 700,
    fontSize: 12,
    lineHeight: "20px",
    boxShadow: "0 1px 0 rgba(0,0,0,.06)",
    whiteSpace: "nowrap",
  };

  const pillStyleByAmenity = (t) => {
    if (["Spa", "Pool", "Gym"].includes(t))
      return {
        backgroundColor: "#FFE8E6",
        color: "#A8071A",
        border: "1px solid #FF7875",
      };
    if (["Free WiFi", "Restaurant"].includes(t))
      return {
        backgroundColor: "#FFF1D6",
        color: "#AD4E00",
        border: "1px solid #FFC069",
      };
    return {
      backgroundColor: "#E9F9D8",
      color: "#237804",
      border: "1px solid #95DE64",
    };
  };

  const amenityOptions = useMemo(
    () => AMENITY_PRESETS.map((a) => ({ label: a, value: a })),
    []
  );

  return (
    <div className="p-4">
      {/* Modals */}
      <AdEditHotel
        isModalEditVisible={isModalEditVisible}
        setIsModalEditVisible={setIsModalEditVisible}
        itemACtion={itemACtion}
        amenityOptions={amenityOptions}
      />
      <AdDeleteHotel
        isModalDeleteVisible={isModalDeleteVisible}
        setIsModalDeleteVisible={setIsModalDeleteVisible}
        itemACtion={itemACtion}
      />
      <AdAddHotel
        isModalAddVisible={isModalAddVisible}
        setIsModalAddVisible={setIsModalAddVisible}
        amenityOptions={amenityOptions}
      />

      {/* Header + Add button */}
      <div className="mb-3 flex items-center justify-end">
        <Button type="primary" onClick={handleAddHotel}>
          Add Hotel
        </Button>
      </div>

      <Table
        dataSource={hotels}
        rowKey="id"
        className="themed-table themed-table--center"
        size="middle"
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
          align="center"
          width={80}
          render={(image, hotel) => {
            const src = image ? `${IMAGE_ROOT}/hotels/${image}` : null;
            const initials =
              hotel?.name?.trim()?.split(" ")?.map((w) => w[0])?.join("") ?? "?";
            return (
              <Avatar src={src} alt={hotel?.name || "hotel"}>
                {!src && initials}
              </Avatar>
            );
          }}
        />

        <Column
          title="Name"
          dataIndex="name"
          key="name"
          align="center"
          width={200}
          render={(text, hotel) => (
            <Link
              to={`/admin/rooms?hotelId=${hotel.id}`}
              className="font-semibold text-blue-600 hover:underline"
              title="View rooms"
            >
              {text}
            </Link>
          )}
        />

        <Column
          title="Address"
          dataIndex="address"
          key="address"
          align="center"
          width={260}
          responsive={["sm"]}
          render={(address) =>
            address ? (
              <a
                href={buildDirectionsUrl(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
                title="Open directions in Google Maps"
              >
                {address}
              </a>
            ) : (
              "—"
            )
          }
        />

        <Column
          title="Amenities"
          dataIndex="amenities"
          key="amenities"
          align="center"
          width={260}
          responsive={["md"]}
          render={(amenities) => {
            const list = normalizeAmenities(amenities);
            if (!list.length) return "—";
            return (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  justifyContent: "center",
                }}
              >
                {list.map((a, i) => (
                  <span
                    key={`${a}-${i}`}
                    style={{ ...amenityBase, ...pillStyleByAmenity(a) }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            );
          }}
        />

        <Column
          title="Rating"
          dataIndex="rating"
          key="rating"
          align="center"
          width={90}
          render={(r) => <span style={{ fontWeight: 700 }}>{r}</span>}
        />

        <Column
          title="Phone"
          dataIndex="phone"
          key="phone"
          align="center"
          width={130}
          responsive={["sm"]}
        />

        <Column
          title="Action"
          key="action"
          align="center"
          width={140}
          render={(_, hotel) => (
            <div
              key={hotel.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                alignItems: "center",
              }}
            >
              <button
                onClick={() => handleEditHotel(hotel)}
                className="px-3 py-1 rounded-md font-medium text-white bg-blue-500 hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteHotel(hotel)}
                className="px-3 py-1 rounded-md font-medium text-white bg-red-500 hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          )}
        />
      </Table>
    </div>
  );
};

export default AdHotel;
