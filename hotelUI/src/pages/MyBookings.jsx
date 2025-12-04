// src/pages/MyBookings.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Rate, Modal, Input, Tag, message } from "antd";
import axios from "axios";

import { authServices } from "../services/auth";
import { bookingAction } from "../store/booking/slice";

const { TextArea } = Input;
const API_URL = import.meta.env.VITE_HOTEL_API;

export const MyBookings = () => {
    const dispatch = useDispatch();

    const { user } = useSelector((s) => s.auth);
    const { bookings, loading, error } = useSelector((s) => s.booking || {});

    const [reviewModal, setReviewModal] = useState({
        open: false,
        booking: null,
        rating: 5,
        comment: "",
        loading: false,
        mode: "create", // "create" | "edit"
    });

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

    // ===== Helpers cho review =====
    const now = new Date();

    const openReview = (booking, mode = "create") => {
        const hasReview = !!booking.review;
        setReviewModal({
            open: true,
            booking,
            rating: hasReview ? booking.review.rating : 5,
            comment: hasReview ? booking.review.comment : "",
            loading: false,
            mode,
        });
    };

    const handleSubmitReview = async () => {
        const { booking, rating, comment, mode } = reviewModal;
        if (!booking) return;

        if (!comment.trim()) {
            message.warning("Please write something about your stay.");
            return;
        }

        try {
            setReviewModal((s) => ({ ...s, loading: true }));

            const url = `${API_URL}/api/booking/${booking.id}/review`;
            const payload = { rating, comment };

            // BE trả về Review (không phải Booking)
            const res =
                mode === "create"
                    ? await axios.post(url, payload, {
                        headers: authServices.authHeader(),
                    })
                    : await axios.put(url, payload, {
                        headers: authServices.authHeader(),
                    });

            const review = res.data;

            // Tạo booking mới với review vừa update
            const updatedBooking = {
                ...booking,
                review,
            };

            // Cập nhật lại store, KHÔNG reload trang
            dispatch(bookingAction.updateBookings(updatedBooking));

            message.success(
                mode === "create"
                    ? "Thank you! Your review has been submitted."
                    : "Your review has been updated."
            );
        } catch (err) {
            console.error(err);
            const msg =
                err?.response?.data || "Cannot submit review. Please try again.";
            message.error(msg);
        } finally {
            setReviewModal((s) => ({ ...s, loading: false, open: false }));
        }
    };

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

                    const checkOutDate = b.checkOut ? new Date(b.checkOut) : null;
                    const stayCompleted =
                        checkOutDate && checkOutDate.getTime() < now.getTime();
                    const hasReview = !!b.review;

                    // Trạng thái review
                    let reviewStatusLabel = null;
                    if (!stayCompleted) {
                        reviewStatusLabel = (
                            <Tag color="blue" style={{ borderRadius: 999 }}>
                                Stay in progress
                            </Tag>
                        );
                    } else if (stayCompleted && !hasReview) {
                        reviewStatusLabel = (
                            <Tag color="gold" style={{ borderRadius: 999 }}>
                                Waiting for your review
                            </Tag>
                        );
                    } else if (hasReview) {
                        reviewStatusLabel = (
                            <Tag color="green" style={{ borderRadius: 999 }}>
                                Reviewed
                            </Tag>
                        );
                    }

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
                                <div style={{ flex: 1 }}>
                                    {/* Nhãn Booking + ID + trạng thái review */}
                                    <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
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
                                        {reviewStatusLabel}
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
                                    <p className="mb-2" style={{ fontWeight: 600 }}>
                                        Total: ${b.totalPrice}
                                    </p>

                                    {/* ====== Hiển thị review nếu đã có ====== */}
                                    {hasReview && (
                                        <div
                                            style={{
                                                marginTop: 8,
                                                padding: "10px 14px",
                                                borderRadius: 12,
                                                background: "rgba(255,255,255,.85)",
                                            }}
                                        >
                                            <div className="d-flex align-items-center justify-content-between mb-1">
                                                <span
                                                    style={{
                                                        fontWeight: 600,
                                                        fontSize: ".95rem",
                                                        color: "#555",
                                                    }}
                                                >
                                                    Your review
                                                </span>
                                                <Rate disabled allowHalf value={b.review.rating} />
                                            </div>
                                            <p
                                                className="mb-0"
                                                style={{ fontSize: ".95rem", color: "#444" }}
                                            >
                                                {b.review.comment}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Cột phải: trạng thái payment + nút review */}
                                <div
                                    className="d-flex flex-column align-items-end justify-content-between"
                                    style={{ gap: 8, minWidth: 140 }}
                                >
                                    {/* Badge Paid / Unpaid phóng to */}
                                    <span
                                        className="badge mb-2"
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            minWidth: 120,
                                            height: 40,
                                            padding: "0 24px",
                                            borderRadius: 999,
                                            backgroundColor: isPaid ? "#28a745" : "#ff4d4f",
                                            color: "#fff",
                                            fontSize: "1.05rem",
                                            fontWeight: 900,
                                            letterSpacing: ".08em",
                                            boxShadow: "0 5px 14px rgba(0,0,0,.25)",
                                            textTransform: "uppercase",
                                        }}
                                    >
                                        {isPaid ? "Paid" : "Unpaid"}
                                    </span>

                                    {/* Nút review: chỉ cho review khi đã paid + đã check-out */}
                                    {isPaid && stayCompleted && !hasReview && (
                                        <Button
                                            onClick={() => openReview(b, "create")}
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, #ffdd57, #ffb300)", // vàng gradient đậm rõ
                                                color: "#000",
                                                fontWeight: 800,
                                                fontSize: "1rem",
                                                padding: "10px 28px",
                                                borderRadius: "999px",
                                                height: 42,
                                                border: "none",
                                                letterSpacing: ".03em",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 8,
                                                boxShadow: "0 5px 14px rgba(0,0,0,.22)",
                                            }}
                                        >
                                            ⭐ Write review
                                        </Button>
                                    )}

                                    {isPaid && stayCompleted && hasReview && (
                                        <Button
                                            onClick={() => openReview(b, "edit")}
                                            style={{
                                                background: "#ffffff",
                                                color: "#333",
                                                fontWeight: 800,
                                                fontSize: "1rem",
                                                padding: "10px 28px",
                                                height: 42,
                                                borderRadius: "999px",
                                                border: "2px solid rgba(0,0,0,.15)",
                                                letterSpacing: ".03em",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 8,
                                                boxShadow: "0 5px 14px rgba(0,0,0,.12)",
                                            }}
                                        >
                                            ✎ Edit review
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* ====== Modal Review ====== */}
                <Modal
                    title={
                        reviewModal.mode === "create"
                            ? "Write a review"
                            : "Edit your review"
                    }
                    open={reviewModal.open}
                    confirmLoading={reviewModal.loading}
                    onOk={handleSubmitReview}
                    onCancel={() => setReviewModal((s) => ({ ...s, open: false }))}
                    okText={reviewModal.mode === "create" ? "Submit" : "Update"}
                >
                    <div style={{ marginBottom: 12 }}>
                        <p className="mb-1" style={{ fontWeight: 600 }}>
                            Rating
                        </p>
                        <Rate
                            allowHalf
                            value={reviewModal.rating}
                            onChange={(val) =>
                                setReviewModal((s) => ({ ...s, rating: val }))
                            }
                        />
                    </div>
                    <div>
                        <p className="mb-1" style={{ fontWeight: 600 }}>
                            Comment
                        </p>
                        <TextArea
                            rows={4}
                            placeholder="How was your stay?"
                            value={reviewModal.comment}
                            onChange={(e) =>
                                setReviewModal((s) => ({ ...s, comment: e.target.value }))
                            }
                        />
                    </div>
                </Modal>
            </div>
        </div>
    );
};
