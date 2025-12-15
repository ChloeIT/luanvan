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

  return (
    <div className="container-xxl py-4">
      <div className="container">
        {/* ===== Heading ===== */}
        <div className="text-center">
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
              Process
            </h6>

            <span className="sb-heading__lines sb-heading__lines--right">
              <span className="sb-heading__line sb-heading__line--long" />
              <span className="sb-heading__line sb-heading__line--short" />
            </span>
          </div>

          <h1 className="mb-0" style={{ fontSize: "28px" }}>
            3 Easy Steps
          </h1>
        </div>

        {/* ✅ Đẩy 3 ô xuống để không đè heading */}
        <div
          className="row gy-4 gx-3 justify-content-center align-items-stretch"
          style={{ marginTop: 36 }} // bạn có thể chỉnh 28 / 32 / 36
        >
          {/* Step 1 */}
          <div className="col-lg-4 col-sm-6 d-flex">
            <div className="position-relative border border-primary pt-5 pb-4 px-3 w-100 text-center d-flex flex-column">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle position-absolute top-0 start-50 translate-middle shadow"
                style={{ width: 80, height: 80 }}
              >
                <FaMapLocationDot size={40} color="#fff" />
              </div>

              <h5 className="mt-3 mb-1">
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: 20,
                    letterSpacing: "0.4px",
                  }}
                >
                  Choose A Destination
                </span>
              </h5>

              {/* ✅ gạch xanh giống Service */}
              <div className="sb-pair">
                <span className="sb-pair__line sb-pair__line--top" />
                <span className="sb-pair__line sb-pair__line--bot" />
              </div>

              <p style={{ fontSize: "16px" }} className="mb-0">
                Explore a rich and diverse list of destinations everywhere.
                Choose a destination that suits your needs and preferences.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="col-lg-4 col-sm-6 d-flex">
            <div className="position-relative border border-primary pt-5 pb-4 px-3 w-100 text-center d-flex flex-column">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle position-absolute top-0 start-50 translate-middle shadow"
                style={{ width: 80, height: 80 }}
              >
                <GiPayMoney size={40} color="#fff" />
              </div>

              <h5 className="mt-3 mb-1">
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: 20,
                    letterSpacing: "0.4px",
                  }}
                >
                  Pay Online
                </span>
              </h5>

              {/* ✅ gạch xanh giống Service */}
              <div className="sb-pair">
                <span className="sb-pair__line sb-pair__line--top" />
                <span className="sb-pair__line sb-pair__line--bot" />
              </div>

              <p style={{ fontSize: "16px" }} className="mb-0">
                Pay quickly and securely with trusted online payment methods.
                Save time and effort with a convenient payment process.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="col-lg-4 col-sm-6 d-flex">
            <div className="position-relative border border-primary pt-5 pb-4 px-3 w-100 text-center d-flex flex-column">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle position-absolute top-0 start-50 translate-middle shadow"
                style={{ width: 80, height: 80 }}
              >
                <MdOutlineFlightTakeoff size={40} color="#fff" />
              </div>

              <h5 className="mt-3 mb-1">
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: 20,
                    letterSpacing: "0.4px",
                  }}
                >
                  Fly Today
                </span>
              </h5>

              {/* ✅ gạch xanh giống Service */}
              <div className="sb-pair">
                <span className="sb-pair__line sb-pair__line--top" />
                <span className="sb-pair__line sb-pair__line--bot" />
              </div>

              <p style={{ fontSize: "16px" }} className="mb-0">
                Prepare for your trip and fly today. Ready to enjoy new and
                unforgettable experiences everywhere.
              </p>
            </div>
          </div>
        </div>

        {/* ===== Booking Detail ===== */}
        {roomBooking && (
          <div className="mt-5">
            <BookingItem item={roomBooking} />
          </div>
        )}
      </div>
    </div>
  );
};
