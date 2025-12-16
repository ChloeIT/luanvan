// src/pages/Contact.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  FaEnvelopeOpen,
  FaFacebookF,
  FaInstagram,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";
import { contactServices } from "../services/contact";

// Các topic dùng ở cả Contact page & AdContact
const CONTACT_TOPICS = [
  { value: "BOOKING", label: "Booking & Reservation" },
  { value: "PAYMENT", label: "Payment & Refund" },
  { value: "LOYALTY", label: "Loyalty Points" },
  { value: "SUPPORT", label: "Technical Support" },
  { value: "OTHER", label: "Other" },
];

export const Contact = () => {
  const { user } = useSelector((s) => s.auth || {});

  const [form, setForm] = useState({
    name: user?.username || "",
    email: user?.email || "",
    subject: "",
    topic: "",
    message: "",
  });

  const [alert, setAlert] = useState("");
  const [alertType, setAlertType] = useState("info"); // success | danger | info
  const [loading, setLoading] = useState(false);

  // Auto-update name/email khi user login sau
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: user?.username || "",
      email: user?.email || "",
    }));
  }, [user]);

  const emailRegex = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    []
  );

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const validate = () => {
    const name = (form.name || "").trim();
    const email = (form.email || "").trim();
    const message = (form.message || "").trim();
    const topic = (form.topic || "").trim();

    if (!name || !email || !message || !topic) {
      return "Please fill all required fields.";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }
    if (message.length < 10) {
      return "Your message is too short. Please provide more details (at least 10 characters).";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const err = validate();
    if (err) {
      setAlertType("danger");
      setAlert(err);
      return;
    }

    try {
      setLoading(true);
      setAlert("");

      await contactServices.create({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        topic: form.topic,
        message: form.message.trim(),
      });

      setAlertType("success");
      setAlert("Your message has been sent! We will respond within 24 hours.");

      // Reset nội dung nhưng giữ name + email
      setForm((prev) => ({
        ...prev,
        subject: "",
        topic: "",
        message: "",
      }));
    } catch (err2) {
      console.error("Send contact failed:", err2);
      setAlertType("danger");
      setAlert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Style custom cho banner thông báo
  const buildAlertStyle = () => {
    if (!alert) return {};
    const base = {
      padding: "8px 12px",
      borderRadius: "10px",
      fontSize: "0.9rem",
      marginBottom: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "8px",
    };

    if (alertType === "success") {
      return {
        ...base,
        backgroundColor: "rgba(22,163,74,0.10)",
        color: "#166534",
        border: "1px solid rgba(22,163,74,0.35)",
      };
    }
    if (alertType === "danger") {
      return {
        ...base,
        backgroundColor: "rgba(220,38,38,0.06)",
        color: "#b91c1c",
        border: "1px solid rgba(220,38,38,0.35)",
      };
    }
    return {
      ...base,
      backgroundColor: "rgba(37,99,235,0.08)",
      color: "#1d4ed8",
      border: "1px solid rgba(37,99,235,0.35)",
    };
  };

  // Inline “title styles” (không thêm CSS)
  const sectionTitleStyle = {
    fontSize: 20,
    fontWeight: 900,
    letterSpacing: "0.02em",
    marginBottom: 6,
  };

  const subTitleStyle = {
    fontSize: 16,
    fontWeight: 800,
    marginBottom: 6,
  };

  return (
    <div className="container-fluid py-4">
      <div className="container">
        {/* ===== Heading ===== */}
        <div className="text-center mb-3">
          <div className="sb-heading sb-heading--md mx-auto">
            <span className="sb-heading__lines sb-heading__lines--left">
              <span className="sb-heading__line sb-heading__line--long" />
              <span className="sb-heading__line sb-heading__line--short" />
            </span>

            <h6
              className="sb-heading__label"
              style={{
                fontSize: "26px",
                fontWeight: 900,
                letterSpacing: "0.18em",
              }}
            >
              CONTACT
            </h6>

            <span className="sb-heading__lines sb-heading__lines--right">
              <span className="sb-heading__line sb-heading__line--long" />
              <span className="sb-heading__line sb-heading__line--short" />
            </span>
          </div>

          <h1 className="mb-2" style={{ fontSize: "28px" }}>
            Contact us for support anytime, anywhere.
          </h1>

          <p className="small text-muted mb-0">
            Tell us what you need and we’ll get back to you as soon as possible.
          </p>

          {user && (
            <p className="small mt-2 mb-0">
              We will respond to your email:&nbsp;
              <span
                style={{
                  background: "rgba(134,184,23,0.15)",
                  padding: "2px 8px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  color: "var(--primary)",
                }}
              >
                {user.email}
              </span>
            </p>
          )}
        </div>

        {/* 🔔 Banner thông báo */}
        {alert && (
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8">
              <div style={buildAlertStyle()}>
                <span>{alert}</span>
                <button
                  type="button"
                  onClick={() => setAlert("")}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "1rem",
                    lineHeight: 1,
                  }}
                  aria-label="Close notification"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3 columns */}
        <div className="row g-3 align-items-stretch mt-2">
          {/* Left info */}
          <div className="col-lg-4 col-md-6 d-flex">
            <div className="d-flex flex-column h-100 w-100">
              <h5 className="mb-2" style={sectionTitleStyle}>
                Get In Touch
              </h5>

              <p className="mb-3 small text-muted">
                We're here to assist you every step of the way. Let’s start a
                conversation and make your stay memorable.
              </p>

              {/* Office */}
              <div className="d-flex align-items-center mb-3">
                <div
                  className="d-flex align-items-center justify-content-center flex-shrink-0 bg-primary"
                  style={{ width: 40, height: 40 }}
                >
                  <FaMapMarkerAlt className="text-white" />
                </div>
                <div className="ms-3">
                  <h6 className="text-primary mb-1" style={{ fontWeight: 800 }}>
                    Office
                  </h6>
                  <p className="mb-0 small">999 Đại Lộ Hòa Bình - Cần Thơ - Việt Nam</p>
                </div>
              </div>

              {/* Mobile */}
              <div className="d-flex align-items-center mb-3">
                <div
                  className="d-flex align-items-center justify-content-center flex-shrink-0 bg-primary"
                  style={{ width: 40, height: 40 }}
                >
                  <FaPhoneAlt className="text-white" />
                </div>
                <div className="ms-3">
                  <h6 className="text-primary mb-1" style={{ fontWeight: 800 }}>
                    Mobile
                  </h6>
                  <p className="mb-0 small">0999 68 68 68</p>
                </div>
              </div>

              {/* Email */}
              <div className="d-flex align-items-center mb-2">
                <div
                  className="d-flex align-items-center justify-content-center flex-shrink-0 bg-primary"
                  style={{ width: 40, height: 40 }}
                >
                  <FaEnvelopeOpen className="text-white" />
                </div>
                <div className="ms-3">
                  <h6 className="text-primary mb-1" style={{ fontWeight: 800 }}>
                    Email
                  </h6>
                  <p className="mb-0 small">searchbookinghotel@gmail.com</p>
                </div>
              </div>

              <hr className="my-3" />

              <h6 className="mb-1" style={subTitleStyle}>
                Opening Hours
              </h6>

              <ul className="list-unstyled mb-2 small">
                <li>Mon – Fri: 08:00 – 21:00</li>
                <li>Sat – Sun: 09:00 – 20:00</li>
              </ul>

              <p className="text-muted small mb-3">
                <strong>Response time:</strong> within 24 hours via email, instant via phone.
              </p>

              {/* social */}
              <div className="mt-auto">
                <h6 className="mb-2" style={subTitleStyle}>
                  Connect with us
                </h6>

                <div className="d-flex gap-3 mb-3">
                  <FaFacebookF size={20} className="text-primary" style={{ cursor: "pointer" }} />
                  <FaInstagram size={20} className="text-danger" style={{ cursor: "pointer" }} />
                </div>

                <p className="fw-semibold text-primary mb-0">
                  Hotline (24/7): 0999 68 68 68
                </p>
              </div>
            </div>
          </div>

          {/* Google map */}
          <div className="col-lg-4 col-md-6 d-flex">
            <iframe
              title="map"
              className="flex-fill w-100 rounded border-0"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1005499.6739559979!2d104.34902184495179!3d10.120919264908531!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0629f927382cd%3A0x72a463d91109ec67!2zQ-G6p24gVGjGoSwgVmlldG5hbQ!5e0!3m2!1sen!2sbd!4v1712213751233!5m2!1sen!2sbd"
              style={{ minHeight: 260 }}
              loading="lazy"
              allowFullScreen=""
            />
          </div>

          {/* Contact form */}
          <div className="col-lg-4 col-md-12 d-flex">
            <form className="d-flex flex-column h-100 w-100" onSubmit={handleSubmit} noValidate>
              <div className="row g-2 flex-grow-1">
                {/* Name */}
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="text"
                      id="name"
                      className="form-control"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                      disabled={loading}
                    />
                    <label htmlFor="name">Your Name *</label>
                  </div>
                </div>

                {/* Email */}
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="email"
                      id="email"
                      className="form-control"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Your Email"
                      disabled={loading}
                    />
                    <label htmlFor="email">Your Email *</label>
                  </div>
                </div>

                {/* Topic */}
                <div className="col-12">
                  <div className="form-floating">
                    <select
                      id="topic"
                      className="form-select"
                      value={form.topic}
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <option value="" disabled>
                        Select a topic
                      </option>
                      {CONTACT_TOPICS.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="topic">Topic *</label>
                  </div>
                </div>

                {/* Subject */}
                <div className="col-12">
                  <div className="form-floating">
                    <input
                      type="text"
                      id="subject"
                      className="form-control"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="Subject"
                      disabled={loading}
                    />
                    <label htmlFor="subject">Subject</label>
                  </div>
                </div>

                {/* Message */}
                <div className="col-12 d-flex flex-column flex-grow-1">
                  <div className="form-floating h-100">
                    <textarea
                      id="message"
                      className="form-control h-100"
                      style={{ minHeight: 140 }}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Your Message"
                      disabled={loading}
                    />
                    <label htmlFor="message">Message *</label>
                  </div>
                </div>
              </div>

              <button className="btn btn-primary w-100 py-2 mt-3" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>

        {/* Help block */}
        <div className="row mt-4">
          <div className="col-md-8 mx-auto text-center">
            <p className="mb-2 fw-semibold">Need help with an existing booking?</p>
            <p className="small text-muted mb-3">
              Check your booking details or read our guide if you want to change dates,
              update guest information, or request special services.
            </p>
            <div className="d-flex justify-content-center gap-2">
              <Link to="/my-bookings" className="btn btn-outline-primary btn-sm">
                View my bookings
              </Link>

              {/* ✅ đổi sang Link /faq */}
              <Link to="/faq" className="btn btn-link btn-sm text-decoration-underline">
                FAQ &amp; Support Guide
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
