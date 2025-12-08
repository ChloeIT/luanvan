// src/components/ui/hotel/FilterHotel.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FaFilter } from "react-icons/fa6";
import { VIETNAM_CITIES } from "@/assets/constants/cities";

/* Chuẩn hoá chữ tiếng Việt bỏ dấu */
const normalizeVN = (str = "") =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

export const FilterHotel = ({ hotels = [], setHotels }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [locationFilter, setLocationFilter] = useState(""); // WHERE
  const [priceRange, setPriceRange] = useState("all");      // PRICE
  const [selectedRating, setSelectedRating] = useState(0);  // RATING
  const [guests, setGuests] = useState(1);                  // GUESTS
  const [sortBy, setSortBy] = useState("recommended");      // SORT
  const [resultCount, setResultCount] = useState(0);

  /* Style chung cho tất cả select */
  const baseSelectStyle = {
    fontSize: 14,
    boxShadow: "none",
    textAlignLast: "center", // căn giữa item đang hiển thị
    textAlign: "center",     // căn giữa dropdown khi mở
  };

  /* ===== Lấy keyword + guests + auto detect city ===== */
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setKeyword(q);

    const guestsParam = Number(searchParams.get("guests"));
    if (Number.isFinite(guestsParam) && guestsParam > 0) {
      setGuests(guestsParam);
    }

    const qNorm = normalizeVN(q);
    if (qNorm) {
      const matchedCity = VIETNAM_CITIES.find((c) => {
        const cNorm = normalizeVN(c);
        return qNorm.includes(cNorm) || cNorm.includes(qNorm);
      });
      if (matchedCity) setLocationFilter(matchedCity);
    }
  }, [searchParams]);

  /* ===== Lấy danh sách thành phố từ hotel ===== */
  const cityOptions = useMemo(() => {
    const exist = new Set();

    hotels.forEach((h) => {
      const text = (h.address || h.city || "").toLowerCase();
      VIETNAM_CITIES.forEach((c) => {
        if (!exist.has(c) && text.includes(c.toLowerCase())) {
          exist.add(c);
        }
      });
    });

    const arr = Array.from(exist);
    return (arr.length ? arr : VIETNAM_CITIES).sort();
  }, [hotels]);

  /* ===== LỌC HOTEL ===== */
  useEffect(() => {
    if (!Array.isArray(hotels)) {
      setHotels([]);
      setResultCount(0);
      return;
    }

    let filtered = [...hotels];

    /* keyword */
    if (keyword.trim()) {
      const kw = normalizeVN(keyword);
      filtered = filtered.filter((h) =>
        normalizeVN(
          [h.name, h.city, h.address, h.description].filter(Boolean).join(" ")
        ).includes(kw)
      );
    }

    /* WHERE */
    if (locationFilter) {
      const loc = normalizeVN(locationFilter);
      filtered = filtered.filter((h) =>
        normalizeVN([h.city, h.address].filter(Boolean).join(" ")).includes(loc)
      );
    }

    /* GUESTS */
    if (guests > 0) {
      filtered = filtered.filter((h) => {
        const cap = Number(h.maxCapacity || 0);
        return Number.isFinite(cap) && cap >= guests;
      });
    }

    /* PRICE (min – max) */
    filtered = filtered.filter((h) => {
      const minP = Number(h.minPrice);
      const maxP = Number(h.maxPrice ?? h.minPrice);

      if (!Number.isFinite(minP) && !Number.isFinite(maxP)) return false;

      const low = Number.isFinite(minP) ? minP : maxP;
      const high = Number.isFinite(maxP) ? maxP : minP;

      switch (priceRange) {
        case "lt1":
          return low < 100;
        case "1to2":
          return high >= 100 && low <= 200;
        case "gt2":
          return high > 200;
        default:
          return true;
      }
    });

    /* RATING */
    if (selectedRating > 0) {
      filtered = filtered.filter(
        (h) => Number(h.rating || 0) >= selectedRating
      );
    }

    /* SORT */
    filtered.sort((a, b) => {
      const aMin = Number(a.minPrice ?? Infinity);
      const bMin = Number(b.minPrice ?? Infinity);
      const aRating = Number(a.rating ?? 0);
      const bRating = Number(b.rating ?? 0);

      switch (sortBy) {
        case "priceLow":
          return aMin - bMin;
        case "priceHigh":
          return bMin - aMin;
        case "ratingHigh":
          return bRating - aRating || aMin - bMin;
        default:
          return bRating - aRating || aMin - bMin; // recommended
      }
    });

    setResultCount(filtered.length);
    setHotels(filtered);
  }, [
    hotels,
    keyword,
    locationFilter,
    priceRange,
    selectedRating,
    guests,
    sortBy,
    setHotels,
  ]);

  /* HANDLERS */
  const handleClearAll = () => {
    navigate("/hotel");
    setKeyword("");
    setLocationFilter("");
    setPriceRange("all");
    setSelectedRating(0);
    setGuests(1);
    setSortBy("recommended");
  };

  /* Component một dropdown (giúp code gọn + căn giữa perfect) */
  const FilterItem = ({ label, children, minWidth = 130 }) => (
    <div
      className="d-flex flex-column align-items-center"
      style={{ minWidth }}
    >
      <span
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 700,
          color: "var(--muted)",
          marginBottom: 2,
          textAlign: "center",
          width: "100%",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );

  return (
    <div className="container-xxl py-5 destination">
      <div className="container">

        {/* TITLE */}
        <div className="text-center">
          <h2 className="mb-1">Your hotel, your way!</h2>
          <p className="text-muted mb-4">
            Showing <strong>{resultCount}</strong>{" "}
            {resultCount === 1 ? "result" : "results"}{" "}
            {keyword.trim() ? (
              <>for <strong>“{keyword}”</strong></>
            ) : (
              "for all hotels"
            )}
          </p>
        </div>

        {/* FILTER BAR */}
        <div className="d-flex justify-content-center">
          <div
            className="themed-surface shadow-sm px-4 py-3 rounded-pill d-flex align-items-center w-100 flex-wrap"
            style={{
              maxWidth: 1000,
              gap: 24,
              background: "#fff",
            }}
          >
            {/* ICON + Reset */}
            <div className="d-flex align-items-center" style={{ gap: 12 }}>
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: "rgba(255, 195, 11, 0.12)",
                }}
              >
                <FaFilter style={{ color: "#FFC30B", fontSize: 18 }} />
              </div>

              <div className="d-flex flex-column">
                {/* <span
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 700,
                    color: "var(--muted)",
                  }}
                >
                  Filters
                </span> */}
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="btn btn-link p-0"
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--primary)",
                    textDecoration: "none",
                  }}
                >
                  All hotels
                </button>
              </div>
            </div>

            {/* WHERE */}
            <FilterItem label="Where">
              <select
                className="form-select border-0 p-0"
                style={baseSelectStyle}
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option style={{ textAlign: "center" }} value="">All places</option>
                {cityOptions.map((c) => (
                  <option key={c} style={{ textAlign: "center" }} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FilterItem>

            {/* GUESTS */}
            <FilterItem label="Guests" minWidth={110}>
              <select
                className="form-select border-0 p-0"
                style={baseSelectStyle}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <option key={g} style={{ textAlign: "center" }} value={g}>
                    {g} guest{g > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </FilterItem>

            {/* PRICE */}
            <FilterItem label="Price">
              <select
                className="form-select border-0 p-0"
                style={baseSelectStyle}
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
              >
                <option style={{ textAlign: "center" }} value="all">All prices</option>
                <option style={{ textAlign: "center" }} value="lt1">Below 100$</option>
                <option style={{ textAlign: "center" }} value="1to2">100$ – 200$</option>
                <option style={{ textAlign: "center" }} value="gt2">Above 200$</option>
              </select>
            </FilterItem>

            {/* RATING */}
            <FilterItem label="Rating">
              <select
                className="form-select border-0 p-0"
                style={baseSelectStyle}
                value={selectedRating}
                onChange={(e) => setSelectedRating(Number(e.target.value))}
              >
                <option style={{ textAlign: "center" }} value={0}>All ratings</option>
                <option style={{ textAlign: "center" }} value={1}>1+ stars</option>
                <option style={{ textAlign: "center" }} value={2}>2+ stars</option>
                <option style={{ textAlign: "center" }} value={3}>3+ stars</option>
                <option style={{ textAlign: "center" }} value={4}>4+ stars</option>
                <option style={{ textAlign: "center" }} value={5}>5 stars</option>
              </select>
            </FilterItem>

            {/* SORT – rộng hơn các ô khác */}
            <FilterItem label="Sort" minWidth={180}>   {/* tăng minWidth từ 130 → 180 */}
              <select
                className="form-select border-0 p-0"
                style={{
                  ...baseSelectStyle,
                  width: "100%",         // select chiếm hết chiều ngang FilterItem
                }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option style={{ textAlign: "center" }} value="recommended">Recommended</option>
                <option style={{ textAlign: "center" }} value="priceLow">Low price</option>
                <option style={{ textAlign: "center" }} value="priceHigh">High price</option>
                <option style={{ textAlign: "center" }} value="ratingHigh">Top rated</option>
              </select>
            </FilterItem>

          </div>
        </div>
      </div>
    </div>
  );
};
