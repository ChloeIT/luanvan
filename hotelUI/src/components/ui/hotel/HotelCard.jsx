import { Image } from "antd";
import React from "react";
import { CiLocationOn } from "react-icons/ci";
import { FaPhoneAlt } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
import { IoLocation } from "react-icons/io5";
import { PiPhoneCallLight } from "react-icons/pi";
import { TiStarOutline } from "react-icons/ti";
import { Link } from "react-router-dom";
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

export const HotelCard = ({ hotel }) => {
  return (
    hotel && (
      <div className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
        <div className="team-item hotel-card">
          <div className="image-box">
            <Image
              className="hotel-image"
              style={{ width: '100%', height: '100%' }}        // kích thước cho wrapper
              imgStyle={{                           // kích thước cho <img> bên trong
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                borderRadius: 12
              }}

              // src={`/images/hotels/${hotel.image}`}
              src={`${IMAGE_URL}/hotels/${hotel.image}`}
              alt=""
            />
          </div>
          <Link to={`/hotel/${hotel.id}`}>
            <div className="position-relative d-flex justify-content-center mt-4">
              <div className="btn btn-primary rounded-pill py-10 px-15 group">
                <div className="d-flex justify-content-center mt-2">
                  <FaStar className="text-yellow-300 group-hover:text-white" />
                  <p className="ml-1 text-yellow-300 group-hover:text-white">
                    {hotel.rating}
                  </p>
                </div>
              </div>
            </div>

            <div className="hotel-card-body">
              <h5 className=" hotel-name primarycolor mb-0">{hotel.name}</h5>

              <div className="hotel-address">
                <IoLocation size={16} className="me-2 flex-shrink-0" />
                <span className="text">{hotel.address}</span>
              </div>

              <div className="hotel-phone">
                <FaPhoneAlt size={16} className="me-2 flex-shrink-0" />
                <a className="text" href={`tel:${hotel.phone}`}>{hotel.phone}</a>
              </div>

            </div>


            <div
              className="add-to-compare absolute cursor-pointer"
              data-hotel-id="{{ $hotel->hotel_id }}"
              data-hotel-name="{{ $hotel->hotel_name }}"
              data-hotel-rating="{{ $hotel->rating}}"
              data-hotel-image="{{ $hotel->hotel_image }}"
            >
              {" "}
              <i className="fas fa-plus-circle"></i>
            </div>
          </Link>
        </div>
      </div>
    )
  );
};
