// src/pages/MyBookings.jsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Rate, Modal, Input, message } from "antd";
import axios from "axios";

import { authServices } from "../services/auth";
import { bookingAction } from "../store/booking/slice";

const { TextArea } = Input;
const API_URL = import.meta.env.VITE_HOTEL_API;

export const MyBookings = () => {
    const dispatch = useDispatch();

    const { user } = useSelector((s) => s.auth);
    const { bookings } = useSelector((s) => s.booking || {});

    const [hoveredId, setHoveredId] = useState(null);

    // ✅ page-level loading/error (độc lập redux)
    const [pageLoading, setPageLoading] = useState(false);
    const [pageError, setPageError] = useState("");

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
        return String(str).split("T")[0];
    };

    // ===== Payment UI theo Option B (cutoff 14:00 ngày check-in) =====
    const CHECKIN_CUTOFF_HOUR = 14;

    const getPaymentUi = (b) => {
        const paid = !!b?.payment;
        if (paid) return { state: "paid", text: "Paid", bg: "#28a745", color: "#fff" };

        const checkIn = b?.checkIn ? new Date(b.checkIn) : null;
        if (!checkIn) return { state: "unpaid", text: "Unpaid", bg: "#ff4d4f", color: "#fff" };

        const cutoff = new Date(
            checkIn.getFullYear(),
            checkIn.getMonth(),
            checkIn.getDate(),
            CHECKIN_CUTOFF_HOUR,
            0,
            0
        );

        const expired = new Date() >= cutoff;
        if (expired) return { state: "expired", text: "Expired", bg: "#6b7280", color: "#fff" };
        return { state: "waiting", text: "Waiting", bg: "#faad14", color: "#111" };
    };

    // ===== UI helpers (inline) =====
    const pillStyle = (bg, color = "#111") => ({
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 12px",
        borderRadius: 999,
        background: bg,
        color,
        fontWeight: 900,
        fontSize: 12,
        letterSpacing: ".10em",
        textTransform: "uppercase",
        lineHeight: 1,
        boxShadow: "0 6px 14px rgba(0,0,0,.12)",
        whiteSpace: "nowrap",
    });

    const softPillStyle = () => ({
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 12px",
        borderRadius: 999,
        background: "rgba(255,255,255,.78)",
        border: "1px solid rgba(0,0,0,.06)",
        fontWeight: 800,
        fontSize: 13,
        whiteSpace: "nowrap",
    });

    const cardStyle = (hovered) => ({
        position: "relative",
        background: "linear-gradient(180deg, #FFFCE8 0%, #FFFFB5 100%)",
        borderRadius: 18,
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,.06)",
        boxShadow: hovered ? "0 18px 38px rgba(0,0,0,.18)" : "0 10px 25px rgba(0,0,0,.12)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "all .18s ease",
    });

    const getReviewPill = (stayCompleted, hasReview) => {
        if (!stayCompleted) return { text: "In progress", bg: "rgba(52,152,219,.18)", color: "#111" };
        if (stayCompleted && !hasReview) return { text: "Need review", bg: "rgba(241,196,15,.22)", color: "#111" };
        return { text: "Reviewed", bg: "rgba(46,204,113,.22)", color: "#111" };
    };

    // ✅ Fetch "my bookings" từ BE: /api/booking/me
    const fetchMyBookings = useCallback(async () => {
        if (!user) return;
        setPageError("");
        setPageLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/booking/me`, {
                headers: authServices.authHeader(),
            });
            dispatch(bookingAction.setBookings(res.data || []));
        } catch (err) {
            console.error(err);
            const msg =
                err?.response?.data ||
                err?.response?.data?.message ||
                err?.message ||
                "Cannot load your bookings.";
            setPageError(String(msg));
        } finally {
            setPageLoading(false);
        }
    }, [dispatch, user]);

    useEffect(() => {
        fetchMyBookings();
    }, [fetchMyBookings]);

    if (!user) {
        return (
            <div className="container-xxl py-5">
                <div className="container">
                    <p>You need to log in to view your bookings.</p>
                </div>
            </div>
        );
    }

    // ✅ BE đã trả đúng booking của user -> không cần filter nữa
    const myBookingsSorted = useMemo(() => {
        const arr = Array.isArray(bookings) ? bookings : [];
        return [...arr].sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn));
    }, [bookings]);

    // ===== Helpers cho review =====
    const now = new Date();

    const openReview = (booking, mode = "create") => {
        const hasReview = !!booking?.review;
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

            if (mode === "create") {
                await axios.post(url, payload, { headers: authServices.authHeader() });
            } else {
                await axios.put(url, payload, { headers: authServices.authHeader() });
            }

            message.success(mode === "create" ? "Thank you! Your review has been submitted." : "Your review has been updated.");

            // ✅ refetch để chắc chắn rooms/hotel/review update đúng
            setReviewModal((s) => ({ ...s, open: false }));
            fetchMyBookings();
        } catch (err) {
            console.error(err);
            const msg = err?.response?.data || "Cannot submit review. Please try again.";
            message.error(msg);
        } finally {
            setReviewModal((s) => ({ ...s, loading: false }));
        }
    };

    return (
        <div className="container-xxl py-5">
            <div className="container">
                {/* ====== TITLE ====== */}
                <div className="text-center mb-4">
                    <div className="sb-heading sb-heading--md mx-auto">
                        <span className="sb-heading__lines sb-heading__lines--left">
                            <span className="sb-heading__line sb-heading__line--long" />
                            <span className="sb-heading__line sb-heading__line--short" />
                        </span>

                        <h6
                            className="sb-heading__label"
                            style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "0.18em" }}
                        >
                            BOOKINGS
                        </h6>

                        <span className="sb-heading__lines sb-heading__lines--right">
                            <span className="sb-heading__line sb-heading__line--long" />
                            <span className="sb-heading__line sb-heading__line--short" />
                        </span>
                    </div>

                    <h1 className="mb-0" style={{ fontSize: "28px" }}>
                        My Bookings
                    </h1>
                </div>

                {pageLoading && <p>Loading...</p>}
                {pageError && <p className="text-danger">{pageError}</p>}
                {!pageLoading && !pageError && myBookingsSorted.length === 0 && <p>You have no bookings yet.</p>}

                {myBookingsSorted.map((b) => {
                    const room = b.rooms?.[0];
                    const hotel = room?.hotel || null;

                    const checkOutDate = b.checkOut ? new Date(b.checkOut) : null;
                    const stayCompleted = !!(checkOutDate && checkOutDate.getTime() < now.getTime());
                    const hasReview = !!b.review;

                    const reviewPill = getReviewPill(stayCompleted, hasReview);
                    const payUi = getPaymentUi(b);
                    const isPaid = payUi.state === "paid";

                    const accent =
                        payUi.state === "paid"
                            ? "linear-gradient(180deg,#2ecc71,#1abc9c)"
                            : payUi.state === "expired"
                                ? "linear-gradient(180deg,#6b7280,#9ca3af)"
                                : "linear-gradient(180deg,#faad14,#ffd666)";

                    return (
                        <div
                            key={b.id}
                            className="mb-4"
                            onMouseEnter={() => setHoveredId(b.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            style={cardStyle(hoveredId === b.id)}
                        >
                            <div
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    top: 0,
                                    bottom: 0,
                                    width: 8,
                                    background: accent,
                                }}
                            />

                            {/* Header strip */}
                            <div
                                className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2"
                                style={{
                                    padding: "14px 16px 12px 18px",
                                    borderBottom: "1px solid rgba(0,0,0,.06)",
                                    background: "rgba(255,255,255,.35)",
                                }}
                            >
                                <div className="d-flex flex-wrap align-items-center gap-2">
                                    <span style={softPillStyle()}>
                                        <span style={{ opacity: 0.65, letterSpacing: ".08em" }}>BOOKING</span>
                                        <span style={{ color: "#e67e22", fontWeight: 900 }}>#{b.id}</span>
                                    </span>

                                    <span style={pillStyle(reviewPill.bg, reviewPill.color)}>{reviewPill.text}</span>
                                    <span style={pillStyle(payUi.bg, payUi.color)}>{payUi.text}</span>
                                </div>

                                <div className="d-flex flex-wrap gap-2 justify-content-md-end w-100 w-md-auto">
                                    <span style={softPillStyle()}>
                                        <span style={{ opacity: 0.7 }}>Check-in:</span>
                                        <b>{formatDate(b.checkIn)}</b>
                                    </span>
                                    <span style={softPillStyle()}>
                                        <span style={{ opacity: 0.7 }}>Check-out:</span>
                                        <b>{formatDate(b.checkOut)}</b>
                                    </span>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-4" style={{ paddingLeft: 26 }}>
                                <div className="d-flex flex-column flex-lg-row gap-3 justify-content-between">
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div className="mb-2">
                                            <div className="mb-1" style={{ fontWeight: 800 }}>
                                                Hotel:&nbsp;
                                                {hotel ? (
                                                    <Link
                                                        to={`/hotel/${hotel.id}`}
                                                        style={{ fontWeight: 900, color: "#0b5ed7", textDecoration: "none" }}
                                                    >
                                                        {hotel.name}
                                                    </Link>
                                                ) : (
                                                    <span>—</span>
                                                )}
                                            </div>

                                            <div className="mb-1" style={{ fontWeight: 800 }}>
                                                Room:&nbsp;<span style={{ fontWeight: 900 }}>{room?.name || "—"}</span>
                                            </div>

                                            <div className="mb-0" style={{ fontWeight: 900 }}>
                                                Total:&nbsp;<span style={{ color: "#111" }}>${b.totalPrice}</span>
                                            </div>
                                        </div>

                                        {hasReview && (
                                            <div
                                                style={{
                                                    marginTop: 10,
                                                    padding: "12px 14px",
                                                    borderRadius: 14,
                                                    background: "rgba(255,255,255,.86)",
                                                    border: "1px solid rgba(0,0,0,.06)",
                                                }}
                                            >
                                                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-1">
                                                    <span style={{ fontWeight: 900, color: "#444" }}>Your review</span>
                                                    <Rate disabled allowHalf value={b.review.rating} />
                                                </div>
                                                <p className="mb-0" style={{ fontSize: ".95rem", color: "#444" }}>
                                                    {b.review.comment}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="d-flex flex-column gap-2 justify-content-end align-items-stretch" style={{ minWidth: 220 }}>
                                        {isPaid && stayCompleted && !hasReview && (
                                            <Button
                                                onClick={() => openReview(b, "create")}
                                                style={{
                                                    background: "linear-gradient(135deg, #ffdd57, #ffb300)",
                                                    color: "#000",
                                                    fontWeight: 900,
                                                    fontSize: "0.95rem",
                                                    borderRadius: 999,
                                                    height: 42,
                                                    border: "none",
                                                    letterSpacing: ".03em",
                                                    boxShadow: "0 8px 18px rgba(0,0,0,.18)",
                                                    width: "100%",
                                                }}
                                            >
                                                ⭐ Write review
                                            </Button>
                                        )}

                                        {isPaid && stayCompleted && hasReview && (
                                            <Button
                                                onClick={() => openReview(b, "edit")}
                                                style={{
                                                    background: "#fff",
                                                    color: "#111",
                                                    fontWeight: 900,
                                                    fontSize: "0.95rem",
                                                    borderRadius: 999,
                                                    height: 42,
                                                    border: "1px solid rgba(0,0,0,.15)",
                                                    letterSpacing: ".03em",
                                                    boxShadow: "0 8px 18px rgba(0,0,0,.10)",
                                                    width: "100%",
                                                }}
                                            >
                                                ✎ Edit review
                                            </Button>
                                        )}

                                        {hotel && (
                                            <Link to={`/hotel/${hotel.id}`} style={{ width: "100%" }}>
                                                <Button
                                                    style={{
                                                        width: "100%",
                                                        borderRadius: 999,
                                                        height: 42,
                                                        fontWeight: 900,
                                                        border: "1px solid rgba(0,0,0,.12)",
                                                        background: "rgba(255,255,255,.75)",
                                                    }}
                                                >
                                                    View hotel →
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* ====== Modal Review ====== */}
                <Modal
                    title={reviewModal.mode === "create" ? "Write a review" : "Edit your review"}
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
                            onChange={(val) => setReviewModal((s) => ({ ...s, rating: val }))}
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
                            onChange={(e) => setReviewModal((s) => ({ ...s, comment: e.target.value }))}
                        />
                    </div>
                </Modal>
            </div>
        </div>
    );
};
