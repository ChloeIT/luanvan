import React from "react";
import { Image } from "antd";
import { hotel8, hotel7, hotel6, hotel5 } from "../../../assets";

export const Discount = () => {
  return (
    <div className="container-xxl py-5 destination">
      <div className="container">
        <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
          <div className="heading-line mx-auto" style={{ "--heading-gap": "14px" }}>
            {/* 2 gạch bên trái – căn lề phải */}
            <span
              style={{
                display: "grid",
                justifyItems: "end", // 👈 gạch thẳng hàng mép phải chữ
                gap: "6px",
                marginRight: "2px", // tạo khoảng cách nhỏ giữa chữ và gạch
              }}
            >
              <span className="divider" style={{ "--w": "120px" }} />
              <span className="divider" style={{ "--w": "60px", "--alpha": .45 }} />
            </span>

            <h6 className="heading-text text-3xl text-primary text-uppercase">Discount</h6>

            {/* 2 gạch bên phải */}
            <span
              style={{
                display: "grid",
                justifyItems: "start", // 👈 gạch bắt đầu từ mép trái chữ
                gap: "6px",
                marginLeft: "2px", // tạo khoảng cách nhỏ giữa chữ và gạch
              }}
            >
              <span className="divider" style={{ "--w": "120px" }} />
              <span className="divider" style={{ "--w": "60px", "--alpha": .45 }} />
            </span>
          </div>

          <h1 className="mb-5">Save big today!</h1>
        </div>


        <div className="row g-3">
          <div className="col-lg-7 col-md-6">
            <div className="row g-3">
              <div
                className="col-lg-12 col-md-12 wow zoomIn"
                data-wow-delay="0.1s"
              >
                <div className="position-relative d-block overflow-hidden">
                  <Image
                    src={hotel5}
                    alt="des-1 Image"
                    width="860"
                    height="200"
                  />
                  <div className="bg-white text-danger fw-bold position-absolute top-0 start-0 m-3 py-1 px-2">
                    30% OFF
                  </div>
                  <div className="bg-white text-primary fw-bold position-absolute bottom-0 end-0 m-3 py-1 px-2">
                    Flower
                  </div>
                </div>
              </div>
              <div
                className="col-lg-6 col-md-12 wow zoomIn"
                data-wow-delay="0.3s"
              >
                <div className="position-relative d-block overflow-hidden">
                  <Image
                    src={hotel6}
                    alt="des-1 mekong"
                    width="380"
                    height="200"
                  />
                  <div className="bg-white text-danger fw-bold position-absolute top-0 start-0 m-3 py-1 px-2">
                    25% OFF
                  </div>
                  <div className="bg-white text-primary fw-bold position-absolute bottom-0 end-0 m-3 py-1 px-2">
                    MeKong
                  </div>
                </div>
              </div>
              <div
                className="col-lg-6 col-md-12 wow zoomIn"
                data-wow-delay="0.5s"
              >
                <div className="position-relative d-block overflow-hidden">
                  <Image
                    src={hotel7}
                    alt="thinh vuong"
                    width="380"
                    height="200"
                  />
                  <div className="bg-white text-danger fw-bold position-absolute top-0 start-0 m-3 py-1 px-2">
                    35% OFF
                  </div>
                  <div className="bg-white text-primary fw-bold position-absolute bottom-0 end-0 m-3 py-1 px-2">
                    Thịnh Vượng
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="col-lg-5 col-md-6 wow zoomIn min-h-80"
            data-wow-delay="0.7s"
          >
            <div className="position-relative d-block h-100 overflow-hidden">
              <Image src={hotel8} alt="tay do" width="500" height="415" />
              <div className="bg-white text-danger fw-bold position-absolute top-0 start-0 m-3 py-1 px-2">
                20% OFF
              </div>
              <div className="bg-white text-primary fw-bold position-absolute bottom-0 end-0 m-3 py-1 px-2">
                Tây Đô
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
