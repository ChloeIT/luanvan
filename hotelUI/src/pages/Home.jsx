import React, { useEffect, useState } from "react";
import { Image } from "antd";
import { about, hotel1, hotel2, hotel3, hotel4 } from "../assets";
import { FaArrowRight, FaMapMarkerAlt, FaMapPin } from "react-icons/fa";
import { useSelector } from "react-redux";
import { HotelCard } from "../components/ui/hotel/HotelCard";
import { Link } from "react-router-dom";
export const Home = () => {
  const { hotels } = useSelector((state) => state.hotel);
  const [popularHotels, setPopularHotels] = useState([]);
  const { user } = useSelector((state) => state.auth);
  
  useEffect(() => {
    const data = hotels.filter((hotel) => hotel.rating >= 4);
    setPopularHotels(data);
  }, [hotels]);

  return (
    <>
      <div className="container-xxl py-5">
        <div className="container">
          <div className="row g-5">
            <div
              className="col-lg-6 wow fadeInUp min-h-96"
              data-wow-delay="0.1s"
            >
              <div className="position-relative">
                <Image src={about} alt="About Image" className="img-small" />
              </div>
            </div>
            <div className="col-lg-6 wow fadeInUp" data-wow-delay="0.3s">
              <h6 className=" text-2xl text-start text-primary pe-3">
                About Us
              </h6>
              <h1 className="mb-4">
                Welcome to <span className="text-primary">SB Hotel</span>
              </h1>
              {user ? (
                <p>Hello {user?.fullName}</p>
              ) : (
                <Link to="/login">Please log in to see your information.</Link>
              )}
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
                  <p className="mb-0 flex">
                    <FaArrowRight className="mx-2" />
                    24/7 Service
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0 flex">
                    <FaArrowRight className="mx-2" />
                    Handpicked Hotels
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0 flex">
                    <FaArrowRight className="mx-2" /> 5 Star Accommodations
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0 flex">
                    <FaArrowRight className="mx-2" /> Provide enough information
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0 flex">
                    <FaArrowRight className="mx-2" />
                    Promotions and offers
                  </p>
                </div>
                <div className="col-sm-6">
                  <p className="mb-0 flex">
                    <FaArrowRight className="mx-2" />
                    Upgrade membership
                  </p>
                </div>
              </div>
              {/* <a className="btn btn-primary py-3 px-5 mt-2" href="">
                Read More
              </a> */}
            </div>
            
          </div>
        </div>
      </div>

      <div className="container-xxl py-5 destination">
        <div className="container">
          <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
            <h6 className=" text-2xl text-center text-primary px-3">
              Discount
            </h6>
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
                      src={hotel1}
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
                      src={hotel2}
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
                      src={hotel3}
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
                <Image src={hotel4} alt="tay do" width="500" height="415" />
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

      <div className="container-xxl py-5 destination">
        <div className="container">
          <div className="text-center wow fadeInUp" data-wow-delay="0.1s">
            <h6 className=" text-2xl text-center text-primary px-3">
              Hotel
            </h6>
            <h1 className="mb-5">Popular Hotel!</h1>
          </div>
          <div className="row g-4">
            {popularHotels.map((hotel, index) => {
              return <HotelCard hotel={hotel} key={index} />;
            })}
          </div>
        </div>
      </div>
    </>
  );
};
