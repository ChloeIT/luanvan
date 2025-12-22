// src/pages/PaypalMain.jsx
import React, { useRef } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { bookingServices } from "../../../services";

export const PaypalMain = ({ order }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  const initialOptions = {
    "client-id": PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
  };

  const items = Array.isArray(order?.items) ? order.items : [];
  const totalPrice = Number(order?.totalPrice || 0);

  const toLocalDateTime = (d) => (d ? `${d}T00:00:00` : null);

  // ✅ chặn chạy 2 lần
  const creatingRef = useRef(false);

  // Create PayPal order
  const onCreateOrder = (data, actions) => {
    // ✅ nếu user lỡ chọn nhiều phòng, vẫn tạo order theo tổng tiền hiện tại,
    // nhưng ta sẽ chặn ở onApprove (an toàn hơn)
    const amount = (Number.isFinite(totalPrice) ? totalPrice : 0).toFixed(2);

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

  // After PayPal capture success
  const onApproveOrder = async (data, actions) => {
    const details = await actions.order.capture();
    console.log("✅ PayPal capture success:", details);

    if (!items.length) {
      console.error("❌ Missing checkout items. Cannot create booking.", order);
      return;
    }

    // ✅ CHẶN: 1 lần chỉ được 1 room
    if (items.length !== 1) {
      console.error("❌ You can only pay for 1 room per checkout.");
      alert("You can only pay for 1 room per checkout. Please select exactly 1 room.");
      return;
    }

    if (creatingRef.current) return;
    creatingRef.current = true;

    try {
      const it = items[0];

      const payload = {
        checkIn: toLocalDateTime(it.checkIn),
        checkOut: toLocalDateTime(it.checkOut),
        totalPrice: Number(it.totalPrice || 0),
        payment: true,
        roomIds: [it.roomId], // ✅ chỉ 1 room
      };

      console.log("📤 Create booking payload (SINGLE):", payload);

      const res = await bookingServices.create(payload);
      const booking = res?.data ?? res;

      const bookingId = booking?.id;
      console.log("✅ Booking created:", bookingId);

      localStorage.setItem(
        "lastBookingIds",
        JSON.stringify(bookingId ? [bookingId] : [])
      );

      navigate("/success", {
        state: { bookingIds: bookingId ? [bookingId] : [] },
      });
    } catch (error) {
      console.error("❌ Error creating booking:", error);
      console.log("💬 BE response:", error?.response?.data);
    } finally {
      creatingRef.current = false;
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
