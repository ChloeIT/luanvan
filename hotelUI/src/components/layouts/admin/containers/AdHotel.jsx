import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AdAddHotel, AdDeleteHotel, AdEditHotel } from "./hotel";
import { Avatar, Button, Table } from "antd";
import ColumnGroup from "antd/es/table/ColumnGroup";
import Column from "antd/es/table/Column";

export const AdHotel = () => {
  const { hotels } = useSelector((state) => state.hotel);
  const [isModalEditVisible, setIsModalEditVisible] = useState(false);
  const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false);
  const [isModalAddVisible, setIsModalAddVisible] = useState(false);
  const [itemACtion, setItemACtion] = useState();

  // 👉 Pagination state + style (giống AdUser)
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
    setItemACtion();
  };

  useEffect(() => {
    // console.log(itemACtion);
  }, [itemACtion]);

  // 👉 style pill tiện ích (giống ý tưởng "Roles" ở AdUser)
  const basePill = {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: 9999,
    fontWeight: 700,
    fontSize: 12,
    lineHeight: "20px",
    boxShadow: "0 1px 0 rgba(0,0,0,.06)",
    whiteSpace: "nowrap",
    border: "1px solid #95DE64",
    backgroundColor: "#E9F9D8",
    color: "#237804",
  };

  return (
    <div className="p-4">
      {/* Modals */}
      <AdEditHotel
        isModalEditVisible={isModalEditVisible}
        setIsModalEditVisible={setIsModalEditVisible}
        itemACtion={itemACtion}
      />
      <AdDeleteHotel
        isModalDeleteVisible={isModalDeleteVisible}
        setIsModalDeleteVisible={setIsModalDeleteVisible}
        itemACtion={itemACtion}
      />
      <AdAddHotel
        isModalAddVisible={isModalAddVisible}
        setIsModalAddVisible={setIsModalAddVisible}
        itemACtion={itemACtion}
      />

      {/* Actions */}
      <div className="mb-3 flex items-center justify-end">
        <Button type="primary" onClick={handleAddHotel}>
          Add Hotel
        </Button>
      </div>

      {/* Table */}
      <Table
        dataSource={hotels}
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
              src={`${import.meta.env.VITE_IMAGE_URL}/hotels/${image}`}
              alt={`image ${image}`}
            />
          )}
        />
        <Column title="Name" dataIndex="name" key="name" align="center" />
        <Column title="Address" dataIndex="address" key="address" align="center" />
        <Column
          title="Amenities"
          dataIndex="amenities"
          key="amenities"
          align="center"
          render={(amenities) => {
            const pillStyleByAmenity = (text) => {
              if (["Spa", "Pool", "Gym"].includes(text)) {
                return {
                  backgroundColor: "#FFE8E6",
                  color: "#A8071A",
                  border: "1px solid #FF7875",
                };
              }
              if (["Free WiFi", "Restaurant"].includes(text)) {
                return {
                  backgroundColor: "#FFF1D6",
                  color: "#AD4E00",
                  border: "1px solid #FFC069",
                };
              }
              return {
                backgroundColor: "#E9F9D8",
                color: "#237804",
                border: "1px solid #95DE64",
              };
            };

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

            return (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  justifyContent: "center",
                }}
              >
                {(amenities || "").split(",").map((amenity, i) => (
                  <span key={i} style={{ ...basePill, ...pillStyleByAmenity(amenity.trim()) }}>
                    {amenity.trim()}
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
          render={(r) => <span style={{ fontWeight: 700 }}>{r}</span>}
        />
        <Column title="Phone" dataIndex="phone" key="phone" align="center" />
        <Column
          title="Rooms"
          dataIndex="rooms"
          key="rooms"
          align="center"
          render={(rooms) => rooms?.length ?? 0}
        />

        {/* Action column giữ nguyên */}
        <Column
          title="Action"
          key="action"
          align="center"
          fixed="right"
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
              <a
                onClick={() => handleEditHotel(hotel)}
                className="px-3 py-1 rounded-md font-medium text-white bg-blue-500 hover:bg-blue-600"
              >
                Edit
              </a>
              <a
                onClick={() => handleDeleteHotel(hotel)}
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

export default AdHotel;
