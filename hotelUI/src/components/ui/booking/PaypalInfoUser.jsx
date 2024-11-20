import { Col, Image } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { imgUserDefault } from "../../../assets";
import { IoMdMail } from "react-icons/io";

export const PaypalInfoUser = () => {
  const { user } = useSelector((state) => state.auth);
  const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;
  return (
    <>
      <Col xs={24} lg={8}>
        <div
          className="p-6 bg-gray-50 dark:bg-[#537a7a]"
          style={{ height: "100%" }}
        >
          <h3 className="text-xl dark:text-white text-center font-semibold leading-5 text-gray-800">
            User information
          </h3>
          <div className="flex flex-col items-start">
            <div className="flex justify-center items-center py-4 border-b border-gray-200 w-full">
              <Image
                width={100}
                src={
                  user?.image
                    ? `${IMAGE_URL}/users/${user.image}`
                    : imgUserDefault
                }
                alt="avatar"
              />
              <div className="ml-4">
                <p className="text-base dark:text-white font-semibold leading-4">
                  Name: {user?.fullName}
                </p>
                <p className="text-base dark:text-white font-serif leading-4">
                  Address: {user?.address}
                </p>
                <p className="text-base dark:text-white font-serif leading-4">
                  Phone: {user?.phone}
                </p>
              </div>
            </div>
            <div className="flex justify-center items-center py-4 border-b border-gray-200 w-full">
              <p>
                <IoMdMail
                  size={20}
                  className=" dark:text-white text-black m-1"
                />
              </p>
              <p className="dark:text-white h-full cursor-pointer text-sm leading-5">
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </Col>
    </>
  );
};
