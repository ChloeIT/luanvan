// src/components/ui/hotel/HotelNearby.jsx
import React, { useEffect, useMemo, useState } from "react";
import { FaConciergeBell } from "react-icons/fa";
import { getNearbyPlaces } from "../../../services/map";

// ===== Helper nhóm loại địa điểm =====
const getPlaceGroup = (props) => {
    const cats = (props.categories || []).join(",").toLowerCase();

    if (cats.includes("catering")) return "Food & Drink";
    if (cats.includes("commercial")) return "Shopping";
    if (
        cats.includes("leisure") ||
        cats.includes("entertainment") ||
        cats.includes("tourism")
    )
        return "Leisure & Attractions";
    if (cats.includes("healthcare")) return "Health & Medical";
    if (cats.includes("education")) return "Education";
    if (cats.includes("service") || cats.includes("finance"))
        return "Services & Finance";
    return "Others";
};

const getPlaceTypeLabel = (props) => {
    const cats = (props.categories || []).join(",").toLowerCase();

    if (cats.includes("restaurant")) return "Restaurant";
    if (cats.includes("cafe")) return "Cafe";
    if (cats.includes("bar")) return "Bar";
    if (cats.includes("fast_food")) return "Fast food";

    if (cats.includes("supermarket")) return "Supermarket";
    if (cats.includes("mall")) return "Shopping Mall";
    if (cats.includes("shop")) return "Shop";

    if (cats.includes("park")) return "Park";
    if (cats.includes("playground")) return "Playground";
    if (cats.includes("cinema")) return "Cinema";
    if (cats.includes("attraction")) return "Attraction";

    if (cats.includes("hospital")) return "Hospital";
    if (cats.includes("clinic")) return "Clinic";
    if (cats.includes("pharmacy")) return "Pharmacy";

    if (cats.includes("school")) return "School";
    if (cats.includes("university")) return "University";

    if (cats.includes("bank")) return "Bank";
    if (cats.includes("post")) return "Post office";

    return "Place";
};

// Thứ tự group để hiển thị
const GROUP_ORDER = [
    "Food & Drink",
    "Shopping",
    "Leisure & Attractions",
    "Education",
    "Health & Medical",
    "Services & Finance",
    "Others",
];

// 👉 Chỉ hiện 4 item khi thu gọn (1 hàng)
const MAX_ITEMS_COLLAPSED = 4;

/** Build link Google Maps chỉ đường từ (hotelLat, hotelLon) tới place */
const buildDirectionLink = (hotelLat, hotelLon, place) => {
    const props = place.properties || {};
    const coords = place.geometry?.coordinates || []; // [lon, lat]
    const [placeLon, placeLat] = coords;

    let url = "https://www.google.com/maps/dir/?api=1";

    if (hotelLat && hotelLon) {
        url += `&origin=${hotelLat},${hotelLon}`;
    }

    if (placeLat && placeLon) {
        url += `&destination=${placeLat},${placeLon}`;
    } else {
        const destQuery = encodeURIComponent(
            props.formatted || props.address_line2 || props.name || ""
        );
        url += `&destination=${destQuery}`;
    }

    url += "&travelmode=driving";
    return url;
};

export const HotelNearby = ({ hotel }) => {
    const [nearbyGroups, setNearbyGroups] = useState({});
    const [nearbyLoading, setNearbyLoading] = useState(false);
    const [activeGroup, setActiveGroup] = useState(null);
    const [expandedGroups, setExpandedGroups] = useState({}); // { "Food & Drink": true/false }

    // 👉 Tính sẵn tọa độ khách sạn để dùng cả cho fetch và build link
    const hotelLat =
        hotel?.latitude ?? hotel?.lat ?? hotel?.locationLat ?? null;
    const hotelLon =
        hotel?.longitude ?? hotel?.lng ?? hotel?.locationLng ?? null;

    useEffect(() => {
        if (!hotel) return;
        if (!hotelLat || !hotelLon) return;

        setNearbyLoading(true);

        getNearbyPlaces(hotelLat, hotelLon)
            .then((list) => {
                const groups = (list || []).reduce((acc, item) => {
                    const props = item.properties || {};
                    const group = getPlaceGroup(props);
                    if (!acc[group]) acc[group] = [];
                    acc[group].push(item);
                    return acc;
                }, {});
                setNearbyGroups(groups);
            })
            .finally(() => setNearbyLoading(false));
    }, [hotel, hotelLat, hotelLon]);

    // Sắp xếp group
    const orderedEntries = useMemo(() => {
        const entries = Object.entries(nearbyGroups);
        return entries.sort(([g1], [g2]) => {
            const i1 = GROUP_ORDER.indexOf(g1);
            const i2 = GROUP_ORDER.indexOf(g2);
            const a = i1 === -1 ? GROUP_ORDER.length : i1;
            const b = i2 === -1 ? GROUP_ORDER.length : i2;
            return a - b;
        });
    }, [nearbyGroups]);

    const hasData = orderedEntries.length > 0;

    // Auto chọn group đầu tiên
    useEffect(() => {
        if (!hasData) return;
        if (!activeGroup || !nearbyGroups[activeGroup]) {
            setActiveGroup(orderedEntries[0][0]);
        }
    }, [hasData, orderedEntries, activeGroup, nearbyGroups]);

    if (!hotel) return null;

    // Nhóm đang hiển thị
    const visibleEntries = orderedEntries.filter(
        ([group]) => group === activeGroup
    );

    const toggleExpand = (groupName) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [groupName]: !prev[groupName],
        }));
    };

    return (
        <>
            {/* ===== TITLE ===== */}
            <div className="container-xxl pt-2 pb-3">
                <div className="container">
                    <div className="text-center wow fadeInUp" data-wow-delay="0.05s">
                        <div
                            className="heading-line mx-auto"
                            style={{ "--heading-gap": "14px" }}
                        >
                            <span
                                style={{
                                    display: "grid",
                                    justifyItems: "end",
                                    gap: "6px",
                                    marginRight: "2px",
                                }}
                            >
                                <span className="divider" style={{ "--w": "120px" }} />
                                <span
                                    className="divider"
                                    style={{ "--w": "60px", "--alpha": 0.45 }}
                                />
                            </span>

                            <h6 className="heading-text text-3xl text-primary text-uppercase">
                                Nearby
                            </h6>

                            <span
                                style={{
                                    display: "grid",
                                    justifyItems: "start",
                                    gap: "6px",
                                    marginLeft: "2px",
                                }}
                            >
                                <span className="divider" style={{ "--w": "120px" }} />
                                <span
                                    className="divider"
                                    style={{ "--w": "60px", "--alpha": 0.45 }}
                                />
                            </span>
                        </div>

                        <h1 className="mb-2">Nearby Places</h1>
                        <p
                            className="mb-0"
                            style={{ color: "#6c757d", fontSize: "0.95rem" }}
                        >
                            Explore restaurants, shops, parks and services around this hotel.
                        </p>
                    </div>
                </div>
            </div>

            {/* ===== CONTENT ===== */}
            <div className="container-xxl pb-4 pt-1">
                <div className="container">
                    {/* Tabs */}
                    {hasData && (
                        <div
                            className="mb-4 d-flex flex-wrap justify-content-center"
                            style={{ gap: 10 }}
                        >
                            {GROUP_ORDER.filter((g) => nearbyGroups[g]).map((g) => (
                                <button
                                    key={g}
                                    onClick={() => setActiveGroup(g)}
                                    style={{
                                        padding: "6px 16px",
                                        borderRadius: 999,
                                        fontWeight: 600,
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "0.9rem",
                                        boxShadow:
                                            activeGroup === g
                                                ? "0 6px 14px rgba(134,184,23,.4)"
                                                : "0 3px 8px rgba(0,0,0,.08)",
                                        background:
                                            activeGroup === g ? "#86B817" : "rgba(255,255,255,.95)",
                                        color: activeGroup === g ? "#fff" : "#333",
                                        transition: "all .18s ease",
                                    }}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    )}

                    {nearbyLoading && (
                        <p className="mb-0 text-muted text-center">
                            Loading nearby places...
                        </p>
                    )}

                    {!nearbyLoading && !hasData && (
                        <p className="mb-0 text-muted text-center">
                            No nearby places found.
                        </p>
                    )}

                    {/* Chỉ render group đang chọn */}
                    {visibleEntries.map(([groupName, items]) => {
                        const isExpanded = !!expandedGroups[groupName];
                        const shouldCollapse = items.length > MAX_ITEMS_COLLAPSED;
                        const itemsToShow =
                            isExpanded || !shouldCollapse
                                ? items
                                : items.slice(0, MAX_ITEMS_COLLAPSED);

                        return (
                            <div key={groupName} className="mb-4">
                                <h5 className="mb-3" style={{ fontWeight: 800, color: "#445" }}>
                                    {groupName}
                                </h5>

                                <div className="row g-3">
                                    {itemsToShow.map((place, idx) => {
                                        const props = place.properties || {};
                                        const name = props.name || "Unnamed place";
                                        const address =
                                            props.address_line2 || props.formatted || props.street || "";
                                        const distance =
                                            typeof props.distance === "number"
                                                ? Math.round(props.distance)
                                                : null;

                                        const directionUrl = buildDirectionLink(
                                            hotelLat,
                                            hotelLon,
                                            place
                                        );

                                        return (
                                            <div
                                                className="col-md-3 col-sm-6"
                                                key={props.place_id || idx}
                                            >
                                                <div
                                                    className="nearby-card h-100"
                                                    style={{
                                                        position: "relative",
                                                        borderRadius: 18,
                                                        padding: "12px 14px 12px 14px",
                                                        background:
                                                            "linear-gradient(135deg, #ffffff, #f9ffd9)",
                                                        boxShadow: "0 10px 20px rgba(0,0,0,.08)",
                                                        border: "1px solid rgba(0,0,0,.03)",
                                                        transition:
                                                            "transform .18s ease, box-shadow .18s ease",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                    }}
                                                >
                                                    {/* distance pill */}
                                                    {distance != null && (
                                                        <div
                                                            style={{
                                                                position: "absolute",
                                                                top: 10,
                                                                right: 10,
                                                                padding: "2px 10px",
                                                                borderRadius: 999,
                                                                fontSize: "0.76rem",
                                                                fontWeight: 600,
                                                                background: "rgba(20,20,20,.85)",
                                                                color: "#fff",
                                                            }}
                                                        >
                                                            ~ {distance} m
                                                        </div>
                                                    )}

                                                    {/* icon + text */}
                                                    <div
                                                        className="d-flex"
                                                        style={{ gap: 10, marginTop: 4, flex: 1 }}
                                                    >
                                                        <div
                                                            style={{
                                                                width: 38,
                                                                height: 38,
                                                                borderRadius: "999px",
                                                                background:
                                                                    "radial-gradient(circle at 30% 0, #fdff7c, #86B817)",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                flexShrink: 0,
                                                                boxShadow:
                                                                    "0 4px 10px rgba(134,184,23,.45)",
                                                            }}
                                                        >
                                                            <FaConciergeBell
                                                                size={18}
                                                                style={{ color: "#fff" }}
                                                            />
                                                        </div>

                                                        <div style={{ minWidth: 0 }}>
                                                            {/* 👉 Name: clickable, mở Google Maps trong tab mới */}
                                                            <a
                                                                href={directionUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    textDecoration: "none",
                                                                    color: "inherit",
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        fontWeight: 750,
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

                                                    {/* Tag footer */}
                                                    <div
                                                        className="d-flex flex-wrap align-items-center"
                                                        style={{ gap: 6, marginTop: 10 }}
                                                    >
                                                        <span
                                                            style={{
                                                                padding: "3px 10px",
                                                                borderRadius: 999,
                                                                fontSize: "0.76rem",
                                                                fontWeight: 650,
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
                                                                fontWeight: 600,
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

                                {/* Nút Show more / Show less nếu group có > 4 item */}
                                {shouldCollapse && (
                                    <div className="text-center mt-3">
                                        <button
                                            onClick={() => toggleExpand(groupName)}
                                            style={{
                                                padding: "6px 18px",
                                                borderRadius: 999,
                                                border: "none",
                                                fontWeight: 600,
                                                fontSize: "0.9rem",
                                                background: "#ffffff",
                                                boxShadow: "0 3px 8px rgba(0,0,0,.12)",
                                                color: "#333",
                                            }}
                                        >
                                            {isExpanded ? "Show less" : "Show more"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};
