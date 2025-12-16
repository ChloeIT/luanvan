import React, { useEffect, useMemo, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useFilteredHotel } from "../../common/useFilteredHotel";
import { Link } from "react-router-dom";
import { Avatar } from "antd";

export const SearchInput = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const IMAGE_URL = (import.meta.env.VITE_IMAGE_URL || "").replace(/\/+$/, "");
  const { hotels } = useSelector((state) => state.hotel);

  const { hotelFilter, debounceFetch } = useFilteredHotel({ hotels });

  useEffect(() => {
    debounceFetch(searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleBlur = () => {
    // delay để click vào item trong dropdown không bị mất focus quá sớm
    setTimeout(() => setIsFocused(false), 120);
  };

  const showDropdown = isFocused && searchTerm.trim().length > 0;

  const results = useMemo(() => {
    return Array.isArray(hotelFilter) ? hotelFilter : [];
  }, [hotelFilter]);

  return (
    <div className="header-search position-relative">
      {/* input pill */}
      <label className="header-search-pill">
        <IoSearch className="header-search-icon" />
        <input
          type="search"
          className="header-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder="Search hotels..."
        />
      </label>

      {/* dropdown */}
      {showDropdown && (
        <div className="header-search-dropdown">
          <div className="header-search-dropdown-head">
            <span>Results</span>
          </div>

          {results.length > 0 ? (
            results.map((hotel) => (
              <Link
                key={hotel.id}
                to={`/hotel/${hotel.id}`}
                className="header-search-item"
                onMouseDown={(e) => e.preventDefault()} // giữ dropdown để click
                onClick={() => {
                  setSearchTerm("");
                  setIsFocused(false);
                }}
              >
                <Avatar
                  size={40}
                  src={
                    hotel?.image
                      ? `${IMAGE_URL}/hotels/${hotel.image}`
                      : undefined
                  }
                />
                <div className="header-search-item-text">
                  <div className="header-search-item-name">{hotel?.name}</div>
                  <div className="header-search-item-sub">{hotel?.address}</div>
                </div>
              </Link>
            ))
          ) : (
            <div className="header-search-empty">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};
