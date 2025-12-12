// src/components/ui/chatbot/chatEngine.js

/* Chuẩn hoá chữ tiếng Việt bỏ dấu */
const normalizeVN = (str = "") =>
  str
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

const reply = (text, quickReplies = [], action = null, nextState = null) => ({
  text,
  quickReplies,
  action, // { type: "NAVIGATE", payload: { pathname, params } }
  nextState,
});

const CITIES = [
  { key: "can tho", label: "Cần Thơ" },
  { key: "ha noi", label: "Hà Nội" },
  { key: "da nang", label: "Đà Nẵng" },
  { key: "tp hcm", label: "TP HCM" },
  { key: "sai gon", label: "TP HCM" },
  { key: "ho chi minh", label: "TP HCM" },
];

// parse filter từ câu người dùng/quick reply
const parseFilter = (inputNorm) => {
  // rating
  if (
    inputNorm.includes("4-5 sao") ||
    inputNorm.includes("4 5 sao") ||
    inputNorm === "4 sao" ||
    inputNorm.includes("4 sao tro len")
  ) {
    return { rating: "4", sort: "ratingHigh", label: "4+ sao" };
  }

  if (inputNorm.includes("5 sao") || inputNorm.includes("5 stars")) {
    return { rating: "5", sort: "ratingHigh", label: "5 sao" };
  }

  // price
  if (inputNorm.includes("gia re") || inputNorm === "re") {
    return { price: "lt1", sort: "priceLow", label: "dưới 100$" };
  }

  if (inputNorm.includes("100") && inputNorm.includes("200")) {
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

export const chatEngine = (rawInput, state = {}) => {
  const inputRaw = (rawInput || "").toString().trim();
  const input = normalizeVN(inputRaw);

  const foundCity = CITIES.find((c) => input.includes(c.key));

  const wantHotel =
    input.includes("tim khach san") ||
    input.includes("khach san o") ||
    input.includes("khach san tai") ||
    input.includes("hotel");

  // ✅ 0) user chọn filter trước khi có city -> lưu pendingFilter và hỏi city
  const pickedFilter = parseFilter(input);
  if (pickedFilter && !state?.city) {
    const nextState = {
      intent: "hotel_search",
      city: null,
      pendingFilter: pickedFilter,
    };

    return reply(
      `👌 OK! Bạn muốn lọc theo **${pickedFilter.label}**.\nGiờ bạn muốn tìm khách sạn ở thành phố nào?`,
      ["Cần Thơ", "Hà Nội", "Đà Nẵng", "TP HCM"],
      null,
      nextState
    );
  }

  // ✅ 1) ý định tìm hotel + có city
  if (wantHotel && foundCity) {
    const nextState = {
      intent: "hotel_search",
      city: foundCity.label,
      pendingFilter: null,
    };

    return reply(
      `✅ OK! Bạn muốn tìm **khách sạn ở ${foundCity.label}**.\nBạn muốn lọc theo tiêu chí nào?`,
      [
        "4-5 sao",
        "Giá rẻ",
        "100$ – 200$",
        "Trên 200$",
        "Top rated",
        "2 khách",
        "4 khách",
      ],
      null,
      nextState
    );
  }

  // ✅ 2) user chỉ nhắc city (kể cả bấm quick reply city)
  if (foundCity) {
    const city = foundCity.label;

    // nếu có pendingFilter -> apply luôn và NAVIGATE
    if (state?.pendingFilter) {
      const params = {
        q: city,
        where: city,
        ...state.pendingFilter,
      };
      delete params.label;

      const nextState = { intent: "hotel_search", city, pendingFilter: null };

      return reply(
        `✅ OK! Áp dụng lọc **${state.pendingFilter.label}** tại **${city}**.`,
        [],
        { type: "NAVIGATE", payload: { pathname: "/hotel", params } },
        nextState
      );
    }

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
      ],
      null,
      nextState
    );
  }

  // ✅ 3) đang có city -> chọn filter -> NAVIGATE
  if (state?.intent === "hotel_search" && state?.city) {
    const city = state.city;
    const f = parseFilter(input);

    if (f) {
      const params = { q: city, where: city, ...f };
      delete params.label;

      return reply(
        `✅ OK! Lọc **${f.label}** ở **${city}** cho bạn.`,
        [],
        { type: "NAVIGATE", payload: { pathname: "/hotel", params } },
        state
      );
    }
  }

  // ✅ fallback
  return reply(
    "Mình chưa hiểu ý bạn 😅 Bạn thử chọn 1 gợi ý bên dưới nhé.",
    [
      "Tìm khách sạn ở Cần Thơ",
      "4-5 sao",
      "100$ – 200$",
      "Giá rẻ",
      "Top rated",
    ],
    null,
    state
  );
};
