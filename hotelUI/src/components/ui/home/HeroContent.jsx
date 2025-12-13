// src/components/ui/home/HeroContent.jsx
import React, { useMemo, useState } from "react";
import { FaMapMarkerAlt, FaCalendarAlt, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { VIETNAM_CITIES } from "@/assets/constants/cities";

const isValidDateStr = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ""));

const addDays = (yyyyMMdd, days = 1) => {
    if (!isValidDateStr(yyyyMMdd)) return "";
    const d = new Date(`${yyyyMMdd}T00:00:00`);
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
};

const todayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
};

export const HeroContent = () => {
    const navigate = useNavigate();

    const [where, setWhere] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState(1);

    // ✅ check-in không trước hôm nay
    const minCheckIn = useMemo(() => todayStr(), []);

    // ✅ checkOut phải >= checkIn + 1
    const minCheckout = useMemo(() => (checkIn ? addDays(checkIn, 1) : ""), [checkIn]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // guard lần cuối trước khi đi
        let ci = checkIn;
        let co = checkOut;

        if (ci && ci < minCheckIn) ci = minCheckIn;
        if (ci) {
            const minCo = addDays(ci, 1);
            if (co && co < minCo) co = minCo;
        } else {
            co = "";
        }

        const params = new URLSearchParams();
        if (where.trim()) params.set("q", where.trim());
        if (ci) params.set("checkIn", ci);
        if (co) params.set("checkOut", co);
        if (guests) params.set("guests", String(guests));

        const queryString = params.toString();
        navigate(queryString ? `/hotel?${queryString}` : "/hotel");
    };

    return (
        <div className="home-hero-search-wrapper">
            <div className="container">
                <form className="home-hero-search" onSubmit={handleSubmit}>
                    {/* ===================== WHERE ===================== */}
                    <div className="home-hero-field">
                        <label className="home-hero-label">Where</label>
                        <div className="home-hero-input-wrap" style={{ position: "relative" }}>
                            <FaMapMarkerAlt className="home-hero-icon" />
                            <select
                                className="home-hero-input"
                                value={where}
                                onChange={(e) => setWhere(e.target.value)}
                                style={{ paddingLeft: "32px" }}
                            >
                                <option value="">Select a city...</option>
                                {VIETNAM_CITIES.map((city, idx) => (
                                    <option key={idx} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ===================== CHECK-IN ===================== */}
                    <div className="home-hero-field">
                        <label className="home-hero-label">Check-in</label>
                        <div className="home-hero-input-wrap">
                            <FaCalendarAlt className="home-hero-icon" />
                            <input
                                type="date"
                                className="home-hero-input"
                                value={checkIn}
                                min={minCheckIn} // ✅ chặn trước hôm nay
                                onChange={(e) => {
                                    let next = e.target.value;

                                    // ✅ guard: nếu chọn < hôm nay -> ép về hôm nay
                                    if (next && next < minCheckIn) next = minCheckIn;

                                    setCheckIn(next);

                                    // ✅ đổi checkIn -> checkOut phải hợp lệ
                                    if (!next) {
                                        setCheckOut("");
                                        return;
                                    }

                                    const minCo = addDays(next, 1);
                                    if (checkOut && checkOut < minCo) setCheckOut(minCo);
                                }}
                            />
                        </div>
                    </div>

                    {/* ===================== CHECK-OUT (CHẶN) ===================== */}
                    <div className="home-hero-field">
                        <label className="home-hero-label">Check-out</label>
                        <div className="home-hero-input-wrap">
                            <FaCalendarAlt className="home-hero-icon" />
                            <input
                                type="date"
                                className="home-hero-input"
                                value={checkOut}
                                min={minCheckout || undefined} // ✅ không chọn < checkIn+1
                                disabled={!checkIn}            // ✅ phải chọn checkIn trước
                                onChange={(e) => {
                                    const next = e.target.value;

                                    // ✅ user cố chọn sai -> không set
                                    if (checkIn && next && minCheckout && next < minCheckout) return;

                                    setCheckOut(next);
                                }}
                            />
                        </div>
                    </div>

                    {/* ===================== GUESTS ===================== */}
                    <div className="home-hero-field">
                        <label className="home-hero-label">Guests</label>
                        <div className="home-hero-input-wrap">
                            <FaUser className="home-hero-icon" />
                            <input
                                type="number"
                                min="1"
                                className="home-hero-input"
                                value={guests}
                                onChange={(e) => setGuests(Math.max(1, Number(e.target.value) || 1))}
                            />
                        </div>
                    </div>

                    {/* ===================== SEARCH BUTTON ===================== */}
                    <div className="home-hero-btn-wrap">
                        <button type="submit" className="btn btn-primary home-hero-btn">
                            Search
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
