// src/pages/MyBookings.jsx
import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export const MyBookings = () => {
    const { user } = useSelector((s) => s.auth);
    const { bookings, loading, error } = useSelector((s) => s.booking || {});

    // ==== Format ngày: chỉ lấy YYYY-MM-DD ====
    const formatDate = (str) => {
        if (!str) return "";
        return str.split("T")[0];
    };

    // Lọc booking thuộc về user hiện tại
    const myBookings = useMemo(() => {
        if (!user || !Array.isArray(bookings)) return [];
        return bookings.filter((b) => String(b.user?.id) === String(user.id));
    }, [bookings, user]);

    // Sắp xếp: booking mới nhất lên trên
    const myBookingsSorted = useMemo(
        () =>
            [...myBookings].sort(
                (a, b) => new Date(b.checkIn) - new Date(a.checkIn)
            ),
        [myBookings]
    );

    // Debug (có thể xoá sau khi test xong)
    useEffect(() => {
        console.log("All bookings:", bookings);
        console.log("My bookings:", myBookingsSorted);
    }, [bookings, myBookingsSorted]);

    if (!user) {
        return (
            <div className="container-xxl py-5">
                <div className="container">
                    <p>You need to log in to view your bookings.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-xxl py-5">
            <div className="container">
                {loading && <p>Loading...</p>}
                {error && <p className="text-danger">{error}</p>}
                {myBookingsSorted.length === 0 && !loading && (
                    <p>You have no bookings yet.</p>
                )}

                {myBookingsSorted.map((b) => {
                    const room = b.rooms?.[0];

                    // 👇 Lấy hotel từ room (BE đang join rooms + hotel)
                    const hotel = room?.hotel || null;
                    const isPaid = !!b.payment;

                    return (
                        <div
                            key={b.id}
                            className="mb-4 p-4 rounded-4"
                            style={{
                                background: "#FFFFB5",
                                boxShadow: "0 10px 25px rgba(0,0,0,.12)",
                                borderLeft: `6px solid ${isPaid ? "#2ecc71" : "#ff7979"}`,
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-start gap-3">
                                <div>
                                    {/* Nhãn Booking + ID */}
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <span
                                            style={{
                                                fontSize: "0.9rem",
                                                textTransform: "uppercase",
                                                letterSpacing: ".08em",
                                                color: "#888",
                                                fontWeight: 600,
                                            }}
                                        >
                                            Booking
                                        </span>
                                        <span
                                            style={{
                                                color: "#e67e22",
                                                fontWeight: 800,
                                                fontSize: "1.1rem",
                                            }}
                                        >
                                            #{b.id}
                                        </span>
                                    </div>

                                    {/* Hotel name + link */}
                                    <p className="mb-1">
                                        Hotel:&nbsp;
                                        {hotel ? (
                                            <Link
                                                to={`/hotel/${hotel.id}`}
                                                style={{
                                                    fontWeight: 700,
                                                    color: "#007bff",
                                                    textDecoration: "none",
                                                }}
                                            >
                                                {hotel.name}
                                            </Link>
                                        ) : (
                                            <span>—</span>
                                        )}
                                    </p>

                                    {/* Room name */}
                                    <p className="mb-1">
                                        Room: <strong>{room?.name || "—"}</strong>
                                    </p>

                                    {/* Check-in / Check-out (chỉ ngày) */}
                                    <p className="mb-1">
                                        Check-in: {formatDate(b.checkIn)} — Check-out:{" "}
                                        {formatDate(b.checkOut)}
                                    </p>

                                    {/* Total */}
                                    <p className="mb-0" style={{ fontWeight: 600 }}>
                                        Total: ${b.totalPrice}
                                    </p>
                                </div>

                                {/* Badge Paid / Unpaid phóng to */}
                                <span
                                    className="badge"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        minWidth: 100,
                                        padding: "10px 20px",
                                        borderRadius: 999,
                                        backgroundColor: isPaid ? "#28a745" : "#ff4d4f",
                                        color: "#fff",
                                        fontSize: "0.95rem",
                                        fontWeight: 800,
                                        boxShadow: "0 4px 10px rgba(0,0,0,.18)",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {isPaid ? "Paid" : "Unpaid"}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
