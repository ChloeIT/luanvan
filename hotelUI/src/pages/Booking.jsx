// src/pages/Booking.jsx
import React, { useEffect, useState } from "react";
import { FaMapLocationDot } from "react-icons/fa6";
import { GiPayMoney } from "react-icons/gi";
import { MdOutlineFlightTakeoff } from "react-icons/md";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { BookingItem } from "../components/ui/booking/BookingItem";

export const Booking = () => {
  const { id } = useParams();
  const [roomBooking, setRoomBooking] = useState();
  const { rooms } = useSelector((state) => state.room);

  useEffect(() => {
    const chosenId = id ?? localStorage.getItem("idBooking");
    if (id) localStorage.setItem("idBooking", id);
    if (!chosenId) return;
    const found = rooms.find((room) => String(room.id) === String(chosenId));
    setRoomBooking(found);
  }, [id, rooms]);

  // Style dùng lại cho cặp gạch – thu nhỏ giống Contact
  const pairStyle = {
    "--pair-gap": "3px",
    "--pair-mt": "10px",
    "--pair-mb": "10px",
  };

  return (
    <div className="container-xxl py-4">
      <div className="container">
        {/* ===== Heading ===== */}
        <div className="text-center pb-3">
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
              Process
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
            3 Easy Steps
          </h1>
        </div>

        {/* ===== 3 ô – equal-height (compact) ===== */}
        <div className="row gy-4 gx-3 justify-content-center align-items-stretch">
          {/* Box 1 */}
          <div
            className="col-lg-4 col-sm-6 text-center pt-3 d-flex"
            data-wow-delay="0.1s"
          >
            <div className="position-relative border border-primary pt-5 pb-3 px-3 w-100 h-100 d-flex flex-column">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle position-absolute top-0 start-50 translate-middle shadow"
                style={{ width: "80px", height: "80px" }}
              >
                <FaMapLocationDot size={40} color="white" />
              </div>

              <h5 className="mt-3 mb-1" style={{ fontSize: "18px" }}>
                Choose A Destination
              </h5>
              <div className="divider-pair" style={pairStyle}>
                <span
                  className="divider divider--muted"
                  style={{ "--w": "25%", "--h": "2px" }}
                />
                <span
                  className="divider divider--muted"
                  style={{ "--w": "50%", "--h": "2px" }}
                />
              </div>

              <p className="mb-0 small">
                Explore a rich and diverse list of destinations everywhere.
                Choose a destination that suits your needs and preferences.
              </p>
            </div>
          </div>

          {/* Box 2 */}
          <div
            className="col-lg-4 col-sm-6 text-center pt-3 d-flex"
            data-wow-delay="0.3s"
          >
            <div className="position-relative border border-primary pt-5 pb-3 px-3 w-100 h-100 d-flex flex-column">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle position-absolute top-0 start-50 translate-middle shadow"
                style={{ width: "80px", height: "80px" }}
              >
                <GiPayMoney size={40} color="white" />
              </div>

              <h5 className="mt-3 mb-1" style={{ fontSize: "18px" }}>
                Pay Online
              </h5>
              <div className="divider-pair" style={pairStyle}>
                <span
                  className="divider divider--muted"
                  style={{ "--w": "25%", "--h": "2px" }}
                />
                <span
                  className="divider divider--muted"
                  style={{ "--w": "50%", "--h": "2px" }}
                />
              </div>

              <p className="mb-0 small">
                Pay quickly and securely with trusted online payment methods.
                Save time and effort with a convenient payment process.
              </p>
            </div>
          </div>

          {/* Box 3 */}
          <div
            className="col-lg-4 col-sm-6 text-center pt-3 d-flex"
            data-wow-delay="0.5s"
          >
            <div className="position-relative border border-primary pt-5 pb-3 px-3 w-100 h-100 d-flex flex-column">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle position-absolute top-0 start-50 translate-middle shadow"
                style={{ width: "80px", height: "80px" }}
              >
                <MdOutlineFlightTakeoff size={40} color="white" />
              </div>

              <h5 className="mt-3 mb-1" style={{ fontSize: "18px" }}>
                Fly Today
              </h5>
              <div className="divider-pair" style={pairStyle}>
                <span
                  className="divider divider--muted"
                  style={{ "--w": "25%", "--h": "2px" }}
                />
                <span
                  className="divider divider--muted"
                  style={{ "--w": "50%", "--h": "2px" }}
                />
              </div>

              <p className="mb-0 small">
                Prepare for your trip and fly today. Ready to enjoy new and
                unforgettable experiences everywhere.
              </p>
            </div>
          </div>
        </div>

        {roomBooking && (
          <div style={{ marginTop: "48px" }}>
            <BookingItem item={roomBooking} />
          </div>
        )}
      </div>
    </div>
  );
};
