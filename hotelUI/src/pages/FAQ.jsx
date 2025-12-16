// src/pages/FAQ.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    FaQuestionCircle,
    FaCalendarCheck,
    FaCreditCard,
    FaCrown,
    FaLifeRing,
    FaSearch,
} from "react-icons/fa";

export const FAQ = () => {
    const [q, setQ] = useState("");
    const [openKey, setOpenKey] = useState("booking-0"); // mở mặc định câu đầu tiên

    // ===== Inline styles (không thêm CSS) =====
    const sectionTitleStyle = {
        fontSize: 20,
        fontWeight: 900,
        letterSpacing: "0.02em",
        marginBottom: 6,
    };

    const cardStyle = {
        borderRadius: 16,
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
        background: "#fff",
    };

    const chipStyle = {
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 12px",
        borderRadius: 999,
        border: "1px solid rgba(134,184,23,0.28)",
        background: "rgba(134,184,23,0.12)",
        color: "var(--primary)",
        fontWeight: 700,
        fontSize: 13,
    };

    const hintStyle = {
        fontSize: 13,
        color: "rgba(0,0,0,0.55)",
        marginBottom: 0,
    };

    // ===== FAQ CONTENT (FULL & COMPLETE) =====
    const FAQ_DATA = useMemo(
        () => [
            {
                key: "booking",
                icon: <FaCalendarCheck />,
                title: "Booking & Reservation",
                items: [
                    {
                        q: "How can I view my booking?",
                        a: (
                            <>
                                After logging in, go to <strong>My Bookings</strong> from the
                                navigation menu. You can view booking details, room information,
                                stay dates, and payment status.
                            </>
                        ),
                    },
                    {
                        q: "Can I change check-in or check-out dates?",
                        a: (
                            <>
                                Yes, you can request a date change depending on hotel policy and
                                room availability.
                                <br />
                                <br />
                                Please submit your request via the <strong>Contact</strong> page
                                and choose <strong>Booking & Reservation</strong>, or call our
                                hotline for faster assistance.
                            </>
                        ),
                    },
                    {
                        q: "What are the check-in and check-out times?",
                        a: (
                            <>
                                Standard check-in time is from{" "}
                                <strong>14:00 (2:00 PM)</strong>, and check-out time is before{" "}
                                <strong>12:00 (12:00 PM)</strong>.
                                <br />
                                <br />
                                Early check-in or late check-out may be available upon request,
                                subject to availability and additional charges.
                            </>
                        ),
                    },
                ],
            },
            {
                key: "payment",
                icon: <FaCreditCard />,
                title: "Payment & Refund",
                items: [
                    {
                        q: "What payment methods are supported?",
                        a: (
                            <>
                                We currently support <strong>PayPal</strong> as a secure and
                                trusted online payment method for all bookings.
                            </>
                        ),
                    },
                    {
                        q: "When will I be charged?",
                        a: (
                            <>
                                Your payment will be charged immediately after you confirm your
                                booking and successfully complete the checkout process.
                            </>
                        ),
                    },
                    {
                        q: "When will I receive a refund?",
                        a: (
                            <>
                                Refund eligibility depends on the hotel’s cancellation policy.
                                <br />
                                <br />
                                Once approved, refunds are usually processed within{" "}
                                <strong>5–7 business days</strong>, depending on your payment
                                provider.
                            </>
                        ),
                    },
                ],
            },
            {
                key: "loyalty",
                icon: <FaCrown />,
                title: "Loyalty Program",
                items: [
                    {
                        q: "How do I earn loyalty points?",
                        a: (
                            <>
                                You earn loyalty points after completing a{" "}
                                <strong>paid booking</strong>. Points are calculated based on
                                the total room price and added automatically after check-out.
                            </>
                        ),
                    },
                    {
                        q: "What are BRONZE, SILVER and GOLD tiers?",
                        a: (
                            <>
                                Loyalty tiers are determined by your total accumulated points:
                                <br />
                                <strong>BRONZE</strong>: under 10 points
                                <br />
                                <strong>SILVER</strong>: 10–99 points
                                <br />
                                <strong>GOLD</strong>: 100 points or more
                                <br />
                                <br />
                                Higher tiers unlock exclusive discounts, offers, and privileges.
                            </>
                        ),
                    },
                    {
                        q: "Why are my loyalty points not updated yet?",
                        a: (
                            <>
                                Points are added after your stay is successfully completed.
                                <br />
                                <br />
                                If your points have not appeared, please contact support with
                                your booking ID for verification.
                            </>
                        ),
                    },
                ],
            },
            {
                key: "support",
                icon: <FaLifeRing />,
                title: "Account & Support",
                items: [
                    {
                        q: "I didn’t receive a confirmation email. What should I do?",
                        a: (
                            <>
                                Please check your <strong>Spam</strong> or{" "}
                                <strong>Junk</strong> folder first.
                                <br />
                                <br />
                                If the email is still missing, contact us via the Contact page
                                and we will resend your confirmation.
                            </>
                        ),
                    },
                    {
                        q: "I can’t log in or my account has issues. How can I get help?",
                        a: (
                            <>
                                Please use the <strong>Contact</strong> form and select{" "}
                                <strong>Technical Support</strong> so our team can assist you as
                                quickly as possible.
                            </>
                        ),
                    },
                    {
                        q: "How do I contact customer support?",
                        a: (
                            <>
                                You can reach our support team through the{" "}
                                <strong>Contact</strong> page, via email, or by calling our{" "}
                                <strong>24/7 hotline</strong> for urgent issues.
                            </>
                        ),
                    },
                ],
            },
        ],
        []
    );

    const normalized = q.trim().toLowerCase();

    const filtered = useMemo(() => {
        if (!normalized) return FAQ_DATA;

        return FAQ_DATA.map((sec) => ({
            ...sec,
            items: sec.items.filter((it) => it.q.toLowerCase().includes(normalized)),
        })).filter((sec) => sec.items.length > 0);
    }, [FAQ_DATA, normalized]);

    const makeId = (secKey, idx) => `${secKey}-${idx}`;

    return (
        <div className="container-xxl py-4">
            <div className="container">
                {/* ===== Heading ===== */}
                <div className="text-center mb-3">
                    <div className="sb-heading sb-heading--md mx-auto">
                        <span className="sb-heading__lines sb-heading__lines--left">
                            <span className="sb-heading__line sb-heading__line--long" />
                            <span className="sb-heading__line sb-heading__line--short" />
                        </span>

                        <h6
                            className="sb-heading__label"
                            style={{ fontSize: 26, fontWeight: 900, letterSpacing: "0.18em" }}
                        >
                            FAQ
                        </h6>

                        <span className="sb-heading__lines sb-heading__lines--right">
                            <span className="sb-heading__line sb-heading__line--long" />
                            <span className="sb-heading__line sb-heading__line--short" />
                        </span>
                    </div>

                    <h1 className="mb-2" style={{ fontSize: 28 }}>
                        Frequently Asked Questions
                    </h1>
                    <p className="small text-muted">
                        Quick answers about booking, payment, loyalty and support.
                    </p>
                </div>

                {/* ===== Search ===== */}
                <div className="row g-3 mb-3">
                    <div className="col-lg-8">
                        <div className="p-3" style={cardStyle}>
                            <div className="d-flex justify-content-between align-items-center gap-2">
                                <span style={chipStyle}>
                                    <FaQuestionCircle /> Quick Help
                                </span>

                                <div className="input-group" style={{ maxWidth: 420 }}>
                                    <span className="input-group-text bg-white">
                                        <FaSearch />
                                    </span>
                                    <input
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        className="form-control"
                                        placeholder="Search questions..."
                                    />
                                    {q && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => setQ("")}
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            <p style={hintStyle} className="mt-2">
                                Example keywords: refund, booking, points, email
                            </p>
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="p-3 h-100" style={cardStyle}>
                            <h5 style={sectionTitleStyle}>Need more help?</h5>
                            <p className="small text-muted">
                                If you can’t find your answer, contact us and we’ll respond
                                within 24 hours.
                            </p>
                            <div className="d-flex gap-2">
                                <Link to="/contact" className="btn btn-primary btn-sm flex-fill">
                                    Contact support
                                </Link>
                                <Link
                                    to="/my-bookings"
                                    className="btn btn-outline-primary btn-sm flex-fill"
                                >
                                    My bookings
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== FAQ Sections ===== */}
                {filtered.map((sec) => (
                    <div key={sec.key} id={sec.key} className="mb-4">
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <span
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 12,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    background: "rgba(134,184,23,0.12)",
                                    color: "var(--primary)",
                                }}
                            >
                                {sec.icon}
                            </span>
                            <h5 style={sectionTitleStyle}>{sec.title}</h5>
                        </div>

                        {/* ✅ React Accordion (không cần Bootstrap JS) */}
                        <div>
                            {sec.items.map((it, idx) => {
                                const id = makeId(sec.key, idx);
                                const isOpen = openKey === id;

                                return (
                                    <div
                                        key={id}
                                        className="mb-2"
                                        style={{
                                            borderRadius: 14,
                                            overflow: "hidden",
                                            border: "1px solid rgba(0,0,0,0.08)",
                                            background: "#fff",
                                        }}
                                    >
                                        {/* HEADER */}
                                        <button
                                            type="button"
                                            onClick={() => setOpenKey(isOpen ? "" : id)}
                                            aria-expanded={isOpen}
                                            style={{
                                                width: "100%",
                                                textAlign: "left",
                                                padding: "14px 16px",
                                                fontWeight: 800,
                                                fontSize: 15,
                                                border: "none",
                                                outline: "none",
                                                background: "#fff",
                                                color: "rgba(0,0,0,0.82)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <span>{it.q}</span>
                                            <span
                                                style={{
                                                    transition: "transform .2s ease",
                                                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                                                    fontSize: 18,
                                                    color: "var(--primary)",
                                                    lineHeight: 1,
                                                }}
                                            >
                                                ▾
                                            </span>
                                        </button>

                                        {/* BODY */}
                                        {isOpen && (
                                            <div
                                                style={{
                                                    padding: "12px 16px 16px",
                                                    fontSize: 14,
                                                    color: "rgba(0,0,0,0.75)",
                                                    borderTop: "1px solid rgba(0,0,0,0.06)",
                                                }}
                                            >
                                                {it.a}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
