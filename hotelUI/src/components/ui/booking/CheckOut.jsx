import { Col, Row } from "antd";
import React from "react";
import { IoMdMail } from "react-icons/io";
import { useSelector } from "react-redux";
import { imgUserDefault } from "../../../assets";
import { PaypalMain } from "./PaypalMain";
import { PaypalInfoUser } from "./PaypalInfoUser";
import { PaypalInforOrder } from "./PaypalInforOrder";

export const CheckOut = () => {

  const data = JSON.parse(localStorage.getItem("bookData"));
  return (
    <div className="flex-1 py-4 px-4 md:px-6 2xl:px-20 2xl:container 2xl:mx-auto">
      <Row justify="start">
        <Col span={24}>
          <h1 className="text-3xl dark:text-white lg:text-4xl font-semibold leading-7 lg:leading-9 text-gray-800 uppercase font-kantit">
            Order payment - booking
          </h1>
          <p className="text-base dark:text-gray-300 font-medium leading-6 text-gray-600">
            {/* {formatDate(now)} */}
          </p>
        </Col>
      </Row>

      <Row gutter={[]} className="mt-4">
        <PaypalInfoUser />
        
        <Col xs={24} lg={16}>
          <div
            className="p-6 bg-gray-50 dark:bg-[#537a7a]"
            style={{ height: "100%" }}
          >
            <PaypalInforOrder order={data} />
            <div className="mt-6">
              <h3 className="text-xl dark:text-white font-semibold leading-5 text-gray-800 py-4">
                Payment option
              </h3>
              <div className="w-full">
                <PaypalMain order={data} />
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};
