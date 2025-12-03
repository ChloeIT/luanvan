// src/pages/PaymentSuccess.jsx
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { useSelector } from "react-redux";

export const PaymentSuccess = () => {
    const location = useLocation();

    // 1) bookingId từ navigate("/success", { state: { bookingId } })
    const bookingIdFromState = location.state?.bookingId;

    // 2) lastBookingId lưu trong localStorage
    const bookingIdFromStorage = localStorage.getItem("lastBookingId");

    // 3) booking mới nhất từ Redux
    const { bookings } = useSelector((s) => s.booking || {});
    const latestBookingId =
        Array.isArray(bookings) && bookings.length > 0
            ? bookings[bookings.length - 1].id
            : null;

    // Thứ tự ưu tiên: state → localStorage → Redux
    const bookingId = bookingIdFromState || bookingIdFromStorage || latestBookingId;

    // nếu state có bookingId mới -> update localStorage
    useEffect(() => {
        if (bookingIdFromState) {
            localStorage.setItem("lastBookingId", bookingIdFromState);
        }
    }, [bookingIdFromState]);

    // base style cho button
    const primaryBtnStyle = {
        backgroundColor: "var(--primary, #86B817)",
        borderColor: "var(--primary, #86B817)",
        fontWeight: 600,
        color: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,.1)",
        transition: "0.25s",
        textDecoration: "none",
        display: "inline-block",
    };

    const outlineBtnStyle = {
        fontWeight: 600,
        borderRadius: "12px",
        border: "2px solid #000",
        color: "#000",
        backgroundColor: "rgba(255,255,255,0.5)",
        transition: "0.25s",
        textDecoration: "none",
        display: "inline-block",
    };

    return (
        <div className="container-xxl py-5">
            <div className="container d-flex justify-content-center">
                <div className="w-100" style={{ maxWidth: 720 }}>
                    {/* Header nhỏ phía trên card */}
                    <div className="text-center mb-4">
                        <div
                            className="heading-line mx-auto"
                            style={{ "--heading-gap": "12px" }}
                        >
                            <span
                                style={{
                                    display: "grid",
                                    justifyItems: "end",
                                    gap: "4px",
                                    marginRight: "2px",
                                }}
                            >
                                <span className="divider" style={{ "--w": "90px" }} />
                                <span
                                    className="divider"
                                    style={{ "--w": "50px", "--alpha": 0.4 }}
                                />
                            </span>
                            <h6 className="heading-text text-primary text-uppercase">
                                Booking status
                            </h6>
                            <span
                                style={{
                                    display: "grid",
                                    justifyItems: "start",
                                    gap: "4px",
                                    marginLeft: "2px",
                                }}
                            >
                                <span className="divider" style={{ "--w": "90px" }} />
                                <span
                                    className="divider"
                                    style={{ "--w": "50px", "--alpha": 0.4 }}
                                />
                            </span>
                        </div>
                        <h2 className="mb-1" style={{ fontWeight: 800 }}>
                            Payment Successful
                        </h2>
                    </div>

                    {/* CARD chính */}
                    <div
                        className="rounded-4 px-4 px-md-5 py-4 py-md-5 mx-auto"
                        style={{
                            background: "var(--card-yellow, #FDFF7C)",
                            boxShadow:
                                "0 18px 40px rgba(0,0,0,.18), 0 4px 12px rgba(0,0,0,.08)",
                            border: "1px solid rgba(0,0,0,.06)",
                        }}
                    >
                        <div className="d-flex flex-column flex-md-row gap-4 align-items-center mb-4">
                            {/* Icon thành công */}
                            <div
                                className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                                style={{
                                    width: 96,
                                    height: 96,
                                    background: "rgba(76, 175, 80, 0.12)",
                                }}
                            >
                                <FaCheckCircle size={64} color="#28a745" />
                            </div>

                            {/* Text bên phải */}
                            <div className="text-center text-md-start">
                                <h3
                                    className="mb-2"
                                    style={{
                                        color: "var(--primary, #86B817)",
                                        fontWeight: 800,
                                        letterSpacing: ".5px",
                                    }}
                                >
                                    Thank you for your payment!
                                </h3>
                                <p className="mb-2">
                                    Your booking has been paid successfully. We&apos;ve sent a
                                    confirmation email with your booking details.
                                </p>

                                {/* Booking ID – pill đẹp hơn, canh giữa */}
                                {bookingId ? (
                                    <div className="mt-3 d-flex justify-content-center justify-content-md-start">
                                        <div
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: 8,
                                                padding: "6px 14px",
                                                borderRadius: 999,
                                                backgroundColor: "rgba(255,255,255,0.9)",
                                                boxShadow: "0 4px 10px rgba(0,0,0,.09)",
                                                border: "1px solid rgba(0,0,0,.05)",
                                                fontSize: "0.85rem",
                                                fontWeight: 500,
                                            }}
                                        >
                                            <span style={{ color: "#666" }}>Booking ID</span>
                                            <span
                                                style={{
                                                    height: 18,
                                                    width: 1,
                                                    backgroundColor: "rgba(0,0,0,0.08)",
                                                }}
                                            />
                                            <span
                                                style={{
                                                    fontWeight: 700,
                                                    letterSpacing: "0.03em",
                                                    color: "#e67e22",
                                                }}
                                            >
                                                #{bookingId}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="mb-0 text-muted">
                                        (We couldn&apos;t detect the booking ID, but your payment was
                                        successful.)
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-md-end gap-3 mt-3">
                            {/* View my bookings */}
                            <Link
                                to="/my-bookings"
                                className="px-4 py-2"
                                style={primaryBtnStyle}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.filter = "brightness(0.9)")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.filter = "none")
                                }
                            >
                                View my bookings
                            </Link>

                            {/* Back to home */}
                            <Link
                                to="/"
                                className="px-4 py-2"
                                style={outlineBtnStyle}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "#000";
                                    e.currentTarget.style.color = "#fff";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        "rgba(255,255,255,0.5)";
                                    e.currentTarget.style.color = "#000";
                                }}
                            >
                                Back to home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
