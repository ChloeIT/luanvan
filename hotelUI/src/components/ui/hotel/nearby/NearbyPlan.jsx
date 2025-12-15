// src/components/ui/hotel/nearby/NearbyPlan.jsx
import React, { useMemo } from "react";
import { FiX, FiExternalLink } from "react-icons/fi";
import { roundMeters, buildDirectionLink, normalizeCats } from "./nearby.helpers";

/* ===================== helpers ===================== */
const getPlaceCoords = (place) => {
    const [lon, lat] = place?.geometry?.coordinates || [];
    const latNum = Number(lat);
    const lonNum = Number(lon);
    if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) return null;
    return { lat: latNum, lon: lonNum };
};

const buildMultiStopDirections = (origin, stops, travelMode = "driving") => {
    const pts = (stops || []).filter(Boolean);
    if (!origin?.lat || !origin?.lon || pts.length < 2) return null;

    const url = new URL("https://www.google.com/maps/dir/");
    url.searchParams.set("api", "1");
    url.searchParams.set("origin", `${origin.lat},${origin.lon}`);
    url.searchParams.set(
        "destination",
        `${pts[pts.length - 1].lat},${pts[pts.length - 1].lon}`
    );

    const waypoints = pts
        .slice(0, -1)
        .map((p) => `${p.lat},${p.lon}`)
        .join("|");
    if (waypoints) url.searchParams.set("waypoints", waypoints);

    url.searchParams.set("travelmode", travelMode);
    return url.toString();
};

const getKind = (place) => {
    const cats = normalizeCats(place?.properties);

    if (cats.includes("restaurant") || cats.includes("fast_food") || cats.includes("cafe") || cats.includes("bar")) {
        return { key: "food", label: "Food", emoji: "🍜" };
    }

    if (
        cats.includes("tourism") ||
        cats.includes("attraction") ||
        cats.includes("park") ||
        cats.includes("leisure") ||
        cats.includes("entertainment") ||
        cats.includes("museum") ||
        cats.includes("cinema")
    ) {
        return { key: "play", label: "Play", emoji: "🎡" };
    }

    return { key: "other", label: "Place", emoji: "📍" };
};

/* ===================== UI ===================== */
const Badge = ({ kind }) => (
    <span
        style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "2px 7px",
            borderRadius: 999,
            fontSize: 10.5,
            fontWeight: 900,
            background:
                kind.key === "food"
                    ? "rgba(134,184,23,.14)"
                    : kind.key === "play"
                        ? "rgba(253,255,124,.55)"
                        : "rgba(0,0,0,.06)",
            border: "1px solid rgba(0,0,0,.06)",
            color: "#111827",
            whiteSpace: "nowrap",
        }}
        title={kind.label}
    >
        <span>{kind.emoji}</span>
        {kind.label}
    </span>
);

const RefreshBtn = ({ onClick, disabled }) => (
    <button
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick?.();
        }}
        disabled={!!disabled}
        style={{
            width: 30,
            height: 30,
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,.10)",
            background: "rgba(255,255,255,.92)",
            cursor: disabled ? "not-allowed" : "pointer",
            display: "grid",
            placeItems: "center",
            opacity: disabled ? 0.55 : 1,
            fontWeight: 950,
        }}
        title="Đổi địa điểm khác"
    >
        ↻
    </button>
);

const PlanCard = ({ title, time, place, origin, onRefresh }) => {
    const kind = getKind(place);
    const props = place?.properties || {};
    const name = props?.name || "Unnamed place";
    const address = props?.address_line2 || props?.formatted || props?.street || "";
    const distanceText = roundMeters(props?.distance);
    const openUrl = place ? buildDirectionLink(origin?.lat, origin?.lon, place) : null;

    return (
        <div
            style={{
                padding: "8px 9px",
                borderRadius: 14,
                minHeight: 70,
                background: place ? "rgba(255,255,255,.98)" : "rgba(0,0,0,.02)",
                border: place ? "1px solid rgba(0,0,0,.08)" : "1px dashed rgba(0,0,0,.12)",
                boxShadow: place ? "0 8px 16px rgba(0,0,0,.045)" : "none",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 10,
            }}
        >
            {/* Left */}
            <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <div style={{ fontWeight: 950, fontSize: 12, color: "#111827" }}>
                        {title}{" "}
                        <span style={{ color: "#6b7280", fontWeight: 900 }}>({time})</span>
                    </div>

                    {place && <Badge kind={kind} />}

                    {place && distanceText && (
                        <span
                            style={{
                                marginLeft: "auto",
                                fontSize: 10,
                                fontWeight: 950,
                                padding: "2px 7px",
                                borderRadius: 999,
                                background: "rgba(17,24,39,.85)",
                                color: "#fff",
                                whiteSpace: "nowrap",
                            }}
                            title="Distance"
                        >
                            {distanceText}
                        </span>
                    )}
                </div>

                {place ? (
                    <>
                        <div
                            style={{
                                fontWeight: 950,
                                fontSize: 13,
                                color: "#111827",
                                lineHeight: 1.2,
                                display: "-webkit-box",
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                            }}
                            title={name}
                        >
                            {name}
                        </div>

                        {address && (
                            <div
                                style={{
                                    marginTop: 3,
                                    fontSize: 11,
                                    color: "#6b7280",
                                    lineHeight: 1.25,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 1,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                }}
                                title={address}
                            >
                                {address}
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ fontSize: 11.5, color: "#9ca3af", fontWeight: 700 }}>
                        Slot trống — chưa đủ địa điểm phù hợp
                    </div>
                )}
            </div>

            {/* Right */}
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <RefreshBtn onClick={onRefresh} />
                {place && (
                    <a
                        href={openUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "6px 9px",
                            borderRadius: 999,
                            textDecoration: "none",
                            background: "linear-gradient(135deg, rgba(134,184,23,.18), rgba(134,184,23,.10))",
                            color: "#2f6b09",
                            border: "1px solid rgba(134,184,23,.35)",
                            fontWeight: 950,
                            fontSize: 11.5,
                            whiteSpace: "nowrap",
                        }}
                        title="Open in Google Maps"
                    >
                        <FiExternalLink size={13} />
                        View
                    </a>
                )}
            </div>
        </div>
    );
};

const Section = ({ icon, title, subtitle, children }) => (
    <div
        style={{
            borderRadius: 16,
            background: "rgba(255,255,255,.72)",
            border: "1px solid rgba(0,0,0,.08)",
            padding: 9,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflow: "hidden",
        }}
    >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ fontWeight: 950, fontSize: 13, color: "#111827" }}>
                {icon} {title}
            </div>
            <div style={{ color: "#6b7280", fontSize: 11.5, fontWeight: 800 }}>
                {subtitle}
            </div>
        </div>

        <div style={{ display: "grid", gap: 8, flex: 1 }}>{children}</div>
    </div>
);

/* ===================== slots ===================== */
const PLAY_SLOTS = [
    { title: "Morning", time: "09:00" },
    { title: "Late Morning", time: "11:00" },
    { title: "Afternoon", time: "15:00" },
    { title: "Evening Walk", time: "18:00" },
];

const FOOD_SLOTS = [
    { title: "Breakfast", time: "08:00" },
    { title: "Lunch", time: "12:00" },
    { title: "Cafe", time: "16:30" },
    { title: "Dinner", time: "19:30" },
];

export const NearbyPlan = ({
    open,
    onClose,
    origin,
    dayPlan,
    onRegenerate,
    onRefreshSlot,
}) => {
    const playList = useMemo(() => {
        if (Array.isArray(dayPlan?.play)) return dayPlan.play.slice(0, 4);
        return [dayPlan?.morning, dayPlan?.afternoon, null, null];
    }, [dayPlan]);

    const foodList = useMemo(() => {
        if (Array.isArray(dayPlan?.food)) return dayPlan.food.slice(0, 4);
        return [dayPlan?.lunch, dayPlan?.evening, null, null];
    }, [dayPlan]);

    const routeStops = useMemo(() => {
        const orderedPlaces = [
            playList[0],
            foodList[0],
            playList[1],
            foodList[1],
            playList[2],
            foodList[2],
            playList[3],
            foodList[3],
        ].filter(Boolean);

        return orderedPlaces.map(getPlaceCoords).filter(Boolean);
    }, [playList, foodList]);

    const routeUrl = useMemo(
        () => buildMultiStopDirections(origin, routeStops, "driving"),
        [origin, routeStops]
    );

    if (!open) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,.35)",
                zIndex: 3000,
                display: "grid",
                justifyItems: "center",
                alignItems: "flex-start",
                paddingTop: 85,
                paddingInline: 12,
                paddingBottom: 12,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "min(700px, 92vw)",
                    borderRadius: 18,
                    background: "rgba(255,255,255,.92)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(0,0,0,.10)",
                    boxShadow: "0 18px 52px rgba(0,0,0,.20)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    fontSize: 13,
                    lineHeight: 1.35,
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "10px 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        borderBottom: "1px solid rgba(0,0,0,.06)",
                    }}
                >
                    <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 950, fontSize: 14.5, color: "#111827" }}>
                            ✨ Your 1-day plan
                        </div>
                        <div style={{ fontSize: 11.5, color: "#6b7280", fontWeight: 800 }}>
                            Based on: <span style={{ color: "#86B817" }}>{origin?.label}</span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 999,
                            border: "none",
                            cursor: "pointer",
                            background: "rgba(0,0,0,.06)",
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                        }}
                        title="Close"
                    >
                        <FiX size={16} />
                    </button>
                </div>

                {/* Body */}
                <div
                    className="nearby-plan-grid"
                    style={{
                        padding: 10,
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                        overflow: "hidden",
                        alignItems: "stretch",
                    }}
                >
                    <Section icon="🎡" title="Vui chơi / tham quan" >
                        {PLAY_SLOTS.map((s, idx) => (
                            <PlanCard
                                key={`${s.title}-${idx}`}
                                title={s.title}
                                time={s.time}
                                place={playList[idx]}
                                origin={origin}
                                onRefresh={() => onRefreshSlot?.("play", idx)}
                            />
                        ))}
                    </Section>

                    <Section icon="🍜" title="Ăn uống / cafe" >
                        {FOOD_SLOTS.map((s, idx) => (
                            <PlanCard
                                key={`${s.title}-${idx}`}
                                title={s.title}
                                time={s.time}
                                place={foodList[idx]}
                                origin={origin}
                                onRefresh={() => onRefreshSlot?.("food", idx)}
                            />
                        ))}
                    </Section>

                    <style>{`
            @media (max-width: 720px) {
              .nearby-plan-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: "10px 12px",
                        borderTop: "1px solid rgba(0,0,0,.06)",
                        display: "flex",
                        gap: 10,
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                    }}
                >
                    <button
                        onClick={onRegenerate}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 999,
                            border: "1px solid rgba(0,0,0,.12)",
                            background: "#fff",
                            fontWeight: 950,
                            fontSize: 12.5,
                            cursor: "pointer",
                        }}
                    >
                        Regenerate
                    </button>

                    <a
                        href={routeUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                            if (!routeUrl) e.preventDefault();
                        }}
                        style={{
                            padding: "8px 12px",
                            borderRadius: 999,
                            border: "none",
                            background: "linear-gradient(135deg, #86B817, #6aa30f)",
                            color: "#fff",
                            fontWeight: 950,
                            fontSize: 12.5,
                            textDecoration: "none",
                            boxShadow: "0 10px 16px rgba(134,184,23,.26)",
                            opacity: routeUrl ? 1 : 0.55,
                            pointerEvents: routeUrl ? "auto" : "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            whiteSpace: "nowrap",
                        }}
                        title={routeUrl ? "Open full route in Google Maps" : "Not enough stops to build a route"}
                    >
                        <FiExternalLink size={14} />
                        Open full route
                    </a>
                </div>
            </div>
        </div>
    );
};
