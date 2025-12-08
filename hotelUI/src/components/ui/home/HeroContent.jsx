// src/components/ui/home/HeroContent.jsx
import React, { useState } from "react";
import { FaMapMarkerAlt, FaCalendarAlt, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { VIETNAM_CITIES } from "@/assets/constants/cities";

export const HeroContent = () => {
    const navigate = useNavigate();

    const [where, setWhere] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState(1);

    const handleSubmit = (e) => {
        e.preventDefault();

        const params = new URLSearchParams();
        if (where.trim()) params.set("q", where.trim());
        if (checkIn) params.set("checkIn", checkIn);
        if (checkOut) params.set("checkOut", checkOut);
        if (guests) params.set("guests", guests);

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

                            {/* Dropdown list */}
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
                                onChange={(e) => setCheckIn(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* ===================== CHECK-OUT ===================== */}
                    <div className="home-hero-field">
                        <label className="home-hero-label">Check-out</label>
                        <div className="home-hero-input-wrap">
                            <FaCalendarAlt className="home-hero-icon" />
                            <input
                                type="date"
                                className="home-hero-input"
                                value={checkOut}
                                onChange={(e) => setCheckOut(e.target.value)}
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
                                onChange={(e) => setGuests(e.target.value)}
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
