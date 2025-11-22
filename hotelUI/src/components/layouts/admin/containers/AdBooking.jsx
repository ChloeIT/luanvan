import Column from "antd/es/table/Column";
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Table } from "antd";
import dayjs from "dayjs";

import { AdEditBooking } from "./booking/AdEditBooking";
import { AdDeleteBooking } from "./booking/AdDeleteBooking";
import { AdAddBooking } from "./booking/AdAddBooking";

// ⚠️ Tuỳ cách bạn export services / store, chỉnh lại path nếu cần
import { bookingServices } from "../../../../services";
import { bookingAction } from "../../../../store";

export const AdBooking = () => {
  const dispatch = useDispatch();
  const { bookings } = useSelector((state) => state.booking);

  const [isModalEditVisible, setIsModalEditVisible] = useState(false);
  const [isModalDeleteVisible, setIsModalDeleteVisible] = useState(false);
  const [isModalAddVisible, setIsModalAddVisible] = useState(false);
  const [itemACtion, setItemACtion] = useState();

  // 👉 Pagination state + JSX-only style (giống AdUser/AdHotel)
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

  /* =========================
   *  FORMAT NGÀY THÁNG NĂM
   * ========================= */
  const formatDate = (value) => {
    if (!value) return "-";
    // value có thể là string ISO hoặc LocalDateTime -> dayjs đều đọc được
    return dayjs(value).format("DD/MM/YYYY");
  };

  /* =========================
   *  FETCH BOOKINGS TỪ API
   * ========================= */
  const fetchBookings = useCallback(async () => {
    try {
      const res = await bookingServices.getAll(); // hoặc bookingServices.getAllBooking()
      const data = res?.data ?? res;
      dispatch(bookingAction.setBookings(data));
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleEditBooking = (booking) => {
    setIsModalEditVisible(true);
    setItemACtion(booking);
  };

  const handleDeleteBooking = (booking) => {
    setIsModalDeleteVisible(true);
    setItemACtion(booking);
  };

  const handleAddBooking = () => {
    setIsModalAddVisible(true);
    setItemACtion(undefined);
  };

  // 👉 Payment pill style (đồng bộ tone với Roles)
  const pillPaid = {
    backgroundColor: "#E9F9D8",
    color: "#237804",
    border: "1px solid #95DE64",
  };
  const pillUnpaid = {
    backgroundColor: "#FFF1D6",
    color: "#AD4E00",
    border: "1px solid #FFC069",
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
    <div className="p-4">
      {/* Modals */}
      <AdEditBooking
        isModalEditVisible={isModalEditVisible}
        setIsModalEditVisible={setIsModalEditVisible}
        itemACtion={itemACtion}
        onUpdated={fetchBookings} // reload list sau khi edit
      />
      <AdDeleteBooking
        isModalDeleteVisible={isModalDeleteVisible}
        setIsModalDeleteVisible={setIsModalDeleteVisible}
        itemACtion={itemACtion}
        onDeleted={fetchBookings} // reload list sau khi delete
      />
      <AdAddBooking
        isModalAddVisible={isModalAddVisible}
        setIsModalAddVisible={setIsModalAddVisible}
        itemACtion={itemACtion}
        onCreated={fetchBookings} // reload list sau khi add
      />

      {/* Actions */}
      <div className="mb-3 flex items-center justify-end">
        <Button type="primary" onClick={handleAddBooking}>
          Add Booking
        </Button>
      </div>

      {/* Table */}
      <Table
        dataSource={bookings}
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
          title="Check In"
          dataIndex="checkIn"
          key="checkIn"
          align="center"
          render={(v) => formatDate(v)}
        />
        <Column
          title="Check Out"
          dataIndex="checkOut"
          key="checkOut"
          align="center"
          render={(v) => formatDate(v)}
        />
        <Column
          title="Total Price"
          dataIndex="totalPrice"
          key="totalPrice"
          align="center"
          render={(v) => <span style={{ fontWeight: 700 }}>{v}</span>}
        />
        <Column
          title="Payment"
          dataIndex="payment"
          key="payment"
          align="center"
          render={(paid) => (
            <span style={{ ...basePill, ...(paid ? pillPaid : pillUnpaid) }}>
              {paid ? "paid" : "not yet paid"}
            </span>
          )}
        />
        <Column
          title="Action"
          key="action"
          align="center"
          fixed="right"
          render={(_, booking) => (
            <div
              key={booking.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                alignItems: "center",
              }}
            >
              <a
                onClick={() => handleEditBooking(booking)}
                className="px-3 py-1 rounded-md font-medium text-white bg-blue-500 hover:bg-blue-600"
              >
                Edit
              </a>
              <a
                onClick={() => handleDeleteBooking(booking)}
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

export default AdBooking;
