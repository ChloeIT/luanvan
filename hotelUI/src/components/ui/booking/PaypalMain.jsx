import React, { useEffect, useState } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { bookingServices, roomServices } from "../../../services";

export const PaypalMain = ({ order }) => {
  const { user } = useSelector((state) => state.auth);
  const { rooms } = useSelector((state) => state.room);
  const [room, setRoom] = useState(null);
  const navigate = useNavigate();

  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  // Tìm room tương ứng với order.roomId
  useEffect(() => {
    if (!order || !rooms || rooms.length === 0) return;

    const found = rooms.find(
      (item) => String(item.id) === String(order.roomId)
    );

    if (found) {
      setRoom({ ...found, availability: false });
    } else {
      console.warn("Không tìm thấy room với id =", order.roomId);
    }
  }, [order, rooms]);

  const initialOptions = {
    "client-id": PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
  };

  // Tạo order trên PayPal
  const onCreateOrder = (data, actions) => {
    const amount = Number(order?.totalPrice || 0).toFixed(2);

    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: amount,
            currency_code: "USD",
          },
          description: "Hotel booking payment",
          shipping: {
            name: {
              full_name: user?.fullName || user?.username || "Guest",
            },
          },
        },
      ],
    });
  };

  // Sau khi PayPal capture thành công
  const onApproveOrder = async (data, actions) => {
    const details = await actions.order.capture();
    console.log("✅ PayPal capture success:", details);

    if (!order || !room) {
      console.error("Thiếu dữ liệu để tạo booking:", { order, room });
      return;
    }

    // Payload đúng với BookingRequest bên BE
    const newBooking = {
      checkIn: order.checkIn,
      checkOut: order.checkOut,
      totalPrice: Number(order.totalPrice),
      payment: true,
      roomIds: [room.id],
    };

    try {
      console.log("👉 Payload gửi /api/booking/create:", newBooking);

      // Có 2 khả năng:
      // 1) bookingServices.create -> AxiosResponse => { data: Booking, ... }
      // 2) bookingServices.create -> Booking trực tiếp
      const res = await bookingServices.create(newBooking);
      console.log("📦 Response từ BE:", res);

      const booking = res?.data ?? res; // ưu tiên res.data, nếu không có thì dùng res
      const bookingId = booking?.id;

      console.log("✅ Booking created, ID =", bookingId);

      if (bookingId != null) {
        localStorage.setItem("lastBookingId", String(bookingId));
      }

      // Cập nhật room (nếu BE chưa tự xử lý)
      await roomServices.edit(room.id, { ...room, availability: false });

      // Điều hướng sang trang success, truyền bookingId qua state
      navigate("/success", { state: { bookingId } });
    } catch (error) {
      console.error("❌ Error adding booking:", error);
      console.log("💬 BE trả về:", error?.response?.data);
    }
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={onCreateOrder}
        onApprove={onApproveOrder}
      />
    </PayPalScriptProvider>
  );
};
