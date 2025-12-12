// src/components/ui/chatbot/chatbotData.js
export const FAQ = [
  {
    intent: "greeting",
    keywords: ["hi", "hello", "xin chào", "chào", "hey"],
    replies: [
      "Xin chào 👋 Mình là SB Bot. Bạn muốn tìm khách sạn hay phòng giảm giá?",
      "Chào bạn! Mình có thể giúp bạn tìm khách sạn/phòng, xem giờ check-in/out, chính sách hủy.",
    ],
    quick: [
      "Tìm khách sạn ở Cần Thơ",
      "Phòng giảm giá",
      "Giờ check-in/check-out",
    ],
  },
  {
    intent: "checkin",
    keywords: ["check in", "nhận phòng", "giờ nhận phòng"],
    replies: ["Giờ check-in thường từ **14:00**. Bạn muốn đặt ngày nào?"],
    quick: ["Hướng dẫn đặt phòng", "Chính sách hủy"],
  },
  {
    intent: "checkout",
    keywords: ["check out", "trả phòng", "giờ trả phòng"],
    replies: [
      "Giờ check-out trước **12:00**. Nếu cần late check-out bạn có thể nhắn khách sạn nhé.",
    ],
    quick: ["Giờ check-in", "Liên hệ hỗ trợ"],
  },
  {
    intent: "cancel",
    keywords: ["hủy", "hoàn tiền", "refund", "cancel"],
    replies: [
      "Chính sách hủy tùy khách sạn/phòng. Thường bạn có thể xem ở trang chi tiết phòng trước khi đặt.",
      "Bạn muốn mình hướng dẫn chỗ xem chính sách hủy trong SB Hotel không?",
    ],
    quick: ["Hướng dẫn đặt phòng", "Liên hệ hỗ trợ"],
  },
  {
    intent: "support",
    keywords: ["liên hệ", "hỗ trợ", "nhân viên", "hotline", "email"],
    replies: [
      "Bạn có thể vào trang **Contact** hoặc để lại lời nhắn, mình sẽ chuyển tới đội hỗ trợ.",
    ],
    quick: ["Mở trang Contact", "Hướng dẫn đặt phòng"],
  },
];

export const FALLBACK = {
  replies: [
    "Mình chưa hiểu ý bạn 😥 Bạn thử chọn 1 gợi ý bên dưới nhé.",
    "Bạn muốn tìm **khách sạn theo thành phố**, hay **phòng theo giá/giảm giá**?",
  ],
  quick: ["Tìm khách sạn ở Cần Thơ", "Phòng dưới 800k", "Giờ check-in"],
};
