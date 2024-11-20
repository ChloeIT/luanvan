import React from "react";

export const PaypalInforOrder = ({ order }) => {

  return (
    <>
      <h3 className="text-xl dark:text-white font-semibold leading-5 text-gray-800 mb-4">
        Payment
      </h3>
      <div className="flex justify-between border-b border-gray-200 pb-2 pt-4">
        <p className="text-base dark:text-white leading-4 text-gray-800">
          Reservation upgrade fee
        </p>
        <p className="text-base dark:text-gray-300 leading-4 text-gray-600">
          {order.totalPrice}$
        </p>
      </div>
      <div className="flex justify-between border-b border-gray-200 pb-2 pt-4">
        <p className="text-base dark:text-white leading-4 text-gray-800">
          VAT(10%)
        </p>
        <p className="text-base dark:text-gray-300 leading-4 text-gray-600">
          {(order.totalPrice * 10) / 100}$
        </p>
      </div>
      <div className="flex justify-between border-b border-gray-200 pb-2 pt-4">
        <p className="text-base dark:text-white font-semibold leading-4 text-gray-800">
          Total price
        </p>
        <p className="text-base dark:text-gray-300 font-semibold leading-4 text-gray-600">
          {order.totalPrice + (order.totalPrice * 10) / 100}$
        </p>
      </div>
    </>
  );
};
