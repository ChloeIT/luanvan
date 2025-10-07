import React from "react";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelopeOpen } from "react-icons/fa";

export const Contact = () => {
  return (
    <div className="container-fluid  py-5">
      <div className="container">
        <div className="text-center">
          <div className="heading-line mx-auto" style={{ "--heading-gap": "14px" }}>
            <span className="divider" />
            <h6 className="heading-text text-2xl text-primary">We are here to help you!</h6>
            <span className="divider" />
          </div>
          <h1 className="mb-5">Contact us for support anytime, anywhere.</h1>
        </div>

        <div className="row g-4">
          {/* Get In Touch Section */}
          <div className="col-lg-4 col-md-6">
            <h5>Get In Touch</h5>
            <p className="mb-4">
              We're here to assist you every step of the way. Let's start a
              conversation and make your stay memorable.
            </p>

            <div className="d-flex align-items-center mb-4">
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0 bg-primary"
                style={{ width: "50px", height: "50px" }}
              >
                <FaMapMarkerAlt className="text-white" />
              </div>
              <div className="ms-3">
                <h5 className="text-primary">Office</h5>
                <p className="mb-0">999 Đại Lộ Hòa Bình - Cần Thơ - Việt Nam</p>
              </div>
            </div>

            <div className="d-flex align-items-center mb-4">
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0 bg-primary"
                style={{ width: "50px", height: "50px" }}
              >
                <FaPhoneAlt className="text-white" />
              </div>
              <div className="ms-3">
                <h5 className="text-primary">Mobile</h5>
                <p className="mb-0">0999 68 68 68</p>
              </div>
            </div>

            <div className="d-flex align-items-center">
              <div
                className="d-flex align-items-center justify-content-center flex-shrink-0 bg-primary"
                style={{ width: "50px", height: "50px" }}
              >
                <FaEnvelopeOpen className="text-white" />
              </div>
              <div className="ms-3">
                <h5 className="text-primary">Email</h5>
                <p className="mb-0">searchbookinghotel@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Google Map */}
          <div className="col-lg-4 col-md-6">
            <iframe
              className="position-relative rounded w-100 h-100"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1005499.6739559979!2d104.34902184495179!3d10.120919264908531!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a0629f927382cd%3A0x72a463d91109ec67!2zQ-G6p24gVGjGoSwgVmlldG5hbQ!5e0!3m2!1sen!2sbd!4v1712213751233!5m2!1sen!2sbd"
              frameBorder="0"
              style={{ minHeight: "300px", border: 0 }}
              allowFullScreen=""
              aria-hidden="false"
              tabIndex="0"
            ></iframe>
          </div>

          {/* Contact Form */}
          <div className="col-lg-4 col-md-12">
            <form>
              <div className="row g-3">
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
                <div className="col-12">
                  <div className="form-floating">
                    <textarea
                      className="form-control"
                      placeholder="Leave a message here"
                      id="message"
                      style={{ height: "100px" }}
                    ></textarea>
                    <label htmlFor="message">Message</label>
                  </div>
                </div>
                <div className="col-12">
                  <button className="btn btn-primary w-100 py-3" type="submit">
                    Send Message
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
