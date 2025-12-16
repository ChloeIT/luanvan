// src/pages/PaymentSuccess.jsx
import React, { useEffect, useMemo } from "react";
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
    const latestBookingId = useMemo(() => {
        if (!Array.isArray(bookings) || bookings.length === 0) return null;
        return bookings[bookings.length - 1]?.id ?? null;
    }, [bookings]);

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
        fontWeight: 700,
        color: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,.1)",
        transition: "0.25s",
        textDecoration: "none",
        display: "inline-block",
    };

    const outlineBtnStyle = {
        fontWeight: 700,
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
                    {/* ====== HEADING (giống Service) ====== */}
                    <div className="text-center mb-4">
                        <div className="sb-heading sb-heading--md mx-auto">
                            {/* lines left */}
                            <span className="sb-heading__lines sb-heading__lines--left">
                                <span className="sb-heading__line sb-heading__line--long" />
                                <span className="sb-heading__line sb-heading__line--short" />
                            </span>

                            <h6
                                className="sb-heading__label"
                                style={{
                                    fontSize: "22px",
                                    fontWeight: 900,
                                    letterSpacing: "0.18em",
                                    color: "var(--primary, #86B817)",
                                }}
                            >
                                Booking Status
                            </h6>

                            {/* lines right */}
                            <span className="sb-heading__lines sb-heading__lines--right">
                                <span className="sb-heading__line sb-heading__line--long" />
                                <span className="sb-heading__line sb-heading__line--short" />
                            </span>
                        </div>

                        <h1
                            className="mb-1"
                            style={{
                                fontSize: "30px",
                                fontWeight: 800,
                                letterSpacing: ".3px",
                            }}
                        >
                            Payment Successful
                        </h1>
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
                                        fontWeight: 900,
                                        letterSpacing: ".4px",
                                    }}
                                >
                                    Thank you for your payment!
                                </h3>

                                <p className="mb-2">
                                    Your booking has been paid successfully. We&apos;ve sent a
                                    confirmation email with your booking details.
                                </p>

                                {/* Booking ID – pill */}
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
                                                fontWeight: 600,
                                            }}
                                        >
                                            <span style={{ color: "#666", fontWeight: 700 }}>
                                                Booking ID
                                            </span>
                                            <span
                                                style={{
                                                    height: 18,
                                                    width: 1,
                                                    backgroundColor: "rgba(0,0,0,0.08)",
                                                }}
                                            />
                                            <span
                                                style={{
                                                    fontWeight: 900,
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
                                onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
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
