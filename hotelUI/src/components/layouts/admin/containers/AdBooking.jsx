// src/components/layouts/admin/containers/AdBooking.jsx
import Column from "antd/es/table/Column";
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Table } from "antd";
import dayjs from "dayjs";

import { AdEditBooking } from "./booking/AdEditBooking";
import { AdDeleteBooking } from "./booking/AdDeleteBooking";
import { AdAddBooking } from "./booking/AdAddBooking";

import { bookingServices } from "../../../../services";
import { bookingAction } from "../../../../store";

export const AdBooking = () => {
  const dispatch = useDispatch();
  const { bookings } = useSelector((state) => state.booking);

  const [isModalEditVisible, setIsModalEditVisible] = useState(false);
  const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false);
  const [isModalAddVisible, setIsModalAddVisible] = useState(false);
  const [itemACtion, setItemACtion] = useState();

  /* Pagination */
  const [page, setPage] = useState(1);

  const formatDate = (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "-");

  /* Fetch bookings */
  const fetchBookings = useCallback(async () => {
    try {
      const res = await bookingServices.getAll();
      dispatch(bookingAction.setBookings(res?.data ?? res));
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /* Payment pills */
  const pillBase = {
    padding: "4px 12px",
    borderRadius: 999,
    fontWeight: 600,
    fontSize: 12,
    display: "inline-block",
    whiteSpace: "nowrap",
  };

  const pillPaid = {
    ...pillBase,
    backgroundColor: "#E9F9D8",
    border: "1px solid #95DE64",
    color: "#237804",
  };

  const pillUnpaid = {
    ...pillBase,
    backgroundColor: "#FFF1D6",
    border: "1px solid #FFC069",
    color: "#AD4E00",
  };

  return (
    <div className="p-4">
      {/* Modals */}
      <AdEditBooking
        isModalEditVisible={isModalEditVisible}
        setIsModalEditVisible={setIsModalEditVisible}
        itemACtion={itemACtion}
        onUpdated={fetchBookings}
      />
      <AdDeleteBooking
        isModalDeleteVisible={isModalDeleteVisible}
        setIsModalDeleteVisible={setIsModalDeleteVisible}
        itemACtion={itemACtion}
        onDeleted={fetchBookings}
      />
      <AdAddBooking
        isModalAddVisible={isModalAddVisible}
        setIsModalAddVisible={setIsModalAddVisible}
        itemACtion={itemACtion}
        onCreated={fetchBookings}
      />

      {/* Header + Add */}
      <div className="mb-3 flex items-center justify-end">
        <Button type="primary" onClick={() => setIsModalAddVisible(true)}>
          Add Booking
        </Button>
      </div>

      {/* TABLE */}
      <Table
        dataSource={bookings}
        rowKey="id"
        className="themed-table themed-table--center"
        size="middle"
        scroll={{ x: 1050 }}  // responsive scroll
        pagination={{
          current: page,
          onChange: setPage,
          pageSize: 10,
          showSizeChanger: false,
        }}
      >
        {/* Column: Check In */}
        <Column
          title="Check In"
          dataIndex="checkIn"
          align="center"
          width={120}
          render={(v) => formatDate(v)}
        />

        {/* Column: Check Out */}
        <Column
          title="Check Out"
          dataIndex="checkOut"
          align="center"
          width={120}
          render={(v) => formatDate(v)}
        />

        {/* Column: Room */}
        <Column
          title="Room"
          dataIndex="rooms"
          align="center"
          width={160}
          responsive={["sm"]}
          render={(rooms = []) =>
            rooms.length ? (
              <div className="flex flex-col gap-1">
                {rooms.map((r) => (
                  <span
                    key={r.id}
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: "#E0F0FF",
                      border: "1px solid #4096FF",
                      color: "#0958D9",
                    }}
                  >
                    {r.name}
                  </span>
                ))}
              </div>
            ) : (
              "-"
            )
          }
        />

        {/* Column: Hotel */}
        <Column
          title="Hotel"
          align="center"
          width={200}
          responsive={["md"]}
          render={(_, b) => {
            const hotels = [
              ...new Set((b.rooms || []).map((r) => r?.hotel?.name).filter(Boolean)),
            ];

            if (!hotels.length) return "-";

            return (
              <div className="flex flex-col gap-1">
                {hotels.map((name) => (
                  <span
                    key={name}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 999,
                      fontWeight: 600,
                      fontSize: 12,
                      backgroundColor: "#F3E8FF",
                      border: "1px solid #B37FEB",
                      color: "#531DAB",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            );
          }}
        />

        {/* Column: Total Price */}
        <Column
          title="Total Price"
          dataIndex="totalPrice"
          align="center"
          width={110}
          render={(v) => <strong>{v}</strong>}
        />

        {/* Column: Payment */}
        <Column
          title="Payment"
          dataIndex="payment"
          align="center"
          width={150}
          render={(v) =>
            v ? <span style={pillPaid}>paid</span> : <span style={pillUnpaid}>not yet paid</span>
          }
        />

        {/* Column: Actions */}
        <Column
          title="Action"
          align="center"
          width={140}
          render={(_, b) => (
            <div className="flex flex-col gap-2 items-center">
              <button
                onClick={() => {
                  setIsModalEditVisible(true);
                  setItemACtion(b);
                }}
                className="px-3 py-1 rounded-md font-medium text-white bg-blue-500 hover:bg-blue-600"
              >
                Edit
              </button>

              <button
                onClick={() => {
                  setIsModalDeleteVisible(true);
                  setItemACtion(b);
                }}
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

export default AdBooking;
