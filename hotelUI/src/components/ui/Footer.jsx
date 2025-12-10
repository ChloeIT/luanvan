// src/components/ui/Footer.jsx
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
import { IoMdArrowDropright } from "react-icons/io";
import { NavLink } from "react-router-dom";

import { ga1, ga2, ga3, ga4, ga5, ga6 } from "../../assets";

const gas = [ga1, ga2, ga3, ga4, ga5, ga6];

export const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-4 mt-5 footer-root">
      <div className="container pb-3">
        <div className="row gy-4">
          {/* ===== SB Hotel ===== */}
          <div className="col-lg-3 col-md-6">
            <h4 className="text-white mb-3">SB Hotel</h4>
            <p className="small mb-3">
              A cozy place to stay, explore Cần Thơ and enjoy your memorable
              trip with us.
            </p>

            <nav className="d-flex flex-column gap-1 small">
              {[
                { to: "/", label: "Home" },
                { to: "/hotel", label: "Hotel" },
                { to: "/service", label: "Service" },
                { to: "/contact", label: "Contact" },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "d-flex align-items-center gap-1 footer-nav-link",
                      isActive ? "footer-nav-link-active" : "",
                    ].join(" ")
                  }
                >
                  <IoMdArrowDropright size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* ===== Contact ===== */}
          <div className="col-lg-3 col-md-6">
            <h4 className="text-white mb-3">Contact</h4>
            <p className="mb-2 small d-flex align-items-start">
              <FaMapMarkerAlt className="me-2 mt-1" />
              <span>999 Đại Lộ Hòa Bình - Cần Thơ - Việt Nam</span>
            </p>
            <p className="mb-2 small d-flex align-items-center">
              <FaPhoneAlt className="me-2" />
              <span>0999 68 68 68</span>
            </p>
            <p className="mb-3 small d-flex align-items-center">
              <FaEnvelope className="me-2" />
              <span>searchbookinghotel@gmail.com</span>
            </p>

            <p className="small mb-2">
              Hotline (24/7) – feel free to reach out anytime.
            </p>

            <div className="d-flex gap-2 pt-1">
              {[FaFacebookF, FaTwitter, FaYoutube, FaLinkedinIn].map(
                (Icon, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center footer-social-btn"
                  >
                    <Icon />
                  </button>
                )
              )}
            </div>
          </div>

          {/* ===== Gallery ===== */}
          <div className="col-lg-3 col-md-6">
            <h4 className="text-white mb-3">Gallery</h4>
            <div className="row g-2 pt-1">
              {gas.map((ga, index) => (
                <div className="col-4" key={index}>
                  <img
                    src={ga}
                    alt={`Gallery ${index + 1}`}
                    className="w-100"
                    style={{
                      height: 70,
                      objectFit: "cover",
                      borderRadius: 12,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ===== Newsletter ===== */}
          <div className="col-lg-3 col-md-6">
            <h4 className="text-white mb-3">Newsletter</h4>
            <p className="small mb-3">
              Enjoy exclusive offers and get the latest promotions from SB
              Hotel.
            </p>

            <div
              className="position-relative mx-auto"
              style={{ maxWidth: 340 }}
            >
              {/* INPUT */}
              <input
                type="email"
                className="form-control w-100"
                placeholder="Your email"
                style={{
                  padding: "8px 12px",
                  paddingRight: "95px", // chừa chỗ cho nút
                  height: "42px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  border: "1px solid #86B817",
                }}
              />

              {/* BUTTON */}
              <button
                type="button"
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "6px",
                  transform: "translateY(-50%)",
                  backgroundColor: "#86B817",
                  color: "white",
                  border: "none",
                  padding: "6px 14px",
                  fontSize: "13px",
                  borderRadius: "999px",
                  lineHeight: 1,
                  minHeight: "26px",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(134,184,23,0.35)",
                  transition: "0.25s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#6ea10f";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(134,184,23,0.45)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#86B817";
                  e.currentTarget.style.boxShadow =
                    "0 2px 6px rgba(134,184,23,0.35)";
                }}
              >
                Sign Up
              </button>
            </div>

            <p className="small text-muted mt-2 mb-0">
              No spam – only useful travel tips.
            </p>
          </div>
        </div>

        {/* ===== Bottom line ===== */}
        <hr className="border-secondary mt-4 mb-3" />
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-muted pb-2 footer-bottom">
          <div className="mb-2 mb-md-0 text-center text-md-start">
            ©{" "}
            <span className="fw-semibold text-light">SB Hotel</span> – All
            rights reserved.
          </div>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <NavLink to="/" className="footer-bottom-link">
              Home
            </NavLink>
            <a href="#" className="footer-bottom-link">
              Cookies
            </a>
            <a href="#" className="footer-bottom-link">
              Help
            </a>
            <a href="#" className="footer-bottom-link">
              FAQs
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
