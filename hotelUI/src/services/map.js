// src/services/map.js
import axios from "axios";

const GEO_KEY = import.meta.env.VITE_GEOAPIFY_KEY;

// Nhóm category lớn
const DEFAULT_CATEGORIES = [
  "catering", // Food & Drink
  "commercial", // Shopping
  "leisure", // Parks, playgrounds
  "entertainment", // Cinema, etc.
  "tourism", // Attractions
  "education", // Schools, universities
  "healthcare", // Hospitals, clinics, pharmacies
  "service", // Banks, post offices, ...
];

// Dùng cho deduplicate
const getFeatureId = (f) =>
  f?.properties?.place_id || f?.properties?.osm_id || f?.properties?.name;

/**
 * Lấy danh sách địa điểm gần toạ độ (lat, lon)
 * - radius: mét (m), default 8000
 * - limitPerCat: số điểm tối đa mỗi category, default 20
 */
export const getNearbyPlaces = async (
  lat,
  lon,
  { categories = DEFAULT_CATEGORIES, radius = 8000, limitPerCat = 20 } = {}
) => {
  try {
    const cats = Array.isArray(categories) ? categories : [categories];
    const baseUrl = "https://api.geoapify.com/v2/places";

    // Tạo 1 request cho MỖI category để “hút” nhiều địa điểm hơn
    const requests = cats.map((cat) => {
      const url =
        `${baseUrl}?categories=${encodeURIComponent(cat)}` +
        `&filter=circle:${lon},${lat},${radius}` +
        `&limit=${limitPerCat}` +
        `&apiKey=${GEO_KEY}`;

      console.log("[Geoapify] URL =", url);

      return axios
        .get(url)
        .then((res) => res.data?.features || [])
        .catch((err) => {
          console.error("Nearby places error (cat =", cat, "):", err);
          return [];
        });
    });

    const results = await Promise.all(requests);
    const merged = results.flat();

    // Loại trùng (theo place_id / osm_id / name)
    const seen = new Set();
    const unique = [];

    for (const f of merged) {
      const id = getFeatureId(f);
      if (!id || !seen.has(id)) {
        if (id) seen.add(id);
        unique.push(f);
      }
    }

    console.log("[Geoapify] total features =", unique.length);
    return unique;
  } catch (error) {
    console.error("Nearby places error:", error);
    return [];
  }
};
