import { useState, useCallback, useEffect } from "react";
import { debounce } from "lodash";

export const useFilteredHotel = ({ hotels }) => {
  const [hotelFilter, setHotelFilter] = useState([]);

  const normalizeText = (text) => {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  };

  const filterItems = (items, searchTerm) => {
    const normalizedValue = normalizeText(searchTerm);
    if (!searchTerm) {
      return items
        .slice()
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5);
    }

    return items.filter((item) => {
      const normalizedName = normalizeText(item?.name || "");
      const normalizedAddress = normalizeText(item?.address || "");
      return (
        normalizedName.includes(normalizedValue) ||
        normalizedAddress.includes(normalizedValue)
      );
    });
  };


  const handleFetch = (value) => {
    if (hotels) {
      setHotelFilter(filterItems(hotels, value));
    }
  };

  const debounceFetch = useCallback(
    debounce((value) => handleFetch(value), 1000),
    [hotels]
  );

  useEffect(() => {
    return () => {
      debounceFetch.cancel();
    };
  }, [debounceFetch]);

  return { hotelFilter, debounceFetch };
};
