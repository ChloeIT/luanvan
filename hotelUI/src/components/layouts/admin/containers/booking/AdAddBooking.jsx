// import React, { useEffect, useState } from "react";
// import { bookingServices } from "../../../../../services";
// import { Input, Modal } from "antd";

// export const AdAddBooking = ({ isModalAddVisible, setIsModalAddVisible }) => {
//   const [checkIn, setCheckIn] = useState("");
//   const [checkOut, setCheckOut] = useState("");
//   const [totalPrice, setTotalPrice] = useState(0);
//   const [payment, setPayment] = useState("");

//   const handleModalOk = async () => {
//     const newBooking = {
//       checkIn,
//       checkOut,
//       totalPrice: parseFloat(totalPrice),
//       payment,
//     };

//     try {
//       console.log(newBooking);
//       await bookingServices.create(newBooking); // Thay đổi từ "edit" thành "add"
//       setIsModalAddVisible(false);
//     } catch (error) {
//       console.error("Error adding booking:", error);
//     }
//   };

//   useEffect(() => {
//     console.log(totalPrice);
//   }, [totalPrice]);
//   return (
//     <Modal
//       title="Add Booking"
//       open={isModalAddVisible}
//       onCancel={() => setIsModalAddVisible(false)}
//       onOk={handleModalOk}
//     >
//       <div className="flex items-center">
//         <p className="min-w-20">Check In</p>
//         <Input value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
//       </div>

//       <div className="flex items-center">
//         <p className="min-w-20">Check Out</p>
//         <Input value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
//       </div>

//       <div className="flex items-center">
//         <p className="min-w-20">Total Price</p>
//         <Input
//           value={totalPrice}
//           type="number"
//           onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)}
//         />
//       </div>

//       <div className="flex items-center">
//         <p className="min-w-20">Payment</p>
//         <Input value={payment} onChange={(e) => setPayment(e.target.value)} />
//       </div>
//     </Modal>
//   );
// };

import React, { useState } from "react";
import { bookingServices } from "../../../../../services";
import { Modal, DatePicker, Input, Select } from "antd";
import dayjs from "dayjs";

const { Option } = Select;

export const AdAddBooking = ({ isModalAddVisible, setIsModalAddVisible }) => {
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [payment, setPayment] = useState(null); 
  const handleModalOk = async () => {
    if (!checkIn || !checkOut || !payment) {
      alert("Please fill in all required fields.");
      return;
    }

    const newBooking = {
      checkIn: checkIn.format("YYYY-MM-DDTHH:mm:ss"),
      checkOut: checkOut.format("YYYY-MM-DDTHH:mm:ss"),
      totalPrice: Number(totalPrice),
      payment: payment === "paid" ? "true" : "false",
    };

    try {
      await bookingServices.create(newBooking);
      setIsModalAddVisible(false);

      // Reset form
      setCheckIn(null);
      setCheckOut(null);
      setTotalPrice(0);
      setPayment(null);
    } catch (error) {
      console.error("Lỗi khi tạo booking:", error);
    }
  };

  return (
    <Modal
      title="Add Booking"
      open={isModalAddVisible}
      onCancel={() => setIsModalAddVisible(false)}
      onOk={handleModalOk}
      okText="OK"
      cancelText="Cancel"
      width={520}
    >
      {/* Check In */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Check In</label>
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm"
          placeholder="Choose check-in date and time"
          value={checkIn}
          onChange={setCheckIn}
          className="w-full"
          allowClear
        />
      </div>

      {/* Check Out */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Check Out</label>
        <DatePicker
          showTime
          format="YYYY-MM-DD HH:mm"
          placeholder="Choose check-out date and time"
          value={checkOut}
          onChange={setCheckOut}
          className="w-full"
          allowClear
        />
      </div>

      {/* Total Price */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Total Price</label>
        <Input
          type="number"
          placeholder="0"
          value={totalPrice || ""}
          onChange={(e) => setTotalPrice(parseFloat(e.target.value) || 0)}
          min={0}
          className="w-full"
        />
      </div>

      {/* Payment */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Payment</label>
        <Select
          placeholder="Choose payment status"
          value={payment}
          onChange={(value) => setPayment(value)}
          className="w-full"
        >
          <Option value="paid">Paid</Option>
          <Option value="notpaid">Not pay yet</Option>
        </Select>
      </div>

      {/* Debug (bạn có thể xóa sau khi test xong)
      <div className="text-xs bg-gray-100 p-3 rounded mt-4 font-mono">
        <p>Check In: {checkIn ? checkIn.format("YYYY-MM-DDTHH:mm:ss") : "-"}</p>
        <p>Check Out: {checkOut ? checkOut.format("YYYY-MM-DDTHH:mm:ss") : "-"}</p>
        <p>Total Price: {totalPrice}</p>
        <p>Payment: {payment === "paid" ? "true" : "false"}</p>
      </div> */}
    </Modal>
  );
};