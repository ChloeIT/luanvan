// src/components/ui/service/Service.jsx
import React from "react";
import { AiOutlineGlobal } from "react-icons/ai";
import { FaHotel } from "react-icons/fa";
import { IoPersonSharp, IoSettingsSharp } from "react-icons/io5";

export const Service = () => {
  const pairStyle = {
    "--pair-gap": "4px",   // khoảng cách giữa 2 gạch
    "--pair-mt": "14px",
    "--pair-mb": "14px",
  };

  const services = [
    {
      icon: <AiOutlineGlobal size={50} color="white" />,
      title: "Loyalty program",
      desc: (
        <>
          <p>Thank you for accompanying SB Hotel!</p>
          <p>
            To thank customers who regularly use our services, we launch a
            Loyalty program with many attractive incentives.
          </p>
        </>
      ),
      delay: "0.1s",
    },
    {
      icon: <FaHotel size={50} color="white" />,
      title: "Accumulate points",
      desc: (
        <>
          <p>
            Earn points every time you make a reservation, redeem attractive
            gifts!
          </p>
          <p>The higher the level, the greater the benefit!</p>
        </>
      ),
      delay: "0.3s",
    },
    {
      icon: <IoPersonSharp size={50} color="white" />,
      title: "24/7 Customer Support",
      desc: (
        <>
          <p>
            Our professional and enthusiastic support staff will answer all your
            questions and help you book a hotel room quickly and easily.
          </p>
          <p>Please contact us today!</p>
        </>
      ),
      delay: "0.5s",
    },
    {
      icon: <IoSettingsSharp size={50} color="white" />,
      title: "Promotions and offers",
      desc: (
        <p>Brilliant promotions - Surprisingly cheap prices!</p>
      ),
      delay: "0.7s",
    },
  ];

  return (
    <div className="container-xxl py-5">
      <div className="container">
        <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
          <div className="heading-line mx-auto" style={{ "--heading-gap": "14px" }}>
            {/* 2 gạch bên trái */}
            <span
              style={{
                display: "grid",
                justifyItems: "end",
                gap: "6px",
                marginRight: "2px",
              }}
            >
              <span className="divider" style={{ "--w": "120px" }} />
              <span className="divider" style={{ "--w": "60px", "--alpha": .45 }} />
            </span>

            <h6 className="heading-text text-3xl text-primary text-uppercase">Services</h6>

            {/* 2 gạch bên phải */}
            <span
              style={{
                display: "grid",
                justifyItems: "start",
                gap: "6px",
                marginLeft: "2px",
              }}
            >
              <span className="divider" style={{ "--w": "120px" }} />
              <span className="divider" style={{ "--w": "60px", "--alpha": .45 }} />
            </span>
          </div>
          <h1 className="mb-5">Our Services</h1>
        </div>

        {/* 4 ô tương tự 3 Easy Steps */}
        <div className="row gy-5 gx-4 justify-content-center align-items-stretch">
          {services.map((s, i) => (
            <div
              key={i}
              className="col-lg-3 col-sm-6 text-center pt-4 wow fadeInUp d-flex"
              data-wow-delay={s.delay}
            >
              <div className="position-relative border border-primary pt-5 pb-4 px-4 w-100 h-100 d-flex flex-column">
                <div
                  className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle position-absolute top-0 start-50 translate-middle shadow"
                  style={{ width: "100px", height: "100px" }}
                >
                  {s.icon}
                </div>

                <h5
                  className="mt-4 mb-0 d-flex align-items-center justify-content-center text-center"
                  style={{ minHeight: "60px" }}
                >
                  {s.title}
                </h5>
                <div className="divider-pair" style={pairStyle}>
                  <span className="divider divider--muted" style={{ "--w": "25%", "--h": "2px" }} />
                  <span className="divider divider--muted" style={{ "--w": "50%", "--h": "2px" }} />
                </div>


                <div className="flex-grow-1">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
