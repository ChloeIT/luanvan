import React from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelopeOpen } from "react-icons/fa";

export const Contact = () => {
  return (
    <div className="container-fluid py-4">
      <div className="container">
        {/* ===== Heading ===== */}
        <div className="text-center">
          <div
            className="heading-line mx-auto"
            style={{ "--heading-gap": "10px" }}
          >
            {/* 2 gạch bên trái – căn lề phải */}
            <span
              style={{
                display: "grid",
                justifyItems: "end",
                gap: "4px",
                marginRight: "2px",
              }}
            >
              <span className="divider" style={{ "--w": "100px" }} />
              <span
                className="divider"
                style={{ "--w": "50px", "--alpha": 0.45 }}
              />
            </span>

            <h6
              className="heading-text text-primary text-uppercase"
              style={{ fontSize: "18px" }}
            >
              We are here to help you!
            </h6>

            {/* 2 gạch bên phải */}
            <span
              style={{
                display: "grid",
                justifyItems: "start",
                gap: "4px",
                marginLeft: "2px",
              }}
            >
              <span className="divider" style={{ "--w": "100px" }} />
              <span
                className="divider"
                style={{ "--w": "50px", "--alpha": 0.45 }}
              />
            </span>
          </div>

          <h1 className="mb-4" style={{ fontSize: "28px" }}>
            Contact us for support anytime, anywhere.
          </h1>
        </div>

        {/* ===== 3 Cột: cao bằng nhau ===== */}
        <div className="row g-3 align-items-stretch">
          {/* Get In Touch */}
          <div className="col-lg-4 col-md-6 d-flex">
            <div className="d-flex flex-column h-100 w-100">
              <h5 className="mb-2">Get In Touch</h5>
              <p className="mb-3 small">
                We're here to assist you every step of the way. Let's start a
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
                  <h6 className="text-primary mb-1">Office</h6>
                  <p className="mb-0 small">
                    999 Đại Lộ Hòa Bình - Cần Thơ - Việt Nam
                  </p>
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
                  <h6 className="text-primary mb-1">Mobile</h6>
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
                  <h6 className="text-primary mb-1">Email</h6>
                  <p className="mb-0 small">searchbookinghotel@gmail.com</p>
                </div>
              </div>

              {/* Opening hours */}
              <hr className="my-3" />

              <h6 className="mb-1">Opening Hours</h6>
              <ul className="list-unstyled mb-2 small">
                <li>Mon – Fri: 08:00 – 21:00</li>
                <li>Sat – Sun: 09:00 – 20:00</li>
              </ul>

              <p className="text-muted small mb-0">
                <strong>Response time:</strong> within 24 hours via email, instant via
                phone.
              </p>
            </div>
          </div>

          {/* Google Map */}
          <div className="col-lg-4 col-md-6 d-flex">
            <div className="d-flex flex-column h-100 w-100">
              <iframe
                title="map"
                className="flex-fill w-100 rounded border-0"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1005499.6739559979!2d104.34902184495179!3d10.120919264908531!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0629f927382cd%3A0x72a463d91109ec67!2zQ-G6p24gVGjGoSwgVmlldG5hbQ!5e0!3m2!1sen!2sbd!4v1712213751233!5m2!1sen!2sbd"
                style={{ minHeight: 260, height: "100%" }}
                loading="lazy"
                allowFullScreen=""
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="col-lg-4 col-md-12 d-flex">
            <div className="d-flex flex-column h-100 w-100">
              <form className="d-flex flex-column flex-fill" noValidate>
                {/* Khối input co giãn để textarea lấp đầy phần còn lại */}
                <div className="row g-2 flex-grow-1">
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        placeholder="Your Name"
                      />
                      <label htmlFor="name">Your Name</label>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="Your Email"
                      />
                      <label htmlFor="email">Your Email</label>
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="form-floating">
                      <input
                        type="text"
                        className="form-control"
                        id="subject"
                        placeholder="Subject"
                      />
                      <label htmlFor="subject">Subject</label>
                    </div>
                  </div>

                  {/* Textarea chiếm toàn bộ phần còn lại */}
                  <div className="col-12 d-flex flex-column flex-grow-1">
                    <div className="form-floating flex-grow-1">
                      <textarea
                        className="form-control h-100"
                        id="message"
                        placeholder="Leave a message here"
                        style={{ minHeight: 140 }}
                      />
                      <label htmlFor="message">Message</label>
                    </div>
                  </div>
                </div>

                {/* Nút nằm sát đáy */}
                <button
                  className="btn btn-primary w-100 py-2 mt-3"
                  type="submit"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
        {/* /row */}
      </div>
    </div>
  );
};
