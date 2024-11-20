import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { bookingServices, roomServices } from "../../../services";

export const PaypalMain = ({ order }) => {
  const { user } = useSelector((state) => state.auth);
  const { rooms } = useSelector((state) => state.room);
  const [room, setRoom] = useState();
  const navigate = useNavigate();
  const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  useEffect(() => {
    if (rooms) {
      const data = rooms.find((item) => item.id == order.roomId);
      setRoom({ ...data, availability: false });
    }
  }, [order, rooms]);

  const initialOptions = {
    clientId: PAYPAL_CLIENT_ID,
    currency: "USD",
    intent: "capture",
  };

  console.log(room);

  const onCreateOrder = (data, actions) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: order?.totalPrice,
            currency_code: "USD",
          },
          description: "Thanh toán nâng cấp tài khoản",
          shipping: {
            name: {
              full_name: user?.fullName,
            },
          },
        },
      ],
    });
  };

  const onApproveOrder = async (data, actions) => {
    const details = await actions.order.capture();
    let rooms = [room];
    const newBooking = {
      checkIn: order.checkIn,
      checkOut: order.checkOut,
      totalPrice: parseFloat(order.totalPrice),
      payment: true,
      rooms: rooms,
    };
    try {
      await bookingServices.create(newBooking);
      await roomServices.edit(room.id, room);
    } catch (error) {
      console.error("Error adding booking:", error);
    }
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => onCreateOrder(data, actions)}
        onApprove={(data, actions) => onApproveOrder(data, actions)}
      />
    </PayPalScriptProvider>
  );
};
