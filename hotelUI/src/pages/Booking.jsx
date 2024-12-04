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
  const idBooking = localStorage.getItem("idBooking");
  useEffect(() => {
    localStorage.setItem("idBooking", id);
    if (id) {
      const data = rooms.find((room) => room.id == id);
      setRoomBooking(data);
    
    } else {
      const data = rooms.find((room) => room.id == idBooking);
      setRoomBooking(data);
    }
  }, [id]);

  console.log(roomBooking);

  return (
    <div className="container-xxl py-5">
      <div className="container">
        
        <div className="text-center pb-4 wow fadeInUp" data-wow-delay="0.1s">
          <div className="flex items-center justify-center">
            <h6 className=" text-2xl text-center text-primary px-3">
              Process
            </h6>
          </div>

          <h1 className="mb-5">3 Easy Steps</h1>
        </div>
        <div className="row gy-5 gx-4 justify-content-center">
          <div
            className="col-lg-4 col-sm-6 text-center pt-4 wow fadeInUp"
            data-wow-delay="0.1s"
          >
            <div className="position-relative border border-primary pt-5 pb-4 px-4">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle position-absolute top-0 start-50 translate-middle shadow"
                style={{ width: "100px", height: "100px" }}
              >
                <FaMapLocationDot size={50} color="white" />
              </div>
              <h5 className="mt-4">Choose A Destination</h5>
              <hr className="w-25 mx-auto bg-primary mb-1" />
              <hr className="w-50 mx-auto bg-primary mt-0" />
              <p className="mb-0">
                Explore a rich and diverse list of destinations everywhere.
                Choose a destination that suits your needs and preferences.
              </p>
            </div>
          </div>
          <div
            className="col-lg-4 col-sm-6 text-center pt-4 wow fadeInUp"
            data-wow-delay="0.3s"
          >
            <div className="position-relative border border-primary pt-5 pb-4 px-4">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle position-absolute top-0 start-50 translate-middle shadow"
                style={{ width: "100px", height: "100px" }}
              >
                <GiPayMoney size={50} color="white" />
              </div>
              <h5 className="mt-4">Pay Online</h5>
              <hr className="w-25 mx-auto bg-primary mb-1" />
              <hr className="w-50 mx-auto bg-primary mt-0" />
              <p className="mb-0">
                Pay quickly and securely with trusted online payment methods.
                Save time and effort with a convenient payment process.
              </p>
            </div>
          </div>
          <div
            className="col-lg-4 col-sm-6 text-center pt-4 wow fadeInUp"
            data-wow-delay="0.5s"
          >
            <div className="position-relative border border-primary pt-5 pb-4 px-4">
              <div
                className="d-inline-flex align-items-center justify-content-center bg-primary rounded-circle position-absolute top-0 start-50 translate-middle shadow"
                style={{ width: "100px", height: "100px" }}
              >
                <MdOutlineFlightTakeoff size={50} color="white" />
              </div>
              <h5 className="mt-4">Fly Today</h5>
              <hr className="w-25 mx-auto bg-primary mb-1" />
              <hr className="w-50 mx-auto bg-primary mt-0" />
              <p className="mb-0">
                Prepare for your trip and fly today. Ready to enjoy new and
                unforgettable experiences everywhere.
              </p>
            </div>
          </div>
        </div>
        {roomBooking && (
          <>
            <BookingItem item={roomBooking} />
          </>
        )}
      </div>
    </div>
  );
};
