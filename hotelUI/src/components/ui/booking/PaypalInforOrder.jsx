// src/pages/PaypalInforOrder.jsx
import React, { useMemo } from "react";

export const PaypalInforOrder = ({ order }) => {
  const items = Array.isArray(order?.items) ? order.items : [];

  const price = Number(order?.totalPrice || 0);
  const vat = Math.round(price * 0.1);
  const total = price + vat;

  const roomCount = items.length;

  const nightsTotal = useMemo(() => {
    return items.reduce((sum, it) => sum + Number(it?.nights || 0), 0);
  }, [items]);

  /* ===== Group rooms by hotel ===== */
  const groupedByHotel = useMemo(() => {
    const map = {};
    items.forEach((it) => {
      const hotel = it.hotelName || "Unknown hotel";
      if (!map[hotel]) map[hotel] = [];
      map[hotel].push(it);
    });
    return map;
  }, [items]);

  const row = "py-2 grid grid-cols-[1fr,auto] items-center";
  const label = "text-sm text-gray-700";
  const amount = "text-sm text-gray-900 font-semibold";
  const totalLabel = "text-sm md:text-base font-bold text-gray-900 uppercase";
  const totalAmount = "text-lg md:text-xl font-extrabold text-gray-900";

  return (
    <div className="divide-y">
      {/* ===== Summary ===== */}
      <div className="py-2">
        <div className="text-sm text-gray-700 mb-2">
          Selected rooms: <b>{roomCount}</b>
          {nightsTotal > 0 && (
            <>
              {" "}
              • Total nights: <b>{nightsTotal}</b>
            </>
          )}
        </div>

        {/* ===== Hotel + Room list ===== */}
        {Object.keys(groupedByHotel).map((hotelName) => (
          <div key={hotelName} className="mb-2">
            {/* Hotel name */}
            <div
              style={{
                fontWeight: 800,
                color: "var(--primary)",
                fontSize: 14,
              }}
            >
              {hotelName}
            </div>

            {/* Rooms */}
            <div className="mt-1 space-y-1">
              {groupedByHotel[hotelName].map((it) => (
                <div
                  key={it.roomId}
                  className="text-sm text-gray-700"
                  style={{ paddingLeft: 10 }}
                >
                  • <b>{it.name || "Room"}</b>{" "}
                  <span className="text-gray-500">
                    ({it.checkIn} → {it.checkOut})
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ===== Price breakdown ===== */}
      <div className={row}>
        <span className={label}>Subtotal</span>
        <span className={amount}>{price}$</span>
      </div>

      <div className={row}>
        <span className={label}>VAT (10%)</span>
        <span className={amount}>{vat}$</span>
      </div>

      <div className="py-2 grid grid-cols-[1fr,auto] items-center">
        <span className={totalLabel}>Total</span>
        <span className={totalAmount}>{total}$</span>
      </div>
    </div>
  );
};
