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
const SORT_VALUES = new Set([
  "recommended",
  "priceLow",
  "priceHigh",
  "ratingHigh",
]);

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
          return (
            wNorm === cNorm || wNorm.includes(cNorm) || cNorm.includes(wNorm)
          );
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
        normalizeVN(
          [h.name, h.city, h.address, h.description].filter(Boolean).join(" ")
        ).includes(kw)
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
  }, [
    allHotels,
    keyword,
    locationFilter,
    guests,
    priceRange,
    selectedRating,
    sortBy,
    setHotels,
  ]);

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

  // ===== Mini “pill” item (dùng cho mobile grid & desktop) =====
  const FilterItem = ({ label, children }) => (
    <div className="sb-filter__item">
      <div className="sb-filter__label">{label}</div>
      <div className="sb-filter__field">{children}</div>
    </div>
  );

  return (
    <div className="container-xxl py-4">
      <style>{`
        /* ===== Filter bar responsive (inline style, không cần file css) ===== */

        .sb-filterbar{
          background:#fff;
          border:1px solid rgba(0,0,0,.06);
          box-shadow:0 10px 25px rgba(0,0,0,.12);
          width:100%;
          max-width:1050px;
        }

        .sb-filter__label{
          font-size:10px;
          text-transform:uppercase;
          letter-spacing:.08em;
          font-weight:900;
          color:var(--muted);
          margin-bottom:2px;
          white-space:nowrap;
          text-align:center;
        }

        .sb-filter__field select,
        .sb-filter__field input{
          width:100%;
          border:0 !important;
          outline:none !important;
          background:transparent !important;
          padding:0 !important;
          font-size:13px;
          font-weight:800;
          color:#111;
          box-shadow:none !important;
          text-align-last:center;
        }

        /* Desktop */
        @media (min-width: 992px){
          .sb-filterbar{
            border-radius:999px;
            padding:10px 14px;
          }
          .sb-filterbar__grid{
            display:flex;
            align-items:center;
            gap:12px;
            flex-wrap:nowrap;
          }
          .sb-filterbar__top{
            display:flex;
            align-items:center;
            gap:8px;
            flex:0 0 auto;
            min-width:120px;
          }
          .sb-filter__item{
            display:flex;
            flex-direction:column;
            align-items:center;
            min-width:110px;
          }
        }

        /* Mobile / Tablet */
        @media (max-width: 991.98px){
          .sb-filterbar{
            border-radius:22px;
            padding:12px;
          }
          .sb-filterbar__grid{
            display:grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap:10px;
          }
          .sb-filterbar__top{
            grid-column: 1 / -1;
            display:flex;
            align-items:center;
            gap:10px;
            justify-content:flex-start;
            padding:8px 10px;
            border-radius:999px;
            border:1.5px solid rgba(134,184,23,.22);
            background:#fff;
          }
          .sb-filter__item{
            border-radius:999px;
            padding:8px 10px;
            border:1.5px solid rgba(134,184,23,.22);
            background:#fff;
            display:flex;
            flex-direction:column;
            align-items:center;
          }
        }
      `}</style>

      <div className="container">
        <div className="text-center">
          {/* ===== SB Heading ===== */}
          <div className="sb-heading sb-heading--md mx-auto" style={{ marginBottom: 8 }}>
            <span className="sb-heading__lines sb-heading__lines--left">
              <span className="sb-heading__line sb-heading__line--long" />
              <span className="sb-heading__line sb-heading__line--short" />
            </span>

            <h6
              className="sb-heading__label"
              style={{ fontSize: "28px", fontWeight: 900, letterSpacing: "0.18em" }}
            >
              HOTELS
            </h6>

            <span className="sb-heading__lines sb-heading__lines--right">
              <span className="sb-heading__line sb-heading__line--long" />
              <span className="sb-heading__line sb-heading__line--short" />
            </span>
          </div>

          <p className="text-muted" style={{ fontSize: 13, marginBottom: 18 }}>
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
          <div className="sb-filterbar">
            <div className="sb-filterbar__grid">
              {/* ICON + Reset */}
              <div className="sb-filterbar__top">
                <div
                  className="d-inline-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: 34,
                    height: 34,
                    backgroundColor: "rgba(255, 195, 11, 0.15)",
                    flex: "0 0 auto",
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
                    fontWeight: 900,
                    color: "var(--primary)",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  All hotels
                </button>
              </div>

              <FilterItem label="Where">
                <select
                  className="form-select"
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

              <FilterItem label="Check-in">
                <input
                  type="date"
                  className="form-control"
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

              <FilterItem label="Check-out">
                <input
                  type="date"
                  className="form-control"
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

              <FilterItem label="Guests">
                <select
                  className="form-select"
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

              <FilterItem label="Price">
                <select
                  className="form-select"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="lt1">{"<100$"}</option>
                  <option value="1to2">100–200$</option>
                  <option value="gt2">{">200$"}</option>
                </select>
              </FilterItem>

              <FilterItem label="Rating">
                <select
                  className="form-select"
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(Number(e.target.value) || 0)}
                >
                  <option value={0}>All</option>
                  <option value={3}>3+</option>
                  <option value={4}>4+</option>
                  <option value={5}>5</option>
                </select>
              </FilterItem>

              <FilterItem label="Sort">
                <select
                  className="form-select"
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
        {/* ===== /FILTER BAR ===== */}
      </div>
    </div>
  );
};
