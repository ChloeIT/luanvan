import React from "react";

export const PaypalInforOrder = ({ order }) => {
  const price = Number(order?.totalPrice || 0);
  const vat = Math.round(price * 0.1);
  const total = price + vat;

  const row = "py-2 grid grid-cols-[1fr,auto] items-center";
  const label = "text-sm text-gray-700";
  const amount = "text-sm text-gray-900 font-semibold";
  const totalLabel = "text-sm md:text-base font-bold text-gray-900 uppercase";
  const totalAmount = "text-lg md:text-xl font-extrabold text-gray-900";

  return (
    <div className="divide-y">
      <div className={row}>
        <span className={label}>Reservation upgrade fee</span>
        <span className={amount}>{price}$</span>
      </div>

      <div className={row}>
        <span className={label}>VAT (10%)</span>
        <span className={amount}>{vat}$</span>
      </div>

      <div className="py-2 grid grid-cols-[1fr,auto] items-center">
        <span className={totalLabel}>Total price</span>
        <span className={totalAmount}>{total}$</span>
      </div>
    </div>
  );
};
