package com.java.hotel.service;

import com.java.hotel.model.Booking;
import com.java.hotel.model.Room;
import com.java.hotel.model.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Set;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;   // email gửi (config trong application.properties)

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // ============ 1. GỬI EMAIL TEXT ĐƠN GIẢN (nếu cần) ============
    public void sendSimpleEmail(String to, String subject, String text) {
        if (to == null || to.isBlank()) return;

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(text);

        mailSender.send(msg);
    }

    // ============ 2. GỬI EMAIL HTML CHUNG ============
    public void sendHtmlEmail(String to, String subject, String htmlContent)
            throws MessagingException {

        if (to == null || to.isBlank()) return;

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper =
                new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(from);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true); // true = nội dung là HTML

        mailSender.send(message);
    }

    // ============ 3. GỬI EMAIL BOOKING CONFIRMATION TỪ BOOKING THẬT ============

    /**
     * @Async: gửi email ở thread riêng, tránh chặn request chính.
     * (Cần có @EnableAsync + AsyncConfig).
     */
    @Async
    public void sendBookingConfirmation(Booking booking) {
        if (booking == null) return;

        User user = booking.getUser();
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            // Không có email thì không gửi
            return;
        }

        String to = user.getEmail();

        // Tên khách – ưu tiên fullName, fallback username
        String guestName =
                (user.getFullName() != null && !user.getFullName().isBlank())
                        ? user.getFullName()
                        : user.getUsername();

        // Lấy 1 phòng đầu tiên trong booking (thường là 1)
        Set<Room> roomSet = booking.getRooms();
        Room room = (roomSet != null && !roomSet.isEmpty())
                ? roomSet.iterator().next()
                : null;

        String roomName =
                (room != null && room.getName() != null)
                        ? room.getName()
                        : "Your room";

        String hotelName =
                (room != null
                        && room.getHotel() != null
                        && room.getHotel().getName() != null)
                        ? room.getHotel().getName()
                        : "SBHotel";

        // Mã đặt phòng – dùng ID để tra cứu
        Long id = booking.getId();
        String bookingCode = (id != null)
                ? String.format("SBH-%06d", id)
                : "SBH-XXXXXX";

        // Format ngày: dd/MM/yyyy
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String checkInStr = (booking.getCheckIn() != null)
                ? booking.getCheckIn().toLocalDate().format(dateFmt)
                : "-";
        String checkOutStr = (booking.getCheckOut() != null)
                ? booking.getCheckOut().toLocalDate().format(dateFmt)
                : "-";

        // Format tiền: USD, ví dụ $120.00
        float price = booking.getTotalPrice();
        String totalPriceStr = String.format(Locale.US, "$%,.2f", price);

        // Trạng thái thanh toán
        String paymentStatus = booking.isPayment()
                ? "ĐÃ THANH TOÁN"
                : "CHƯA THANH TOÁN";

        // Link xem chi tiết – sau map sang FE thật
        String detailUrl = "https://sbhotel.local/booking/" + bookingCode;

        String subject = "SBHotel – Xác nhận đặt phòng " + bookingCode;

        String html = buildBookingConfirmationHtml(
                guestName,
                hotelName,
                roomName,
                bookingCode,
                checkInStr,
                checkOutStr,
                totalPriceStr,
                paymentStatus,
                detailUrl
        );

        System.out.println(">>> Sending booking email to " + to +
                " for booking " + bookingCode);

        try {
            sendHtmlEmail(to, subject, html);
        } catch (MessagingException e) {
            // Chỉ log lỗi, không làm hỏng luồng chính
            e.printStackTrace();
        }
    }

    // ============ 4. TEMPLATE HTML (LOGO + USD + TRẠNG THÁI) ============

    private String buildBookingConfirmationHtml(
            String guestName,
            String hotelName,
            String roomName,
            String bookingCode,
            String checkIn,
            String checkOut,
            String totalPrice,
            String paymentStatus,
            String detailUrl
    ) {
        // KHÔNG dùng ký tự % ngoài %s để tránh lỗi String.format
        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head>
              <meta charset="UTF-8" />
              <title>SBHotel - Xác nhận đặt phòng</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  background-color: #f3f5f7;
                  padding: 24px 12px;
                  margin: 0;
                }
                .wrapper {
                  max-width: 640px;
                  margin: 0 auto;
                  background: #ffffff;
                  border-radius: 16px;
                  overflow: hidden;
                  box-shadow: 0 10px 26px rgba(0,0,0,0.10);
                }
                .header {
                  background: #86B817;
                  padding: 22px 28px;
                  color: #ffffff;
                  display: flex;
                  align-items: center;
                }
                .logo-circle {
                  width: 44px;
                  height: 44px;
                  border-radius: 999px;
                  background: rgba(255,255,255,0.20);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: 800;
                  font-size: 17px;
                  margin-right: 14px;
                }
                .brand-text {
                  display: flex;
                  flex-direction: column;
                  line-height: 1.3;
                }
                .hotel-name {
                  font-size: 19px;
                  font-weight: 700;
                  letter-spacing: .4px;
                }
                .hotel-name .booking-code {
                  display: block;
                  font-size: 13px;
                  font-weight: 500;
                  opacity: .96;
                  margin-top: 2px;
                }

                .content {
                  padding: 24px 30px 22px;
                  color: #222222;
                  font-size: 14px;
                  line-height: 1.7;
                }
                .content p {
                  margin: 0 0 10px;
                }
                .content p:last-child {
                  margin-bottom: 0;
                }

                .box-title {
                  font-size: 13px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: .8px;
                  color: #7b7b7b;
                  margin: 18px 0 6px;
                }

                .info-box {
                  background: #fdfdeb;
                  border: 1px solid #ece5b8;
                  border-radius: 12px;
                  padding: 14px 18px 16px;
                  margin-bottom: 18px;
                }
                .info-row {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 4px;
                  font-size: 13px;
                }
                .info-label {
                  color: #666666;
                }
                .info-value {
                  font-weight: 600;
                  color: #333333;
                }

                .divider {
                  border-top: 1px dashed #d4d4d4;
                  margin: 10px 0 8px;
                }

                .total-row {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  font-size: 14px;
                  font-weight: 600;
                  margin-bottom: 4px;
                }
                .total-row .info-label {
                  color: #444444;
                }

                .status {
                  font-size: 13px;
                }
                .status span {
                  font-weight: 700;
                }
                .status-paid {
                  color: #2e7d32;
                }
                .status-unpaid {
                  color: #d32f2f;
                }

                .cta {
                  text-align: center;
                  margin: 20px 0 8px;
                }
                .cta a {
                  display: inline-block;
                  padding: 11px 26px;
                  background: #86B817;
                  color: #ffffff !important;
                  text-decoration: none;
                  border-radius: 999px;
                  font-size: 14px;
                  font-weight: 600;
                }
                .cta a:hover {
                  background: #6d9713;
                }

                .footer {
                  padding: 14px 26px 18px;
                  background: #fafafa;
                  text-align: center;
                  font-size: 11px;
                  color: #999999;
                }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <div class="header">
                  <div class="logo-circle">SB</div>
                  <div class="brand-text">
                    <div class="hotel-name">
                      %s<br/>
                      <span class="booking-code">Mã đặt phòng: %s</span>
                    </div>
                  </div>
                </div>

                <div class="content">
                  <p>Xin chào <strong>%s</strong>,</p>
                  <p>Cảm ơn bạn đã lựa chọn <strong>%s</strong>. Đơn đặt phòng của bạn đã được ghi nhận với thông tin sau:</p>

                  <div class="box-title">Thông tin đặt phòng</div>
                  <div class="info-box">
                    <div class="info-row">
                      <span class="info-label">Phòng:</span>
                      <span class="info-value">%s</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Ngày nhận phòng:</span>
                      <span class="info-value">%s</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Ngày trả phòng:</span>
                      <span class="info-value">%s</span>
                    </div>

                    <div class="divider"></div>

                    <div class="total-row">
                      <span class="info-label">Tổng tiền:</span>
                      <span class="info-value">%s (USD)</span>
                    </div>
                    <div class="status">
                      Trạng thái:
                      <span class="%s">%s</span>
                    </div>
                  </div>

                  <div class="cta">
                    <a href="%s" target="_blank" rel="noopener noreferrer">
                      Xem chi tiết đặt phòng
                    </a>
                  </div>

                  <p>Nếu có bất kỳ thắc mắc nào, bạn có thể trả lời trực tiếp email này hoặc liên hệ đội ngũ hỗ trợ SBHotel.</p>
                  <p>Chúc bạn có một kỳ nghỉ thật tuyệt vời! 💚</p>
                </div>

                <div class="footer">
                  © 2025 SBHotel. Đây là email tự động, vui lòng không trả lời nếu không cần thiết.<br/>
                  Website: sbhotel.local • Hotline: 1900 123 456
                </div>
              </div>
            </body>
            </html>
            """,
                hotelName,                         // %s 1
                bookingCode,                       // %s 2
                guestName,                         // %s 3
                hotelName,                         // %s 4
                roomName,                          // %s 5
                checkIn,                           // %s 6
                checkOut,                          // %s 7
                totalPrice,                        // %s 8
                bookingStatusClass(paymentStatus), // %s 9
                paymentStatus,                     // %s 10
                detailUrl                          // %s 11
        );
    }

    private String bookingStatusClass(String paymentStatus) {
        if ("ĐÃ THANH TOÁN".equalsIgnoreCase(paymentStatus)) {
            return "status-paid";
        }
        return "status-unpaid";
    }
}
