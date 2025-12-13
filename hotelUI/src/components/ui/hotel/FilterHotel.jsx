// src/components/ui/hotel/FilterHotel.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FaFilter } from "react-icons/fa6";
import { VIETNAM_CITIES } from "@/assets/constants/cities";

/* Chuẩn hoá chữ tiếng Việt bỏ dấu */
const normalizeVN = (str = "") =>
  (str || "")
    .toString()
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

const PRICE_VALUES = new Set(["all", "lt1", "1to2", "gt2"]);
const SORT_VALUES = new Set(["recommended", "priceLow", "priceHigh", "ratingHigh"]);

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

export const FilterHotel = ({ allHotels = [], setHotels }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // ✅ chặn loop: đang “hydrate từ URL” thì không sync ngược lại
  const hydrating = useRef(false);

  const [keyword, setKeyword] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [priceRange, setPriceRange] = useState("all");
  const [selectedRating, setSelectedRating] = useState(0);
  const [guests, setGuests] = useState(1);
  const [sortBy, setSortBy] = useState("recommended");
  const [resultCount, setResultCount] = useState(0);

  const baseSelectStyle = {
    fontSize: 13,
    padding: "4px 0",
    boxShadow: "none",
    textAlignLast: "center",
  };

  // ✅ rule: ít nhất 1 đêm
  const minCheckout = checkIn ? addDays(checkIn, 1) : "";

  /* ===== 1) READ URL -> STATE ===== */
  useEffect(() => {
    hydrating.current = true;

    const q = searchParams.get("q") || "";
    setKeyword(q);

    setGuests(clampInt(searchParams.get("guests"), 1, 99, 1));

    const ci = searchParams.get("checkIn") || "";
    const co = searchParams.get("checkOut") || "";
    setCheckIn(isValidDateStr(ci) ? ci : "");
    setCheckOut(isValidDateStr(co) ? co : "");

    const whereParam = searchParams.get("where") || "";
    if (whereParam) {
      const wNorm = normalizeVN(whereParam);
      const matchedCity =
        VIETNAM_CITIES.find((c) => {
          const cNorm = normalizeVN(c);
          return wNorm === cNorm || wNorm.includes(cNorm) || cNorm.includes(wNorm);
        }) || whereParam;

      setLocationFilter(matchedCity);
    } else {
      setLocationFilter("");
      const qNorm = normalizeVN(q);
      if (qNorm) {
        const matchedCity = VIETNAM_CITIES.find((c) => {
          const cNorm = normalizeVN(c);
          return qNorm.includes(cNorm) || cNorm.includes(qNorm);
        });
        if (matchedCity) setLocationFilter(matchedCity);
      }
    }

    const priceParam = (searchParams.get("price") || "all").trim();
    setPriceRange(PRICE_VALUES.has(priceParam) ? priceParam : "all");

    setSelectedRating(clampInt(searchParams.get("rating"), 0, 5, 0));

    const sortParam = (searchParams.get("sort") || "recommended").trim();
    setSortBy(SORT_VALUES.has(sortParam) ? sortParam : "recommended");

    const t = setTimeout(() => (hydrating.current = false), 0);
    return () => clearTimeout(t);
  }, [searchParams]);

  /* ===== 2) VALIDATE DATE: checkOut >= checkIn + 1 ===== */
  useEffect(() => {
    if (!checkIn) {
      if (checkOut) setCheckOut("");
      return;
    }
    const minCo = addDays(checkIn, 1);
    if (checkOut && checkOut < minCo) setCheckOut(minCo);
  }, [checkIn, checkOut]);

  /* ===== 3) STATE -> URL (NO LOOP) ===== */
  useEffect(() => {
    if (hydrating.current) return;

    const sp = new URLSearchParams(searchParams);

    const setOrDel = (k, v) => {
      const val = String(v ?? "").trim();
      if (!val) sp.delete(k);
      else sp.set(k, val);
    };

    setOrDel("q", keyword);
    setOrDel("where", locationFilter);
    setOrDel("checkIn", checkIn);
    setOrDel("checkOut", checkOut);
    setOrDel("guests", guests);

    setOrDel("price", priceRange === "all" ? "" : priceRange);
    setOrDel("rating", selectedRating > 0 ? selectedRating : "");
    setOrDel("sort", sortBy === "recommended" ? "" : sortBy);

    const next = sp.toString();
    const curr = searchParams.toString();
    if (next === curr) return;

    setSearchParams(sp, { replace: true });
  }, [
    keyword,
    locationFilter,
    checkIn,
    checkOut,
    guests,
    priceRange,
    selectedRating,
    sortBy,
    searchParams,
    setSearchParams,
  ]);

  /* ===== options thành phố ===== */
  const cityOptions = useMemo(() => {
    const exist = new Set();
    (Array.isArray(allHotels) ? allHotels : []).forEach((h) => {
      const text = (h.address || h.city || "").toLowerCase();
      VIETNAM_CITIES.forEach((c) => {
        if (!exist.has(c) && text.includes(c.toLowerCase())) exist.add(c);
      });
    });
    const arr = Array.from(exist);
    return (arr.length ? arr : VIETNAM_CITIES).sort();
  }, [allHotels]);

  /* ===== 4) FILTER HOTEL ===== */
  useEffect(() => {
    if (!Array.isArray(allHotels)) {
      setHotels([]);
      setResultCount(0);
      return;
    }

    let filtered = [...allHotels];

    if (keyword.trim()) {
      const kw = normalizeVN(keyword);
      filtered = filtered.filter((h) =>
        normalizeVN([h.name, h.city, h.address, h.description].filter(Boolean).join(" ")).includes(kw)
      );
    }

    if (locationFilter) {
      const loc = normalizeVN(locationFilter);
      filtered = filtered.filter((h) =>
        normalizeVN([h.city, h.address].filter(Boolean).join(" ")).includes(loc)
      );
    }

    if (guests > 0) {
      filtered = filtered.filter((h) => {
        const cap = Number(h.maxCapacity || 0);
        return Number.isFinite(cap) && cap >= guests;
      });
    }

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

    if (selectedRating > 0) {
      filtered = filtered.filter((h) => Number(h.rating || 0) >= selectedRating);
    }

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
          return bRating - aRating || aMin - bMin;
      }
    });

    setResultCount(filtered.length);
    setHotels(filtered);
  }, [allHotels, keyword, locationFilter, guests, priceRange, selectedRating, sortBy, setHotels]);

  const handleClearAll = () => {
    navigate("/hotel");
    setKeyword("");
    setLocationFilter("");
    setCheckIn("");
    setCheckOut("");
    setPriceRange("all");
    setSelectedRating(0);
    setGuests(1);
    setSortBy("recommended");
  };

  const FilterItem = ({ label, children, minWidth = 110 }) => (
    <div className="d-flex flex-column align-items-center" style={{ minWidth }}>
      <span
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          fontWeight: 600,
          color: "var(--muted)",
          marginBottom: 1,
          whiteSpace: "nowrap",
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
        <div className="text-center">
          <p className="text-muted" style={{ fontSize: 13, marginBottom: 18 }}>
            Showing <strong>{resultCount}</strong> {resultCount === 1 ? "result" : "results"}{" "}
            {keyword.trim() ? (
              <>
                for <strong>“{keyword}”</strong>
              </>
            ) : (
              "for all hotels"
            )}
          </p>
        </div>

        <div className="d-flex justify-content-center">
          {/* ✅ desktop: giữ 1 hàng, mobile: cho wrap */}
          <div
            className="rounded-pill px-3 py-2 d-flex align-items-center shadow-sm filterbar"
            style={{
              background: "#fff",
              maxWidth: 1050,
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <style>{`
              @media (min-width: 992px) {
                .filterbar { flex-wrap: nowrap !important; }
              }
            `}</style>

            {/* ICON + Reset */}
            <div className="d-flex align-items-center" style={{ gap: 8, minWidth: 120, flex: "0 0 auto" }}>
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
                  whiteSpace: "nowrap",
                }}
              >
                All hotels
              </button>
            </div>

            {/* WHERE */}
            <FilterItem label="Where" minWidth={120}>
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

            {/* CHECK-IN */}
            <FilterItem label="Check-in" minWidth={130}>
              <input
                type="date"
                className="form-control border-0 p-0"
                style={{ ...baseSelectStyle, width: "100%" }}
                value={checkIn}
                onChange={(e) => {
                  const next = e.target.value;
                  setCheckIn(next);

                  if (!next) {
                    setCheckOut("");
                    return;
                  }

                  const minCo = addDays(next, 1);
                  if (checkOut && checkOut < minCo) setCheckOut(minCo);
                }}
              />
            </FilterItem>

            {/* CHECK-OUT */}
            <FilterItem label="Check-out" minWidth={130}>
              <input
                type="date"
                className="form-control border-0 p-0"
                style={{ ...baseSelectStyle, width: "100%" }}
                value={checkOut}
                min={minCheckout || undefined}
                disabled={!checkIn}
                onChange={(e) => {
                  const next = e.target.value;
                  if (checkIn && next && minCheckout && next < minCheckout) return;
                  setCheckOut(next);
                }}
              />
            </FilterItem>

            {/* GUESTS */}
            <FilterItem label="Guests" minWidth={95}>
              <select
                className="form-select border-0 p-0"
                style={baseSelectStyle}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value) || 1)}
              >
                {[1, 2, 3, 4, 5, 6].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </FilterItem>

            {/* PRICE */}
            <FilterItem label="Price" minWidth={105}>
              <select
                className="form-select border-0 p-0"
                style={baseSelectStyle}
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
              >
                <option value="all">All</option>
                <option value="lt1">{"<100$"}</option>
                <option value="1to2">100–200$</option>
                <option value="gt2">{">200$"}</option>
              </select>
            </FilterItem>

            {/* RATING */}
            <FilterItem label="Rating" minWidth={105}>
              <select
                className="form-select border-0 p-0"
                style={baseSelectStyle}
                value={selectedRating}
                onChange={(e) => setSelectedRating(Number(e.target.value) || 0)}
              >
                <option value={0}>All</option>
                <option value={3}>3+</option>
                <option value={4}>4+</option>
                <option value={5}>5</option>
              </select>
            </FilterItem>

            {/* SORT */}
            <FilterItem label="Sort" minWidth={140}>
              <select
                className="form-select border-0 p-0"
                style={{ ...baseSelectStyle, width: "100%" }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recommended">Recommended</option>
                <option value="priceLow">Price ↑</option>
                <option value="priceHigh">Price ↓</option>
                <option value="ratingHigh">Rating</option>
              </select>
            </FilterItem>
          </div>
        </div>
      </div>
    </div>
  );
};
