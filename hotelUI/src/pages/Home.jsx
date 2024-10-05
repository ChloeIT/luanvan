import React from "react";
import { Image } from "antd";

export const Home = () => {
  return (
    <>
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-5">
            <div
              className="col-lg-6 wow fadeInUp min-h-96"
              data-wow-delay="0.1s"
            >
              <div className="position-relative h-100">
                <Image src="" alt="About Image" width="500" height="450" />
              </div>
            </div>
            <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.3s">
              <h6 className="section-title bg-white text-start text-primary pe-3">
                About Us
              </h6>
              <h1 className="mb-4">
                Welcome to <span className="text-primary">SB Hotel</span>
              </h1>
              <p>Hello username</p>
              <p>Your account_id:account_id</p>
              <p>Please log in to see your information.</p>

              <p className="mb-4">
                Welcome to our hotel search and booking page!
              </p>
              <p className="mb-4">
                Searching and booking hotels has never been easier. With a
                convenient booking system and extensive hotel database, we will
                help you find the ideal destination for all your trips. Explore
                and experience with us today!
              </p>
              <div className="row gy-2 gx-4 mb-4">
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2"></i>24/7
                    Service
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2"></i>
                    Handpicked Hotels
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2"></i>5
                    Star Accommodations
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2"></i>
                    Provide enough information
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2"></i>
                    Promotions and offers
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0">
                    <i className="fa fa-arrow-right text-primary me-2"></i>
                    Upgrade membership
                  </p>
                </div>
              </div>
              <a className="btn btn-primary py-3 px-5 mt-2" href="">
                Read More
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container-xxl py-5 destination">
        <div className="container">
            <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
                <h6 className="section-title bg-white text-center text-primary px-3">Discount</h6>
                <h1 className="mb-5">Save big today!</h1>
            </div>
            <div className="row g-3">
                <div className="col-lg-7 col-md-6">
                    <div className="row g-3">
                        <div className="col-lg-12 col-md-12 wow zoomIn" data-wow-delay="0.1s">
                            <a className="position-relative d-block overflow-hidden" href="">
                            <Image src="" alt="des-1 Image" width="860" height="200"/>
                                <div className="bg-white text-danger fw-bold position-absolute top-0 start-0 m-3 py-1 px-2">30% OFF</div>
                                <div className="bg-white text-primary fw-bold position-absolute bottom-0 end-0 m-3 py-1 px-2">Flower</div>
                            </a>
                        </div>
                        <div className="col-lg-6 col-md-12 wow zoomIn" data-wow-delay="0.3s">
                            <a className="position-relative d-block overflow-hidden" href="">
                            <Image src="" alt="des-1 Image" width="380" height="200"/>
                                <div className="bg-white text-danger fw-bold position-absolute top-0 start-0 m-3 py-1 px-2">25% OFF</div>
                                <div className="bg-white text-primary fw-bold position-absolute bottom-0 end-0 m-3 py-1 px-2">MeKong</div>
                            </a>
                        </div>
                        <div className="col-lg-6 col-md-12 wow zoomIn" data-wow-delay="0.5s">
                            <a className="position-relative d-block overflow-hidden" href="">
                            <Image src="" alt="thinh vuong" width="380" height="200"/>
                                <div className="bg-white text-danger fw-bold position-absolute top-0 start-0 m-3 py-1 px-2">35% OFF</div>
                                <div className="bg-white text-primary fw-bold position-absolute bottom-0 end-0 m-3 py-1 px-2">Thịnh Vượng</div>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="col-lg-5 col-md-6 wow zoomIn min-h-80" data-wow-delay="0.7s">
                    <a className="position-relative d-block h-100 overflow-hidden" href="">
                    <Image src="" alt="tay do" width="500" height="415"/>
                        <div className="bg-white text-danger fw-bold position-absolute top-0 start-0 m-3 py-1 px-2">20% OFF</div>
                        <div className="bg-white text-primary fw-bold position-absolute bottom-0 end-0 m-3 py-1 px-2">Tây Đô</div>
                    </a>
                </div>
            </div>
        </div>
    </div>
    </>
  );
};
