import React from "react";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaTwitter,
  FaFacebookF,
  FaYoutube,
  FaLinkedinIn,
} from "react-icons/fa";
import { ga1, ga2, ga3, ga4, ga5, ga6 } from "../../assets";
import { IoMdArrowDropright } from "react-icons/io";
import { NavLink } from "react-router-dom";

const gas = [ga1, ga2, ga3, ga4, ga5, ga6];

export const Footer = () => {
  return (
    <div className="container-fluid bg-dark text-light footer pt-5 mt-5">
      <div className="container py-5">
        <div className="row g-5">
          {/* About Section */}
          <div className="col-lg-3 col-md-6">
            <h4 className="text-white mb-3">SB Hotel</h4>
            <NavLink className="flex py-2" to="/">
              <IoMdArrowDropright size={25} /> Home
            </NavLink>
            <NavLink className="flex py-2" to="/contact">
              <IoMdArrowDropright size={25} /> Contact
            </NavLink>
            <NavLink className="flex py-2" to="/hotel">
              <IoMdArrowDropright size={25} /> Hotel
            </NavLink>
            <NavLink className="flex py-2" to="/service">
              <IoMdArrowDropright size={25} /> Service
            </NavLink>
          </div>

          {/* Contact Section */}
          <div className="col-lg-3 col-md-6">
            <h4 className="text-white mb-3">Contact</h4>
            <p className="mb-2 flex">
              <FaMapMarkerAlt className="me-3" />
              999 Đại Lộ Hòa Bình - Cần Thơ - Việt Nam
            </p>
            <p className="mb-2 flex">
              <FaPhoneAlt className="me-3" />
              0999 68 68 68
            </p>
            <p className="mb-2 flex">
              <FaEnvelope className="me-3" />
              searchbookinghotel@gmail.com
            </p>
            <div className="d-flex pt-2">
              <a className="btn btn-outline-light btn-social" href="#">
                <FaTwitter />
              </a>
              <a className="btn btn-outline-light btn-social" href="#">
                <FaFacebookF />
              </a>
              <a className="btn btn-outline-light btn-social" href="#">
                <FaYoutube />
              </a>
              <a className="btn btn-outline-light btn-social" href="#">
                <FaLinkedinIn />
              </a>
            </div>
          </div>

          {/* Gallery Section */}
          <div className="col-lg-3 col-md-6">
            <h4 className="text-white mb-3">Gallery</h4>
            <div className="row g-2 pt-2">
              {gas.map((ga, index) => (
                <div className="col-4" key={index}>
                  <img src={ga} alt={ga} className="h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="col-lg-3 col-md-6">
            <h4 className="text-white mb-3">Newsletter</h4>
            <p>Enjoy exclusive offers</p>
            <p>
              Sign up for the newsletter to receive the latest information about
              promotions from SB Hotel.
            </p>
            <div
              className="position-relative mx-auto"
              style={{ maxWidth: "400px" }}
            >
              <input
                className="form-control border-primary w-100 py-3 ps-4 pe-5"
                type="text"
                placeholder="Your email"
              />
              <button
                type="button"
                className="btn btn-primary py-2 position-absolute top-0 end-0 mt-2 me-2"
              >
                SignUp
              </button>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="row">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            &copy;{" "}
            <a className="border-bottom" href="#">
              SB Hotel
            </a>
            , All Rights Reserved.
          </div>
          <div className="col-md-6 text-center text-md-end">
            <div className="footer-menu">
              <a href="#">Home</a>
              <a href="#">Cookies</a>
              <a href="#">Help</a>
              <a href="#">FAQs</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
