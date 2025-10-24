import Column from "antd/es/table/Column";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AdEditBooking } from "./booking/AdEditBooking";
import { Button, Table } from "antd";
import { AdDeleteBooking } from "./booking/AdDeleteBooking";
import { AdAddBooking } from "./booking/AdAddBooking";

export const AdBooking = () => {
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
    setItemACtion();
  };

  useEffect(() => {
    // console.log(itemACtion);
  }, [itemACtion]);

  // 👉 Payment pill style (đồng bộ tone với Roles)
  // paid -> xanh lá (ROLE_USER), not yet paid -> cam (ROLE_MODERATOR)
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

  // (tuỳ chọn) helper định dạng ngày ngắn gọn, nếu bạn muốn
  const fmt = (v) => v; // giữ nguyên; thay bằng formatDateTime nếu bạn có

  return (
    <div className="p-4">
      {/* Modals */}
      <AdEditBooking
        isModalEditVisible={isModalEditVisible}
        setIsModalEditVisible={setIsModalEditVisible}
        itemACtion={itemACtion}
      />
      <AdDeleteBooking
        isModalDeleteVisible={isModalDeleteVisible}
        setIsModalDeleteVisible={setIsModalDeleteVisible}
        itemACtion={itemACtion}
      />
      <AdAddBooking
        isModalAddVisible={isModalAddVisible}
        setIsModalAddVisible={setIsModalAddVisible}
        itemACtion={itemACtion}
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
        {/* BỎ ColumnGroup để không có tiêu đề "Bookings" */}
        <Column title="Check In" dataIndex="checkIn" key="checkIn" align="center"
          render={(v) => fmt(v)} />
        <Column title="Check Out" dataIndex="checkOut" key="checkOut" align="center"
          render={(v) => fmt(v)} />
        <Column title="Total Price" dataIndex="totalPrice" key="totalPrice" align="center"
          render={(v) => <span style={{ fontWeight: 700 }}>{v}</span>} />
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
