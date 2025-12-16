// src/pages/PaypalMain.jsx
import React from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { bookingServices, roomServices } from "../../../services";

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

  // ✅ Convert "YYYY-MM-DD" -> "YYYY-MM-DDT00:00:00" for BE LocalDateTime
  const toLocalDateTime = (d) => (d ? `${d}T00:00:00` : null);

  // Create PayPal order
  const onCreateOrder = (data, actions) => {
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
      console.error("❌ Missing checkout items. Cannot create bookings.", order);
      return;
    }

    try {
      // ✅ 1 booking per room (supports different dates per room)
      const createJobs = items.map((it) => {
        const payload = {
          checkIn: toLocalDateTime(it.checkIn),
          checkOut: toLocalDateTime(it.checkOut),
          totalPrice: Number(it.totalPrice || 0),
          payment: true,
          roomIds: [it.roomId],
        };

        console.log("📤 Create booking payload:", payload);
        return bookingServices.create(payload);
      });

      const results = await Promise.all(createJobs);

      const bookingIds = results
        .map((res) => res?.data ?? res)
        .map((b) => b?.id)
        .filter((id) => id != null);

      console.log("✅ Bookings created:", bookingIds);

      // Update room availability (if BE already does it, you can remove this)
      const roomUpdateJobs = items.map((it) =>
        roomServices.edit(it.roomId, { availability: false })
      );
      await Promise.allSettled(roomUpdateJobs);

      localStorage.setItem("lastBookingIds", JSON.stringify(bookingIds));
      navigate("/success", { state: { bookingIds } });
    } catch (error) {
      console.error("❌ Error creating bookings:", error);
      console.log("💬 BE response:", error?.response?.data);
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
