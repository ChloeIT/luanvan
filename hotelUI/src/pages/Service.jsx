import React from "react";
import { AiOutlineGlobal } from "react-icons/ai";
import { FaHotel } from "react-icons/fa";
import { IoPersonSharp, IoSettingsSharp } from "react-icons/io5";

export const Service = () => {
  return (
    <div className="container-xxl py-5">
      <div className="container">
        <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
          <h6 className="section-title text-2xl text-center text-primary px-3">
            Services
          </h6>
          <h1 className="mb-5">Our Services</h1>
        </div>
        <div className="row g-4">
          <div
            className="col-lg-3  col-sm-6 wow fadeInUp"
            data-wow-delay="0.1s"
          >
            <div className="service-item h-full bg-amber-200 rounded pt-3">
              <div className="p-4">
                <AiOutlineGlobal size={50} />
                <h5 className="py-2">Loyalty program</h5>
                <p>Thank you for accompanying SB Hotel!</p>
                <p>
                  To thank customers who regularly use our services, we launch a
                  Loyalty program with many attractive incentives.
                </p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.3s">
            <div className="service-item  h-full bg-amber-200 rounded pt-3">
              <div className="p-4">
                <FaHotel size={50} />
                <h5 className="py-2">Accumulate points</h5>
                <p>
                  Earn points every time you make a reservation, redeem
                  attractive gifts!
                </p>
                <p>The higher the level, the greater the benefit!</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.5s">
            <div className="service-item h-full bg-amber-200 rounded pt-3">
              <div className="p-4">
                <IoPersonSharp size={50} />
                <h5 className="py-2">24/7 Customer Support</h5>
                <p>
                  Our professional and enthusiastic support staff will answer
                  all your questions and help you book a hotel room quickly and
                  easily.
                </p>
                <p>Please contact us today!</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6 wow fadeInUp" data-wow-delay="0.7s">
            <div className="service-item h-full bg-amber-200 rounded pt-3">
              <div className="p-4">
                <IoSettingsSharp size={50} />
                <h5 className="py-2">Promotions and offers</h5>
                <p>Brilliant promotions - Surprisingly cheap prices!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
