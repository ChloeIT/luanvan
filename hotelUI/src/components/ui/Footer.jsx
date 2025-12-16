// src/components/ui/Footer.jsx
import React, { useMemo, useState } from "react";
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
import { message } from "antd";
import { newsletterService } from "@/services/newsletter";

import { ga1, ga2, ga3, ga4, ga5, ga6 } from "../../assets";

const gas = [ga1, ga2, ga3, ga4, ga5, ga6];

/* ===================== Title (bold + hover) ===================== */
const FooterTitle = ({ children }) => {
  const [hover, setHover] = useState(false);

  const wrapStyle = useMemo(
    () => ({
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 8,
      cursor: "default",
      transform: hover ? "translateY(-1px)" : "translateY(0)",
      transition: "transform .2s ease",
    }),
    [hover]
  );

  const textStyle = useMemo(
    () => ({
      margin: 0,
      color: "#fff",
      fontWeight: 900,
      letterSpacing: "0.6px",
      textTransform: "uppercase",
      fontSize: 16,
      lineHeight: 1.2,
      textShadow: hover ? "0 8px 22px rgba(0,0,0,.35)" : "none",
      transition: "all .22s ease",
      opacity: hover ? 1 : 0.95,
    }),
    [hover]
  );

  const lineStyle = useMemo(
    () => ({
      height: 3,
      width: hover ? 54 : 34,
      borderRadius: 999,
      background: hover ? "#86B817" : "rgba(134,184,23,.55)",
      boxShadow: hover ? "0 6px 14px rgba(134,184,23,.35)" : "none",
      transition: "all .22s ease",
    }),
    [hover]
  );

  return (
    <div
      style={wrapStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <h4 style={textStyle}>{children}</h4>
      <span style={lineStyle} />
    </div>
  );
};

export const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleNewsletterSubmit = async () => {
    const email = newsletterEmail.trim();

    if (!email) {
      message.warning("Please enter your email.");
      return;
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      message.warning("Please enter a valid email address.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await newsletterService.subscribe(email);
      message.success(res?.data || "Subscribed successfully! Please check your email.");
      setNewsletterEmail("");
    } catch (err) {
      const msg =
        err?.response?.data ||
        err?.response?.data?.message ||
        "Subscription failed. Please try again.";
      message.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-dark text-light pt-4 mt-5 footer-root">
      <div className="container pb-3">
        <div className="row gy-4">
          {/* ===== SB Hotel ===== */}
          <div className="col-lg-3 col-md-6">
            <div className="mb-3">
              <FooterTitle>SB Hotel</FooterTitle>
            </div>

            <p className="small mb-3">
              A cozy place to stay, explore Cần Thơ and enjoy your memorable trip with us.
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
            <div className="mb-3">
              <FooterTitle>Contact</FooterTitle>
            </div>

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

            <p className="small mb-2">Hotline (24/7) – feel free to reach out anytime.</p>

            <div className="d-flex gap-2 pt-1">
              {[FaFacebookF, FaTwitter, FaYoutube, FaLinkedinIn].map((Icon, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="btn btn-outline-light btn-sm rounded-circle d-flex align-items-center justify-content-center footer-social-btn"
                  style={{
                    transition: "transform .2s ease, box-shadow .2s ease, background .2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.background = "rgba(134,184,23,.16)";
                    e.currentTarget.style.boxShadow = "0 10px 18px rgba(0,0,0,.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <Icon />
                </button>
              ))}
            </div>
          </div>

          {/* ===== Gallery ===== */}
          <div className="col-lg-3 col-md-6">
            <div className="mb-3">
              <FooterTitle>Gallery</FooterTitle>
            </div>

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
                      transition: "transform .2s ease, box-shadow .2s ease, filter .2s ease",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                      e.currentTarget.style.boxShadow = "0 12px 22px rgba(0,0,0,.28)";
                      e.currentTarget.style.filter = "brightness(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0) scale(1)";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.filter = "none";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ===== Newsletter ===== */}
          <div className="col-lg-3 col-md-6">
            <div className="mb-3">
              <FooterTitle>Newsletter</FooterTitle>
            </div>

            <p className="small mb-3">
              Enjoy exclusive offers and get the latest promotions from SB Hotel.
            </p>

            <div className="position-relative mx-auto" style={{ maxWidth: 340 }}>
              <input
                type="email"
                className="form-control w-100"
                placeholder="Your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleNewsletterSubmit();
                }}
                style={{
                  padding: "8px 12px",
                  paddingRight: "95px",
                  height: "42px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  border: "1px solid #86B817",
                  transition: "box-shadow .2s ease, transform .2s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = "0 10px 20px rgba(134,184,23,.22)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              />

              <button
                type="button"
                onClick={handleNewsletterSubmit}
                disabled={submitting}
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
                  cursor: submitting ? "not-allowed" : "pointer",
                  boxShadow: "0 2px 6px rgba(134,184,23,0.35)",
                  transition: "0.25s ease",
                  opacity: submitting ? 0.7 : 1,
                }}
                onMouseOver={(e) => {
                  if (submitting) return;
                  e.currentTarget.style.backgroundColor = "#6ea10f";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(134,184,23,0.45)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#86B817";
                  e.currentTarget.style.boxShadow = "0 2px 6px rgba(134,184,23,0.35)";
                }}
              >
                {submitting ? "..." : "Sign Up"}
              </button>
            </div>

            <p className="small text-muted mt-2 mb-0">No spam – only useful travel tips.</p>
          </div>
        </div>

        <hr className="border-secondary mt-4 mb-3" />
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-muted pb-2 footer-bottom">
          <div className="mb-2 mb-md-0 text-center text-md-start">
            © <span className="fw-semibold text-light">SB Hotel</span> – All rights reserved.
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
