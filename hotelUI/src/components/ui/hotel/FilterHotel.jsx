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

const clampInt = (v, min, max, fallback) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.trunc(n)));
};

// ✅ map params (đúng y hệ filter của bạn)
const PRICE_VALUES = new Set(["all", "lt1", "1to2", "gt2"]);
const SORT_VALUES = new Set(["recommended", "priceLow", "priceHigh", "ratingHigh"]);

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

  /* Style chung cho tất cả select (thu nhỏ) */
  const baseSelectStyle = {
    fontSize: 13,
    padding: "4px 0",
    boxShadow: "none",
    textAlignLast: "center",
  };

  /* ===== Lấy params từ URL (q/guests/where/price/rating/sort) ===== */
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setKeyword(q);

    // guests
    const guestsParam = clampInt(searchParams.get("guests"), 1, 99, 1);
    setGuests(guestsParam);

    // where (ưu tiên where; nếu không có thì auto detect từ q như bạn đang làm)
    const whereParam = searchParams.get("where") || "";
    if (whereParam) {
      // match theo VIETNAM_CITIES để select hiển thị đúng label
      const wNorm = normalizeVN(whereParam);
      const matchedCity =
        VIETNAM_CITIES.find((c) => {
          const cNorm = normalizeVN(c);
          return wNorm === cNorm || wNorm.includes(cNorm) || cNorm.includes(wNorm);
        }) || whereParam;

      setLocationFilter(matchedCity);
    } else {
      setLocationFilter(""); // reset trước rồi mới auto detect từ q
      const qNorm = normalizeVN(q);
      if (qNorm) {
        const matchedCity = VIETNAM_CITIES.find((c) => {
          const cNorm = normalizeVN(c);
          return qNorm.includes(cNorm) || cNorm.includes(qNorm);
        });
        if (matchedCity) setLocationFilter(matchedCity);
      }
    }

    // price
    const priceParam = (searchParams.get("price") || "all").trim();
    setPriceRange(PRICE_VALUES.has(priceParam) ? priceParam : "all");

    // rating
    const ratingParam = clampInt(searchParams.get("rating"), 0, 5, 0);
    setSelectedRating(ratingParam);

    // sort
    const sortParam = (searchParams.get("sort") || "recommended").trim();
    setSortBy(SORT_VALUES.has(sortParam) ? sortParam : "recommended");
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
      filtered = filtered.filter((h) => Number(h.rating || 0) >= selectedRating);
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
          // recommended: rating cao trước, rồi giá thấp
          return bRating - aRating || aMin - bMin;
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

  /* Component 1 ô filter (label + select) */
  const FilterItem = ({ label, children, minWidth = 115 }) => (
    <div className="d-flex flex-column align-items-center" style={{ minWidth }}>
      <span
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontWeight: 600,
          color: "var(--muted)",
          marginBottom: 1,
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );

  return (
    <div className="container-xxl py-4">
      <div className="container">
        {/* ===== HEADING ===== */}
        <div className="text-center">
          <div className="heading-line mx-auto" style={{ "--heading-gap": "14px" }}>
            <span style={{ display: "grid", justifyItems: "end", gap: "6px", marginRight: "2px" }}>
              <span className="divider" style={{ "--w": "120px" }} />
              <span className="divider" style={{ "--w": "60px", "--alpha": 0.45 }} />
            </span>

            <h6 className="heading-text text-3xl text-primary text-uppercase" style={{ fontSize: "20px" }}>
              Hotel
            </h6>

            <span style={{ display: "grid", justifyItems: "start", gap: "6px", marginLeft: "2px" }}>
              <span className="divider" style={{ "--w": "120px" }} />
              <span className="divider" style={{ "--w": "60px", "--alpha": 0.45 }} />
            </span>
          </div>

          <h1 className="mt-1 mb-1" style={{ fontSize: "28px" }}>
            Your hotel, your way!
          </h1>

          <p className="text-muted" style={{ fontSize: 13, marginBottom: 20 }}>
            Showing <strong>{resultCount}</strong>{" "}
            {resultCount === 1 ? "result" : "results"}{" "}
            {keyword.trim() ? (
              <>
                for <strong>“{keyword}”</strong>
              </>
            ) : (
              "for all hotels"
            )}
          </p>
        </div>

        {/* ===== FILTER BAR ===== */}
        <div className="d-flex justify-content-center">
          <div
            className="rounded-pill px-3 py-2 d-flex align-items-center flex-wrap shadow-sm"
            style={{ background: "#fff", maxWidth: 950, gap: 18 }}
          >
            {/* ICON + Reset */}
            <div className="d-flex align-items-center" style={{ gap: 8 }}>
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: 34,
                  height: 34,
                  backgroundColor: "rgba(255, 195, 11, 0.15)",
                }}
              >
                <FaFilter style={{ color: "#FFC30B", fontSize: 15 }} />
              </div>

              <button
                type="button"
                onClick={handleClearAll}
                className="btn btn-link p-0"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--primary)",
                  textDecoration: "none",
                }}
              >
                All hotels
              </button>
            </div>

            {/* WHERE */}
            <FilterItem label="Where">
              <select
                className="form-select border-0 p-0"
                style={baseSelectStyle}
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="">All places</option>
                {cityOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FilterItem>

            {/* GUESTS */}
            <FilterItem label="Guests">
              <select
                className="form-select border-0 p-0"
                style={baseSelectStyle}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <option key={g} value={g}>
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
                <option value="all">All prices</option>
                <option value="lt1">Below 100$</option>
                <option value="1to2">100$ – 200$</option>
                <option value="gt2">Above 200$</option>
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
                <option value={0}>All ratings</option>
                <option value={1}>1+ stars</option>
                <option value={2}>2+ stars</option>
                <option value={3}>3+ stars</option>
                <option value={4}>4+ stars</option>
                <option value={5}>5 stars</option>
              </select>
            </FilterItem>

            {/* SORT */}
            <FilterItem label="Sort" minWidth={165}>
              <select
                className="form-select border-0 p-0"
                style={{ ...baseSelectStyle, width: "100%" }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recommended">Recommended</option>
                <option value="priceLow">Low price</option>
                <option value="priceHigh">High price</option>
                <option value="ratingHigh">Top rated</option>
              </select>
            </FilterItem>
          </div>
        </div>
      </div>
    </div>
  );
};
