// src/components/ui/chatbot/chatEngine.js
import { VIETNAM_CITIES } from "@/assets/constants/cities";

/* Chuẩn hoá chữ tiếng Việt bỏ dấu */
const normalizeVN = (str = "") =>
  String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

const reply = (text, quickReplies = [], action = null, nextState = null) => ({
  text,
  quickReplies, // ["Cần Thơ", ...]
  action, // { type: "NAVIGATE", payload: { pathname, params } }
  nextState,
});

/** ====== CITY MAP (from VIETNAM_CITIES) ====== */
const CITY_MAP = (Array.isArray(VIETNAM_CITIES) ? VIETNAM_CITIES : []).map(
  (c) => ({
    label: c,
    key: normalizeVN(c),
  })
);

/** Alias: keyword -> city label (match contains) */
const CITY_ALIASES = [
  // HCM
  { key: "sai gon", label: "Hồ Chí Minh" },
  { key: "saigon", label: "Hồ Chí Minh" },
  { key: "sg", label: "Hồ Chí Minh" },
  { key: "tp hcm", label: "Hồ Chí Minh" },
  { key: "tphcm", label: "Hồ Chí Minh" },
  { key: "ho chi minh", label: "Hồ Chí Minh" },

  // Hanoi
  { key: "ha noi", label: "Hà Nội" },
  { key: "hanoi", label: "Hà Nội" },

  // Danang
  { key: "da nang", label: "Đà Nẵng" },
  { key: "danang", label: "Đà Nẵng" },
];

/** gợi ý city (quick replies) */
const CITY_SUGGEST = (() => {
  // ưu tiên vài city phổ biến (nếu có trong list)
  const preferred = [
    "Cần Thơ",
    "Hồ Chí Minh",
    "Hà Nội",
    "Đà Nẵng",
    "Hải Phòng",
  ];
  const picked = preferred.filter((x) => VIETNAM_CITIES.includes(x));
  const fallback = VIETNAM_CITIES.slice(0, 6);
  return (picked.length ? picked : fallback).slice(0, 6);
})();

/** detect city from input (alias first -> then list) */
const detectCity = (inputNorm) => {
  const aliasHit = CITY_ALIASES.find((a) => inputNorm.includes(a.key));
  if (aliasHit) return aliasHit.label;

  const hit = CITY_MAP.find((c) => inputNorm.includes(c.key));
  return hit?.label || null;
};

/** parse filter từ câu người dùng/quick reply */
const parseFilter = (inputNorm) => {
  // rating
  if (
    inputNorm.includes("4-5 sao") ||
    inputNorm.includes("4 5 sao") ||
    inputNorm === "4 sao" ||
    inputNorm.includes("4 sao tro len") ||
    inputNorm.includes("4+")
  ) {
    return { rating: "4", sort: "ratingHigh", label: "4+ sao" };
  }
  if (inputNorm.includes("5 sao") || inputNorm.includes("5 stars")) {
    return { rating: "5", sort: "ratingHigh", label: "5 sao" };
  }

  // price
  if (
    inputNorm.includes("gia re") ||
    inputNorm === "re" ||
    inputNorm.includes("cheap")
  ) {
    return { price: "lt1", sort: "priceLow", label: "dưới 100$" };
  }
  if (
    (inputNorm.includes("100") && inputNorm.includes("200")) ||
    inputNorm.includes("100$ – 200$")
  ) {
    return { price: "1to2", sort: "recommended", label: "100$ – 200$" };
  }
  if (
    inputNorm.includes("tren 200") ||
    inputNorm.includes("above 200") ||
    inputNorm.includes(">200")
  ) {
    return { price: "gt2", sort: "priceHigh", label: "trên 200$" };
  }

  // sort
  if (inputNorm.includes("top rated") || inputNorm.includes("danh gia cao")) {
    return { sort: "ratingHigh", label: "top rated" };
  }

  // guests
  const guestsMatch = inputNorm.match(/(\d+)\s*(khach|guests?)/);
  if (guestsMatch?.[1]) {
    const g = String(Math.max(1, Number(guestsMatch[1]) || 1));
    return { guests: g, sort: "recommended", label: `${g} khách` };
  }

  return null;
};

const buildHotelNavigateParams = (city, filterObj = null) => {
  const params = { q: city, where: city };
  if (filterObj) {
    const { label, ...rest } = filterObj;
    Object.assign(params, rest);
  }
  return params;
};

export const chatEngine = (rawInput, state = {}) => {
  const inputRaw = String(rawInput || "").trim();
  const input = normalizeVN(inputRaw);

  const city = detectCity(input);
  const pickedFilter = parseFilter(input);

  const wantHotel =
    input.includes("tim khach san") ||
    input.includes("xem khach san") ||
    input.includes("khach san") ||
    input.includes("hotel");

  const wantChangeCity =
    input.includes("doi thanh pho") ||
    input.includes("doi tp") ||
    input.includes("doi dia diem") ||
    input.includes("change city");

  const wantNearMe =
    input.includes("gan toi") ||
    input.includes("near me") ||
    input.includes("o gan toi");

  /** 0) Near me: trả về ACTION riêng để UI xin GPS */
  if (wantNearMe) {
    return reply(
      "📍 Ok! Mình sẽ xin vị trí để gợi ý thành phố gần bạn. (Nếu bạn không cho phép, mình sẽ hỏi lại thành phố.)",
      [],
      { type: "GEOLOCATE", payload: {} },
      { ...state }
    );
  }

  /** 1) Đổi thành phố: hiển thị danh sách city để chọn */
  if (wantChangeCity) {
    return reply("✅ Bạn muốn đổi sang thành phố nào?", CITY_SUGGEST, null, {
      intent: "change_city",
      city: null,
      pendingFilter: state?.pendingFilter || null,
    });
  }

  /** 2) User chọn filter trước khi có city -> lưu pendingFilter và hỏi city */
  if (pickedFilter && !state?.city && !city) {
    const nextState = {
      intent: "hotel_search",
      city: null,
      pendingFilter: pickedFilter,
    };

    return reply(
      `👌 OK! Bạn muốn lọc theo **${pickedFilter.label}**.\nGiờ bạn muốn tìm khách sạn ở thành phố nào?`,
      CITY_SUGGEST,
      null,
      nextState
    );
  }

  /** 3) Có city (từ input hoặc quick reply city) */
  if (city) {
    // nếu đang có pendingFilter -> apply luôn và navigate
    if (state?.pendingFilter) {
      const params = buildHotelNavigateParams(city, state.pendingFilter);
      const nextState = { intent: "hotel_search", city, pendingFilter: null };

      return reply(
        `✅ OK! Áp dụng lọc **${state.pendingFilter.label}** tại **${city}**.`,
        [
          "Đổi thành phố",
          "Giá rẻ",
          "100$ – 200$",
          "4-5 sao",
          "Top rated",
          "2 khách",
          "4 khách",
        ],
        { type: "NAVIGATE", payload: { pathname: "/hotel", params } },
        nextState
      );
    }

    // nếu user vừa nói "tìm khách sạn ở <city>" hoặc chỉ city thôi → hỏi filter
    const nextState = { intent: "hotel_search", city, pendingFilter: null };

    return reply(
      `✅ OK! Bạn muốn tìm **khách sạn ở ${city}**.\nBạn muốn lọc theo tiêu chí nào?`,
      [
        "4-5 sao",
        "Giá rẻ",
        "100$ – 200$",
        "Trên 200$",
        "Top rated",
        "2 khách",
        "4 khách",
        "Đổi thành phố",
      ],
      null,
      nextState
    );
  }

  /** 4) Đang có city rồi -> user chọn filter -> navigate */
  if (state?.intent === "hotel_search" && state?.city) {
    if (pickedFilter) {
      const params = buildHotelNavigateParams(state.city, pickedFilter);

      return reply(
        `✅ OK! Lọc **${pickedFilter.label}** ở **${state.city}** cho bạn.`,
        ["Đổi thành phố", "Giá rẻ", "100$ – 200$", "4-5 sao", "Top rated"],
        { type: "NAVIGATE", payload: { pathname: "/hotel", params } },
        state
      );
    }

    // user nói "tìm khách sạn" khi đã có city
    if (wantHotel) {
      return reply(
        `Bạn đang xem theo **${state.city}**. Bạn muốn lọc thêm tiêu chí nào?`,
        [
          "4-5 sao",
          "Giá rẻ",
          "100$ – 200$",
          "Trên 200$",
          "Top rated",
          "Đổi thành phố",
        ],
        null,
        state
      );
    }
  }

  /** 5) User nói "xem khách sạn" nhưng không có city */
  if (wantHotel && !state?.city) {
    return reply(
      "Bạn muốn tìm khách sạn ở thành phố nào?",
      CITY_SUGGEST,
      null,
      { intent: "hotel_search", city: null, pendingFilter: null }
    );
  }

  /** Fallback */
  return reply(
    "Mình chưa hiểu ý bạn 😅 Bạn thử chọn 1 gợi ý bên dưới nhé.",
    [
      "Xem khách sạn",
      "Gần tôi",
      "Cần Thơ",
      "Hồ Chí Minh",
      "4-5 sao",
      "Giá rẻ",
      "Đổi thành phố",
    ],
    null,
    state
  );
};
