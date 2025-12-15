import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaConciergeBell } from "react-icons/fa";
import { FiMapPin } from "react-icons/fi";

import { getNearbyPlaces } from "../../../../services/map";
import { NearbyPlan } from "./NearbyPlan";

import {
    GROUP_ORDER,
    MAX_ITEMS_COLLAPSED,
    roundMeters,
    getHotelCoords,
    getPlaceGroup,
    getPlaceTypeLabel,
    buildDirectionLink,
    buildDayPlan,
    buildSlotPools,
    cyclePlanSlot,
} from "./nearby.helpers";

/* ===================== Tiny Toast (smaller) ===================== */
const Toast = ({ show, type = "info", text }) => {
    if (!show) return null;

    const bg =
        type === "error"
            ? "rgba(180, 35, 24, .09)"
            : type === "success"
                ? "rgba(34, 197, 94, .10)"
                : "rgba(17, 24, 39, .06)";

    const bd =
        type === "error"
            ? "rgba(180, 35, 24, .18)"
            : type === "success"
                ? "rgba(34, 197, 94, .18)"
                : "rgba(0,0,0,.08)";

    const color =
        type === "error" ? "#b42318" : type === "success" ? "#14532d" : "#111827";

    return (
        <div
            style={{
                position: "fixed",
                left: "50%",
                bottom: 16,
                transform: "translateX(-50%)",
                zIndex: 4000,

                padding: "7px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 0.1,
                lineHeight: 1.2,

                background: bg,
                border: `1px solid ${bd}`,
                color,
                boxShadow: "0 10px 18px rgba(0,0,0,.10)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",

                maxWidth: "min(92vw, 560px)",
                textAlign: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
            }}
            title={text}
        >
            {text}
        </div>
    );
};

export const HotelNearby = ({ hotel }) => {
    const [nearbyGroups, setNearbyGroups] = useState({});
    const [nearbyLoading, setNearbyLoading] = useState(false);
    const [activeGroup, setActiveGroup] = useState(null);
    const [expandedGroups, setExpandedGroups] = useState({});

    // User location
    const [userCoords, setUserCoords] = useState({ lat: null, lon: null });
    const [geoStatus, setGeoStatus] = useState("idle");
    const [geoError, setGeoError] = useState("");
    const [geoAccuracy, setGeoAccuracy] = useState(null);

    // Mode: "user" | "hotel"
    const [originMode, setOriginMode] = useState("hotel");

    // Plan
    const [planOpen, setPlanOpen] = useState(false);
    const [dayPlan, setDayPlan] = useState(null);

    // Pools + cursor for cycle refresh ↻
    const [slotPools, setSlotPools] = useState(null);
    const [slotCursor, setSlotCursor] = useState({
        play: [0, 0, 0, 0],
        food: [0, 0, 0, 0],
    });

    // Toast
    const [toast, setToast] = useState({ show: false, type: "info", text: "" });
    const toastTimerRef = useRef(null);

    // Cache theo origin
    const cacheRef = useRef(new Map());
    const reqIdRef = useRef(0);

    const { lat: hotelLat, lon: hotelLon } = useMemo(() => getHotelCoords(hotel), [hotel]);

    const hasNearbyData = useMemo(
        () => !!nearbyGroups && Object.keys(nearbyGroups).length > 0,
        [nearbyGroups]
    );

    const showToast = (text, type = "info", ms = 3200) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast({ show: true, type, text });
        toastTimerRef.current = setTimeout(() => {
            setToast((t) => ({ ...t, show: false }));
        }, ms);
    };

    useEffect(() => {
        return () => {
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        };
    }, []);

    // Default: hotel location
    useEffect(() => {
        if (!hotel) return;
        if (hotelLat && hotelLon) setOriginMode("hotel");
    }, [hotel, hotelLat, hotelLon]);

    const requestUserLocation = () => {
        if (!("geolocation" in navigator)) {
            setGeoStatus("unsupported");
            setGeoError("Geolocation is not supported in this browser.");
            showToast("Geolocation is not supported in this browser.", "error");
            return;
        }

        setGeoStatus("loading");
        setGeoError("");
        setGeoAccuracy(null);

        const getPos = (options) =>
            new Promise((resolve, reject) =>
                navigator.geolocation.getCurrentPosition(resolve, reject, options)
            );

        getPos({ enableHighAccuracy: false, timeout: 15000, maximumAge: 0 })
            .catch(() => getPos({ enableHighAccuracy: true, timeout: 25000, maximumAge: 0 }))
            .then((pos) => {
                const lat = pos?.coords?.latitude;
                const lon = pos?.coords?.longitude;
                const acc = pos?.coords?.accuracy;

                if (lat && lon) {
                    setUserCoords({ lat, lon });
                    setGeoAccuracy(Number.isFinite(acc) ? acc : null);
                    setGeoStatus("granted");
                    setOriginMode("user");
                    showToast("Using your current location.", "success", 1600);
                } else {
                    throw new Error("Invalid coordinates");
                }
            })
            .catch((err) => {
                console.error("GEO ERROR:", err);

                if (err?.code === 1) {
                    setGeoStatus("denied");
                    setGeoError("Location permission denied.");
                } else if (err?.code === 2) {
                    setGeoStatus("error");
                    setGeoError("Location unavailable. Turn on Wi-Fi.");
                } else if (err?.code === 3) {
                    setGeoStatus("error");
                    setGeoError("Location request timed out. Please retry.");
                } else {
                    setGeoStatus("error");
                    setGeoError("Failed to get your location.");
                }

                setOriginMode("hotel");
                showToast("Couldn't get your location. Showing places near the hotel.", "info", 2000);
            });
    };

    // ✅ HERE: label hiển thị tên hotel thay vì "Hotel location"
    const origin = useMemo(() => {
        if (originMode === "user" && userCoords.lat && userCoords.lon) {
            return { lat: userCoords.lat, lon: userCoords.lon, label: "Your location" };
        }

        const hotelName =
            hotel?.name || hotel?.hotelName || hotel?.title || "Hotel location";

        return { lat: hotelLat, lon: hotelLon, label: hotelName };
    }, [originMode, userCoords, hotelLat, hotelLon, hotel]);

    // Fetch nearby
    useEffect(() => {
        if (!hotel) return;
        if (!origin.lat || !origin.lon) return;

        const key = `${origin.lat.toFixed(5)}:${origin.lon.toFixed(5)}`;
        const cached = cacheRef.current.get(key);
        if (cached) {
            setNearbyGroups(cached);
            return;
        }

        setNearbyLoading(true);
        const myReqId = ++reqIdRef.current;

        getNearbyPlaces(origin.lat, origin.lon)
            .then((list) => {
                if (myReqId !== reqIdRef.current) return;

                const groups = (list || []).reduce((acc, item) => {
                    const props = item?.properties || {};
                    const group = getPlaceGroup(props);
                    if (!acc[group]) acc[group] = [];
                    acc[group].push(item);
                    return acc;
                }, {});

                Object.keys(groups).forEach((g) => {
                    groups[g].sort((a, b) => {
                        const da = a?.properties?.distance;
                        const db = b?.properties?.distance;
                        if (typeof da === "number" && typeof db === "number") return da - db;
                        return 0;
                    });
                });

                cacheRef.current.set(key, groups);
                setNearbyGroups(groups);
            })
            .catch(() => {
                if (myReqId !== reqIdRef.current) return;
                setNearbyGroups({});
            })
            .finally(() => {
                if (myReqId !== reqIdRef.current) return;
                setNearbyLoading(false);
            });
    }, [hotel, origin.lat, origin.lon]);

    const orderedEntries = useMemo(() => {
        const entries = Object.entries(nearbyGroups || {});
        return entries.sort(([g1], [g2]) => {
            const i1 = GROUP_ORDER.indexOf(g1);
            const i2 = GROUP_ORDER.indexOf(g2);
            const a = i1 === -1 ? GROUP_ORDER.length : i1;
            const b = i2 === -1 ? GROUP_ORDER.length : i2;
            return a - b;
        });
    }, [nearbyGroups]);

    const hasData = orderedEntries.length > 0;

    useEffect(() => {
        if (!hasData) return;
        if (!activeGroup || !nearbyGroups[activeGroup]) setActiveGroup(orderedEntries[0][0]);
    }, [hasData, orderedEntries, activeGroup, nearbyGroups]);

    const visibleEntries = orderedEntries.filter(([group]) => group === activeGroup);

    const toggleExpand = (groupName) => {
        setExpandedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
    };

    // Build plan + init pools + reset cursor
    const handleBuildPlan = () => {
        if (!hasNearbyData) return;

        const pools = buildSlotPools(nearbyGroups);
        const plan = buildDayPlan(nearbyGroups);

        setSlotPools(pools);

        const nextCursor = { play: [0, 0, 0, 0], food: [0, 0, 0, 0] };

        for (let i = 0; i < 4; i++) {
            const pPool = pools?.playPools?.[i] || [];
            const fPool = pools?.foodPools?.[i] || [];

            const pId = plan?.play?.[i]?.properties?.place_id ?? null;
            const fId = plan?.food?.[i]?.properties?.place_id ?? null;

            const pIdx = pPool.findIndex((x) => (x?.properties?.place_id ?? null) === pId);
            const fIdx = fPool.findIndex((x) => (x?.properties?.place_id ?? null) === fId);

            nextCursor.play[i] = pIdx >= 0 ? pIdx : 0;
            nextCursor.food[i] = fIdx >= 0 ? fIdx : 0;
        }

        setSlotCursor(nextCursor);
        setDayPlan(plan);
        setPlanOpen(true);

        showToast("✅ New plan created. Tap ↻ to cycle suggestions.", "success", 2200);
    };

    // cycle refresh ↻
    const handleRefreshSlot = (type, index) => {
        if (!hasNearbyData) return;

        const pools = slotPools || buildSlotPools(nearbyGroups);
        if (!slotPools) setSlotPools(pools);

        setDayPlan((prevPlan) => {
            const basePlan = prevPlan || buildDayPlan(nearbyGroups);

            const { nextPlan, nextCursorMap, meta } = cyclePlanSlot(
                pools,
                basePlan,
                slotCursor,
                type,
                index
            );

            setSlotCursor(nextCursorMap);

            if (meta.total > 0) {
                const msg = meta.wrapped
                    ? `🔁 Back to the first suggestion (1/${meta.total})`
                    : `🔄 Next suggestion (${meta.step}/${meta.total})`;
                showToast(msg, "success", 1500);
            } else {
                showToast("⚠️ Not enough suitable places to cycle for this slot.", "info", 2000);
            }

            return nextPlan;
        });
    };

    const closePlan = () => setPlanOpen(false);

    if (!hotel) return null;

    return (
        <>
            <Toast show={toast.show} type={toast.type} text={toast.text} />

            {/* ===== TITLE ===== */}
            <div className="container-xxl pt-2 pb-3">
                <div className="container">
                    <div className="text-center wow fadeInUp" data-wow-delay="0.05s">
                        {/* ===== Heading ===== */}
                        <div className="text-center mb-5">
                            <div className="sb-heading sb-heading--md mx-auto">
                                {/* lines left */}
                                <span className="sb-heading__lines sb-heading__lines--left">
                                    <span className="sb-heading__line sb-heading__line--long" />
                                    <span className="sb-heading__line sb-heading__line--short" />
                                </span>

                                {/* LABEL */}
                                <h6
                                    className="sb-heading__label"
                                    style={{
                                        fontSize: "26px",
                                        fontWeight: 900,
                                        letterSpacing: "0.18em",
                                        color: "#86B817", // 👈 xanh chủ đạo
                                    }}
                                >
                                    Nearby Experiences
                                </h6>

                                {/* lines right */}
                                <span className="sb-heading__lines sb-heading__lines--right">
                                    <span className="sb-heading__line sb-heading__line--long" />
                                    <span className="sb-heading__line sb-heading__line--short" />
                                </span>
                            </div>

                            <h1
                                className="mb-0"
                                style={{
                                    fontSize: "28px",
                                    fontWeight: 800,
                                }}
                            >
                                Places around you
                            </h1>

                            <p
                                className="mt-2"
                                style={{
                                    fontSize: "0.95rem",
                                    color: "#6c757d",
                                }}
                            >
                                Restaurants, entertainment, shopping and services near{" "}
                                <span style={{ fontWeight: 700 }}>{origin.label}</span>.
                            </p>
                        </div>

                        {/* ===== CONTROL BAR ===== */}
                        <div
                            className="mx-auto mt-3"
                            style={{
                                maxWidth: 980,
                                padding: "10px 12px",
                                borderRadius: 999,
                                background: "rgba(255,255,255,.86)",
                                border: "1px solid rgba(0,0,0,.06)",
                                boxShadow: "0 10px 26px rgba(0,0,0,.10)",
                                backdropFilter: "blur(8px)",
                                WebkitBackdropFilter: "blur(8px)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: 10,
                                flexWrap: "wrap",
                            }}
                        >
                            {/* Left: Location control */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    flex: "1 1 560px",
                                    justifyContent: "center",
                                }}
                            >
                                <span
                                    style={{
                                        fontWeight: 900,
                                        fontSize: "0.92rem",
                                        color: "#1f2937",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 8,
                                        padding: "6px 12px",
                                        borderRadius: 999,
                                        background: "rgba(134,184,23,.10)",
                                    }}
                                >
                                    <FiMapPin />
                                    Location
                                </span>

                                <div
                                    style={{
                                        display: "flex",
                                        borderRadius: 999,
                                        padding: 4,
                                        background: "rgba(0,0,0,.04)",
                                        boxShadow: "inset 0 1px 0 rgba(255,255,255,.65)",
                                    }}
                                >
                                    <button
                                        onClick={requestUserLocation}
                                        disabled={geoStatus === "loading"}
                                        style={{
                                            padding: "8px 14px",
                                            borderRadius: 999,
                                            border: "none",
                                            fontWeight: 900,
                                            fontSize: "0.9rem",
                                            cursor: geoStatus === "loading" ? "not-allowed" : "pointer",
                                            background: originMode === "user" ? "#86B817" : "transparent",
                                            color: originMode === "user" ? "#fff" : "#111827",
                                            transition: "all .15s ease",
                                            boxShadow: originMode === "user" ? "0 8px 16px rgba(134,184,23,.35)" : "none",
                                            opacity: geoStatus === "loading" ? 0.7 : 1,
                                        }}
                                        title="Use your current location"
                                    >
                                        {geoStatus === "loading" ? "Locating..." : "Use my location"}
                                    </button>

                                    <button
                                        onClick={() => setOriginMode("hotel")}
                                        style={{
                                            padding: "8px 14px",
                                            borderRadius: 999,
                                            border: "none",
                                            fontWeight: 900,
                                            fontSize: "0.9rem",
                                            cursor: "pointer",
                                            background: originMode === "hotel" ? "#86B817" : "transparent",
                                            color: originMode === "hotel" ? "#fff" : "#111827",
                                            transition: "all .15s ease",
                                            boxShadow: originMode === "hotel" ? "0 8px 16px rgba(134,184,23,.35)" : "none",
                                        }}
                                    >
                                        Use hotel location
                                    </button>
                                </div>

                                <span
                                    style={{
                                        fontSize: "0.86rem",
                                        fontWeight: 800,
                                        color: "#374151",
                                        padding: "6px 12px",
                                        borderRadius: 999,
                                        background: "rgba(0,0,0,.04)",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    Using: <span style={{ color: "#86B817" }}>{origin.label}</span>
                                    {originMode === "user" && geoAccuracy != null && (
                                        <span style={{ marginLeft: 8, color: "#6b7280", fontWeight: 800 }}>
                                            (±{Math.round(geoAccuracy)}m)
                                        </span>
                                    )}
                                </span>
                            </div>

                            {/* Right: Tour CTA */}
                            <div style={{ flex: "0 0 auto", display: "flex", justifyContent: "center" }}>
                                <button
                                    onClick={handleBuildPlan}
                                    disabled={!hasData || nearbyLoading}
                                    style={{
                                        padding: "9px 16px",
                                        borderRadius: 999,
                                        border: "none",
                                        fontWeight: 950,
                                        fontSize: "0.92rem",
                                        cursor: !hasData || nearbyLoading ? "not-allowed" : "pointer",
                                        background: "linear-gradient(135deg, #86B817, #6aa30f)",
                                        color: "#fff",
                                        boxShadow: "0 12px 22px rgba(134,184,23,.35)",
                                        opacity: !hasData || nearbyLoading ? 0.55 : 1,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 8,
                                        whiteSpace: "nowrap",
                                    }}
                                    title={!hasData ? "Wait for nearby places to load" : "Build a 1-day itinerary"}
                                >
                                    ✨ Build a 1-day plan
                                </button>
                            </div>
                        </div>

                        {geoError && (
                            <p className="mb-0 mt-2" style={{ fontSize: "0.82rem", color: "#b42318" }}>
                                {geoError}
                            </p>
                        )}

                        <p className="mb-0 mt-2" style={{ fontSize: "0.78rem", color: "#99a0a8" }}>
                            * Google Maps address may be approximate; directions use accurate map coordinates.
                        </p>
                    </div>
                </div>
            </div>

            {/* ===== CONTENT ===== */}
            <div className="container-xxl pb-4 pt-1">
                <div className="container">
                    {hasData && (
                        <div className="mb-2 d-flex flex-wrap justify-content-center" style={{ gap: 10 }}>
                            {GROUP_ORDER.filter((g) => nearbyGroups[g]?.length).map((g) => (
                                <button
                                    key={g}
                                    onClick={() => setActiveGroup(g)}
                                    style={{
                                        padding: "6px 16px",
                                        borderRadius: 999,
                                        fontWeight: 800,
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "0.9rem",
                                        boxShadow:
                                            activeGroup === g
                                                ? "0 6px 14px rgba(134,184,23,.4)"
                                                : "0 3px 8px rgba(0,0,0,.08)",
                                        background: activeGroup === g ? "#86B817" : "rgba(255,255,255,.95)",
                                        color: activeGroup === g ? "#fff" : "#333",
                                        transition: "all .18s ease",
                                    }}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    )}

                    {nearbyLoading && <p className="mb-0 text-muted text-center">Loading nearby places...</p>}
                    {!nearbyLoading && !hasData && <p className="mb-0 text-muted text-center">No nearby places found.</p>}

                    {visibleEntries.map(([groupName, items]) => {
                        const isExpanded = !!expandedGroups[groupName];
                        const shouldCollapse = items.length > MAX_ITEMS_COLLAPSED;
                        const itemsToShow = isExpanded || !shouldCollapse ? items : items.slice(0, MAX_ITEMS_COLLAPSED);

                        return (
                            <div key={groupName} className="mb-4">
                                <h5 className="mb-3" style={{ fontWeight: 900, color: "#445" }}>
                                    {groupName}
                                </h5>

                                <div className="row g-3">
                                    {itemsToShow.map((place, idx) => {
                                        const props = place?.properties || {};
                                        const name = props?.name || "Unnamed place";
                                        const address = props?.address_line2 || props?.formatted || props?.street || "";
                                        const distanceText = roundMeters(props?.distance);
                                        const directionUrl = buildDirectionLink(origin.lat, origin.lon, place);

                                        return (
                                            <div className="col-md-3 col-sm-6" key={props?.place_id || idx}>
                                                <div
                                                    className="nearby-card h-100"
                                                    style={{
                                                        position: "relative",
                                                        borderRadius: 18,
                                                        padding: "12px 14px",
                                                        background: "linear-gradient(135deg, #ffffff, #f9ffd9)",
                                                        boxShadow: "0 10px 20px rgba(0,0,0,.08)",
                                                        border: "1px solid rgba(0,0,0,.03)",
                                                        transition: "transform .18s ease, box-shadow .18s ease",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                    }}
                                                >
                                                    {distanceText && (
                                                        <div
                                                            style={{
                                                                position: "absolute",
                                                                top: 10,
                                                                right: 10,
                                                                padding: "2px 10px",
                                                                borderRadius: 999,
                                                                fontSize: "0.76rem",
                                                                fontWeight: 700,
                                                                background: "rgba(20,20,20,.85)",
                                                                color: "#fff",
                                                            }}
                                                        >
                                                            {distanceText}
                                                        </div>
                                                    )}

                                                    <div className="d-flex" style={{ gap: 10, marginTop: 4, flex: 1 }}>
                                                        <div
                                                            style={{
                                                                width: 38,
                                                                height: 38,
                                                                borderRadius: 999,
                                                                background: "radial-gradient(circle at 30% 0, #fdff7c, #86B817)",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                flexShrink: 0,
                                                                boxShadow: "0 4px 10px rgba(134,184,23,.45)",
                                                            }}
                                                        >
                                                            <FaConciergeBell size={18} style={{ color: "#fff" }} />
                                                        </div>

                                                        <div style={{ minWidth: 0 }}>
                                                            <a
                                                                href={directionUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{ textDecoration: "none", color: "inherit" }}
                                                                title={name}
                                                            >
                                                                <div
                                                                    style={{
                                                                        fontWeight: 800,
                                                                        fontSize: "0.96rem",
                                                                        marginBottom: 3,
                                                                        color: "#222",
                                                                        display: "-webkit-box",
                                                                        WebkitLineClamp: 2,
                                                                        WebkitBoxOrient: "vertical",
                                                                        overflow: "hidden",
                                                                    }}
                                                                >
                                                                    {name}
                                                                </div>
                                                            </a>

                                                            {address && (
                                                                <div
                                                                    style={{
                                                                        fontSize: "0.82rem",
                                                                        color: "#6c757d",
                                                                        lineHeight: 1.4,
                                                                        display: "-webkit-box",
                                                                        WebkitLineClamp: 2,
                                                                        WebkitBoxOrient: "vertical",
                                                                        overflow: "hidden",
                                                                    }}
                                                                >
                                                                    {address}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="d-flex flex-wrap align-items-center" style={{ gap: 6, marginTop: 10 }}>
                                                        <span
                                                            style={{
                                                                padding: "3px 10px",
                                                                borderRadius: 999,
                                                                fontSize: "0.76rem",
                                                                fontWeight: 750,
                                                                background: "#86B817",
                                                                color: "#fff",
                                                            }}
                                                        >
                                                            {getPlaceTypeLabel(props)}
                                                        </span>

                                                        <span
                                                            style={{
                                                                padding: "3px 10px",
                                                                borderRadius: 999,
                                                                fontSize: "0.74rem",
                                                                fontWeight: 650,
                                                                background: "rgba(0,0,0,.04)",
                                                                color: "#555",
                                                            }}
                                                        >
                                                            {groupName}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {items.length > MAX_ITEMS_COLLAPSED && (
                                    <div className="text-center mt-3">
                                        <button
                                            onClick={() => toggleExpand(groupName)}
                                            style={{
                                                padding: "6px 18px",
                                                borderRadius: 999,
                                                border: "none",
                                                fontWeight: 800,
                                                fontSize: "0.9rem",
                                                background: "#ffffff",
                                                boxShadow: "0 3px 8px rgba(0,0,0,.12)",
                                                color: "#333",
                                            }}
                                        >
                                            {expandedGroups[groupName] ? "Show less" : "Show more"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ✅ PLAN */}
            <NearbyPlan
                open={planOpen}
                onClose={closePlan}
                origin={origin}
                dayPlan={dayPlan}
                onRegenerate={handleBuildPlan}
                onRefreshSlot={handleRefreshSlot}
            />
        </>
    );
};
