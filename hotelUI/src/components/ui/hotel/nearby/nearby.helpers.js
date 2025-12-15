// src/components/ui/hotel/nearby/nearby.helpers.js

/* ===================== Constants ===================== */
export const GROUP_ORDER = [
  "Food & Drink",
  "Shopping",
  "Leisure & Attractions",
  "Education",
  "Health & Medical",
  "Services & Finance",
  "Others",
];

export const MAX_ITEMS_COLLAPSED = 4;

/* ===================== Category helpers ===================== */
export const normalizeCats = (props) =>
  (props?.categories || []).join(",").toLowerCase();

export const getPlaceGroup = (props) => {
  const cats = normalizeCats(props);

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

export const getPlaceTypeLabel = (props) => {
  const cats = normalizeCats(props);

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

/* ===================== Formatting ===================== */
export const roundMeters = (m) => {
  if (typeof m !== "number" || !Number.isFinite(m)) return null;
  if (m < 1000) return `~ ${Math.round(m)} m`;
  return `~ ${(m / 1000).toFixed(1)} km`;
};

/* ===================== Coordinates ===================== */
export const getHotelCoords = (hotel) => {
  const lat = hotel?.latitude ?? hotel?.lat ?? hotel?.locationLat ?? null;
  const lon = hotel?.longitude ?? hotel?.lng ?? hotel?.locationLng ?? null;
  return { lat, lon };
};

/* ===================== Links ===================== */
export const buildDirectionLink = (originLat, originLon, place) => {
  const props = place?.properties || {};
  const name = props?.name || "";
  const [placeLon, placeLat] = place?.geometry?.coordinates || [];

  let url = "https://www.google.com/maps/dir/?api=1";
  if (originLat && originLon) url += `&origin=${originLat},${originLon}`;
  if (placeLat && placeLon) url += `&destination=${placeLat},${placeLon}`;
  if (name) url += `&destination_place=${encodeURIComponent(name)}`;
  url += "&travelmode=driving";
  return url;
};

/* ===================== Internals ===================== */
const getId = (item) =>
  item?.properties?.place_id ||
  item?.properties?.osm_id ||
  (item?.properties?.name
    ? `${item?.properties?.name}-${
        item?.geometry?.coordinates?.join(",") || ""
      }`
    : null);

// ✅ export để component dùng (nếu cần)
export const getPlaceId = (item) => getId(item);

const sortByDistance = (arr = []) =>
  [...arr].sort((a, b) => {
    const da = Number(a?.properties?.distance ?? Infinity);
    const db = Number(b?.properties?.distance ?? Infinity);
    return da - db;
  });

const pickFirst = (arr, used) => {
  if (!Array.isArray(arr)) return null;
  for (const it of arr) {
    const id = getId(it);
    if (!id || used.has(id)) continue;
    used.add(id);
    return it;
  }
  return null;
};

// ❌ loại nơi không phù hợp
const isBadPlace = (props) => {
  const cats = normalizeCats(props);
  return (
    cats.includes("parking") ||
    cats.includes("fuel") ||
    cats.includes("car") ||
    cats.includes("bus") ||
    cats.includes("station") ||
    cats.includes("police") ||
    cats.includes("toilet")
  );
};

// normalize text (VN -> no dấu) + đ -> d
const normText = (s = "") =>
  s
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

/* ===================== Name heuristics ===================== */
const looksLikeCafeByName = (props) => {
  const name = normText(props?.name || "");
  return (
    name.includes("cafe") ||
    name.includes("coffee") ||
    name.includes("highlands") ||
    name.includes("tra") ||
    name.includes("tea") ||
    name.includes("tra sua") ||
    name.includes("milk tea") ||
    name.includes("milktea") ||
    name.includes("phuc long") ||
    name.includes("gong cha") ||
    name.includes("toco")
  );
};

// ✅ ưu tiên “cơm/nhà hàng” cho bữa trưa
const looksLikeProperLunchByName = (props) => {
  const name = normText(props?.name || "");

  const good =
    name.includes("com nieu") ||
    name.includes("com ") ||
    name.endsWith(" com") ||
    name.includes("nha hang") ||
    name.includes("quan an") ||
    name.includes("rice") ||
    name.includes("restaurant");

  // ❌ hạn chế món “kỳ” cho lunch
  const bad =
    name.includes("oc") ||
    name.includes("tra sua") ||
    name.includes("milktea") ||
    name.includes("milk tea") ||
    name.includes("tea") ||
    name.includes("cafe") ||
    name.includes("coffee") ||
    name.includes("bun") ||
    name.includes("pho") ||
    name.includes("hu tieu") ||
    name.includes("banh mi");

  return good && !bad;
};

/* ===================== PLAY predicates ===================== */
const isPlayMorning = (props) => {
  const cats = normalizeCats(props);
  if (isBadPlace(props)) return false;
  return (
    cats.includes("tourism") ||
    cats.includes("attraction") ||
    cats.includes("park") ||
    cats.includes("leisure") ||
    cats.includes("entertainment") ||
    cats.includes("museum") ||
    cats.includes("zoo") ||
    cats.includes("cinema")
  );
};

const isPlayLateMorning = (props) => {
  const cats = normalizeCats(props);
  if (isBadPlace(props)) return false;
  return (
    cats.includes("tourism") ||
    cats.includes("attraction") ||
    cats.includes("park") ||
    cats.includes("leisure") ||
    cats.includes("museum") ||
    cats.includes("commercial") ||
    cats.includes("mall") ||
    cats.includes("shop")
  );
};

const isPlayAfternoon = (props) => {
  const cats = normalizeCats(props);
  if (isBadPlace(props)) return false;
  return (
    cats.includes("tourism") ||
    cats.includes("attraction") ||
    cats.includes("park") ||
    cats.includes("leisure") ||
    cats.includes("commercial") ||
    cats.includes("mall") ||
    cats.includes("shop")
  );
};

const isPlayEveningWalk = (props) => {
  const cats = normalizeCats(props);
  if (isBadPlace(props)) return false;
  return (
    cats.includes("park") ||
    cats.includes("leisure") ||
    cats.includes("tourism")
  );
};

/* ===================== FOOD predicates ===================== */
const isBreakfast = (props) => {
  const cats = normalizeCats(props);
  if (isBadPlace(props)) return false;
  return (
    cats.includes("cafe") ||
    cats.includes("bakery") ||
    looksLikeCafeByName(props)
  );
};

const isLunch = (props) => {
  const cats = normalizeCats(props);
  if (isBadPlace(props)) return false;

  if (cats.includes("cafe") || looksLikeCafeByName(props)) return false;
  if (looksLikeProperLunchByName(props)) return true;

  const name = normText(props?.name || "");
  if (name.includes("oc")) return false;

  return cats.includes("restaurant") || cats.includes("fast_food");
};

const isCafe = (props) => {
  const cats = normalizeCats(props);
  if (isBadPlace(props)) return false;
  return (
    cats.includes("cafe") || cats.includes("bar") || looksLikeCafeByName(props)
  );
};

const isDinner = (props) => {
  const cats = normalizeCats(props);
  if (isBadPlace(props)) return false;
  if (cats.includes("cafe") || looksLikeCafeByName(props)) return false;
  return cats.includes("restaurant") || cats.includes("fast_food");
};

const pickSlot = (primaryArr, predicate, used, fallbackArrs = []) => {
  const a = pickFirst(
    primaryArr.filter((p) => predicate(p?.properties || {})),
    used
  );
  if (a) return a;

  for (const fb of fallbackArrs) {
    const b = pickFirst(
      fb.filter((p) => predicate(p?.properties || {})),
      used
    );
    if (b) return b;
  }
  return null;
};

/**
 * ✅ buildDayPlan: trả về 8-slot cho modal
 * return { play: [..4], food: [..4] }
 */
export const buildDayPlan = (nearbyGroups) => {
  const used = new Set();

  const leisure = sortByDistance(nearbyGroups?.["Leisure & Attractions"] || []);
  const food = sortByDistance(nearbyGroups?.["Food & Drink"] || []);
  const shopping = sortByDistance(nearbyGroups?.["Shopping"] || []);
  const others = sortByDistance(nearbyGroups?.["Others"] || []);

  const play = [
    pickSlot(leisure, isPlayMorning, used, [others, shopping]),
    pickSlot(leisure, isPlayLateMorning, used, [shopping, others]),
    pickSlot(leisure, isPlayAfternoon, used, [shopping, others]),
    pickSlot(leisure, isPlayEveningWalk, used, [others, shopping]),
  ];

  const foodPlan = [
    pickSlot(food, isBreakfast, used, [others]),
    pickSlot(food, isLunch, used, [others, shopping]),
    pickSlot(food, isCafe, used, [others]),
    pickSlot(food, isDinner, used, [others, shopping]),
  ];

  return { play, food: foodPlan };
};

/* ===================== POOLS (for cycle refresh ↻) ===================== */
export const buildSlotPools = (nearbyGroups) => {
  const leisure = sortByDistance(nearbyGroups?.["Leisure & Attractions"] || []);
  const food = sortByDistance(nearbyGroups?.["Food & Drink"] || []);
  const shopping = sortByDistance(nearbyGroups?.["Shopping"] || []);
  const others = sortByDistance(nearbyGroups?.["Others"] || []);

  const poolFrom = (arrs, predicate) =>
    sortByDistance(
      arrs.flat().filter((it) => {
        const props = it?.properties || {};
        if (isBadPlace(props)) return false;
        return predicate(props);
      })
    );

  const playPools = [
    poolFrom([leisure, others, shopping], isPlayMorning),
    poolFrom([leisure, shopping, others], isPlayLateMorning),
    poolFrom([leisure, shopping, others], isPlayAfternoon),
    poolFrom([leisure, others, shopping], isPlayEveningWalk),
  ];

  const foodPools = [
    poolFrom([food, others], isBreakfast),
    poolFrom([food, others, shopping], isLunch),
    poolFrom([food, others], isCafe),
    poolFrom([food, others, shopping], isDinner),
  ];

  return { playPools, foodPools };
};

/* ===================== Replace single slot (↻) ===================== */
const PLAY_SLOT_PREDS = [
  isPlayMorning,
  isPlayLateMorning,
  isPlayAfternoon,
  isPlayEveningWalk,
];
const FOOD_SLOT_PREDS = [isBreakfast, isLunch, isCafe, isDinner];

const ensurePlan = (plan) => {
  const next = {
    play: Array.isArray(plan?.play) ? [...plan.play] : [null, null, null, null],
    food: Array.isArray(plan?.food) ? [...plan.food] : [null, null, null, null],
  };
  next.play = [...next.play, null, null, null, null].slice(0, 4);
  next.food = [...next.food, null, null, null, null].slice(0, 4);
  return next;
};

const getPlanIds = (plan) => {
  const used = new Set();
  const all = [...(plan?.play || []), ...(plan?.food || [])].filter(Boolean);
  for (const it of all) {
    const id = getId(it);
    if (id) used.add(id);
  }
  return used;
};

// ✅ giữ lại (nếu bạn muốn refresh kiểu “không trùng”)
export const replacePlanSlot = (nearbyGroups, currentPlan, type, index) => {
  const next = ensurePlan(currentPlan);

  const used = getPlanIds(next);

  // current slot
  const current = next?.[type]?.[index] || null;
  const curId = current ? getId(current) : null;

  // (curId có trong used) -> bỏ ra để slot này có thể đổi, nhưng...
  if (curId) used.delete(curId);

  const leisure = sortByDistance(nearbyGroups?.["Leisure & Attractions"] || []);
  const food = sortByDistance(nearbyGroups?.["Food & Drink"] || []);
  const shopping = sortByDistance(nearbyGroups?.["Shopping"] || []);
  const others = sortByDistance(nearbyGroups?.["Others"] || []);

  const predicate =
    type === "play" ? PLAY_SLOT_PREDS[index] : FOOD_SLOT_PREDS[index];
  const primary = type === "play" ? leisure : food;

  const fallbacks =
    type === "play"
      ? [shopping, others]
      : index === 1 || index === 3
      ? [others, shopping]
      : [others];

  const pickFrom = (arr) => {
    for (const it of arr) {
      const props = it?.properties || {};
      if (!predicate(props)) continue;

      const id = getId(it);
      if (!id) continue;

      // ✅ quan trọng: bấm ↻ phải ra địa điểm khác
      if (curId && id === curId) continue;

      if (used.has(id)) continue;

      used.add(id);
      return it;
    }
    return null;
  };

  let chosen = pickFrom(primary);
  if (!chosen) {
    for (const fb of fallbacks) {
      chosen = pickFrom(fb);
      if (chosen) break;
    }
  }

  // ✅ nếu không có lựa chọn khác, giữ nguyên current (đỡ bị trống)
  next[type][index] = chosen || current || null;
  return next;
};

/* ===================== Cycle refresh (↻ vòng lặp) ===================== */
const findIndexInPool = (pool = [], place) => {
  const curId = getId(place);
  if (!curId) return -1;
  return pool.findIndex((it) => getId(it) === curId);
};

/**
 * cyclePlanSlot:
 * - pools: { playPools:[...4], foodPools:[...4] }
 * - cursorMap: { play:[0..], food:[0..] }
 * returns: { nextPlan, nextCursorMap, meta:{ total, step, wrapped } }
 */
export const cyclePlanSlot = (pools, currentPlan, cursorMap, type, index) => {
  const next = ensurePlan(currentPlan);

  const pool =
    type === "play"
      ? pools?.playPools?.[index] || []
      : pools?.foodPools?.[index] || [];

  const total = pool.length;
  if (!total) {
    return {
      nextPlan: next,
      nextCursorMap: cursorMap,
      meta: { total: 0, step: 0, wrapped: false },
    };
  }

  const curArr = Array.isArray(cursorMap?.[type])
    ? [...cursorMap[type]]
    : [0, 0, 0, 0];

  const curCursor = Number.isFinite(curArr[index]) ? curArr[index] : 0;

  // sync cursor với place đang hiển thị (nếu regenerate/plan khác)
  const curPlace = next?.[type]?.[index] || null;
  const actualIdx = findIndexInPool(pool, curPlace);
  const baseCursor = actualIdx >= 0 ? actualIdx : curCursor;

  const nextCursor = (baseCursor + 1) % total;
  const wrapped = baseCursor + 1 >= total;

  next[type][index] = pool[nextCursor] || next[type][index] || null;

  curArr[index] = nextCursor;

  return {
    nextPlan: next,
    nextCursorMap: { ...(cursorMap || {}), [type]: curArr },
    meta: { total, step: nextCursor + 1, wrapped },
  };
};
