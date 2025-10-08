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

  // Style dùng lại cho cặp gạch: đổi số ở đây cho nhanh
  const pairStyle = {
    "--pair-gap": "4px",   // khoảng cách giữa 2 gạch (gần nhau)
    "--pair-mt": "14px",   // cách tiêu đề phía trên
    "--pair-mb": "14px",   // cách đoạn mô tả phía dưới
  };
  return (
    <div className="container-xxl py-5">
      <div className="container">

        {/* Title + 4 gạch hai bên */}
        <div className="text-center pb-4 wow fadeInUp" data-wow-delay="0.1s">
          <div className="heading-line mx-auto" style={{ "--heading-gap": "14px" }}>
            {/* 2 gạch bên trái – căn lề phải */}
            <span
              style={{
                display: "grid",
                justifyItems: "end", // 👈 gạch thẳng hàng mép phải chữ
                gap: "6px",
                marginRight: "2px", // tạo khoảng cách nhỏ giữa chữ và gạch
              }}
            >
              <span className="divider" style={{ "--w": "120px" }} />
              <span className="divider" style={{ "--w": "60px", "--alpha": .45 }} />
            </span>

            <h6 className="heading-text text-3xl text-primary">Process</h6>

            {/* 2 gạch bên phải */}
            <span
              style={{
                display: "grid",
                justifyItems: "start", // 👈 gạch bắt đầu từ mép trái chữ
                gap: "6px",
                marginLeft: "2px", // tạo khoảng cách nhỏ giữa chữ và gạch
              }}
            >
              <span className="divider" style={{ "--w": "120px" }} />
              <span className="divider" style={{ "--w": "60px", "--alpha": .45 }} />
            </span>
          </div>
          <h1 className="mb-5">3 Easy Steps</h1>
        </div>


        {/* 3 ô – equal-height */}
        <div className="row gy-5 gx-4 justify-content-center align-items-stretch">

          {/* Box 1 */}
          <div className="col-lg-4 col-sm-6 text-center pt-4 wow fadeInUp d-flex" data-wow-delay="0.1s">
            <div className="position-relative border border-primary pt-5 pb-4 px-4 w-100 h-100 d-flex flex-column">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle position-absolute top-0 start-50 translate-middle shadow"
                style={{ width: "100px", height: "100px" }}
              >
                <FaMapLocationDot size={50} color="white" />
              </div>

              <h5 className="mt-4 mb-0">Choose A Destination</h5>
              <div className="divider-pair" style={pairStyle}>
                <span className="divider divider--muted" style={{ "--w": "25%", "--h": "2px" }} />
                <span className="divider divider--muted" style={{ "--w": "50%", "--h": "2px" }} />
              </div>

              <p className="mb-0">
                Explore a rich and diverse list of destinations everywhere. Choose a destination that suits your needs and preferences.
              </p>
            </div>
          </div>

          {/* Box 2 */}
          <div className="col-lg-4 col-sm-6 text-center pt-4 wow fadeInUp d-flex" data-wow-delay="0.3s">
            <div className="position-relative border border-primary pt-5 pb-4 px-4 w-100 h-100 d-flex flex-column">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle position-absolute top-0 start-50 translate-middle shadow"
                style={{ width: "100px", height: "100px" }}
              >
                <GiPayMoney size={50} color="white" />
              </div>

              <h5 className="mt-4 mb-0">Pay Online</h5>
              <div className="divider-pair" style={pairStyle}>
                <span className="divider divider--muted" style={{ "--w": "25%", "--h": "2px" }} />
                <span className="divider divider--muted" style={{ "--w": "50%", "--h": "2px" }} />
              </div>

              <p className="mb-0">
                Pay quickly and securely with trusted online payment methods. Save time and effort with a convenient payment process.
              </p>
            </div>
          </div>

          {/* Box 3 */}
          <div className="col-lg-4 col-sm-6 text-center pt-4 wow fadeInUp d-flex" data-wow-delay="0.5s">
            <div className="position-relative border border-primary pt-5 pb-4 px-4 w-100 h-100 d-flex flex-column">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle position-absolute top-0 start-50 translate-middle shadow"
                style={{ width: "100px", height: "100px" }}
              >
                <MdOutlineFlightTakeoff size={50} color="white" />
              </div>

              <h5 className="mt-4 mb-0">Fly Today</h5>
              <div className="divider-pair" style={pairStyle}>
                <span className="divider divider--muted" style={{ "--w": "25%", "--h": "2px" }} />
                <span className="divider divider--muted" style={{ "--w": "50%", "--h": "2px" }} />
              </div>

              <p className="mb-0">
                Prepare for your trip and fly today. Ready to enjoy new and unforgettable experiences everywhere.
              </p>
            </div>
          </div>
        </div>

        {roomBooking && <BookingItem item={roomBooking} />}
      </div>
    </div>
  );
};
