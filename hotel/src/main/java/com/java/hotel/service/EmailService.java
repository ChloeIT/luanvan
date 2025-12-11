package com.java.hotel.service;

import com.java.hotel.model.Booking;
import com.java.hotel.model.Contact;
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
    private String from;   // Email gửi (config trong application.properties)

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // =====================================================
    // 1. EMAIL TEXT ĐƠN GIẢN
    // =====================================================
    public void sendSimpleEmail(String to, String subject, String text) {
        if (to == null || to.isBlank()) return;

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(text);

        mailSender.send(msg);
    }

    // =====================================================
    // 2. EMAIL HTML CHUNG
    // =====================================================
    public void sendHtmlEmail(String to, String subject, String htmlContent)
            throws MessagingException {

        if (to == null || to.isBlank()) return;

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper =
                new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(from);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    // =====================================================
    // 3. MAIL CHO KHÁCH (BOOKING CONFIRMATION)
    // =====================================================
    @Async
    public void sendBookingConfirmation(Booking booking) {
        if (booking == null) return;

        User user = booking.getUser();
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            return;
        }

        String to = user.getEmail();

        String guestName =
                (user.getFullName() != null && !user.getFullName().isBlank())
                        ? user.getFullName()
                        : user.getUsername();

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

        Long id = booking.getId();
        String bookingCode = (id != null)
                ? String.format("SBH-%06d", id)
                : "SBH-XXXXXX";

        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String checkInStr = (booking.getCheckIn() != null)
                ? booking.getCheckIn().toLocalDate().format(dateFmt)
                : "-";
        String checkOutStr = (booking.getCheckOut() != null)
                ? booking.getCheckOut().toLocalDate().format(dateFmt)
                : "-";

        float price = booking.getTotalPrice();
        String totalPriceStr = String.format(Locale.US, "$%,.2f", price);

        String paymentStatus = booking.isPayment()
                ? "ĐÃ THANH TOÁN"
                : "CHƯA THANH TOÁN";

        String detailUrl = "https://sbhotel.local/booking/" + bookingCode;

        String subject = "SBHotel – Xác nhận đặt phòng " + bookingCode;

        String html = buildBookingConfirmationHtmlForGuest(
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

        System.out.println(">>> Sending booking email to CUSTOMER " + to +
                " for booking " + bookingCode);

        try {
            sendHtmlEmail(to, subject, html);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    // =====================================================
    // 4. MAIL CHO HOTEL OWNER / MOD KHI CÓ BOOKING MỚI
    // =====================================================
    @Async
    public void sendNewBookingToOwner(Booking booking) {
        if (booking == null) return;

        Set<Room> roomSet = booking.getRooms();
        Room room = (roomSet != null && !roomSet.isEmpty())
                ? roomSet.iterator().next()
                : null;

        if (room == null || room.getHotel() == null) {
            return;
        }

        User owner = room.getHotel().getOwner();
        if (owner == null || owner.getEmail() == null || owner.getEmail().isBlank()) {
            return;
        }

        String to = owner.getEmail();

        User guest = booking.getUser();
        String guestName =
                (guest != null && guest.getFullName() != null && !guest.getFullName().isBlank())
                        ? guest.getFullName()
                        : (guest != null ? guest.getUsername() : "Khách");

        String guestEmail = (guest != null) ? guest.getEmail() : null;

        String roomName =
                (room.getName() != null)
                        ? room.getName()
                        : "Room";

        String hotelName =
                (room.getHotel().getName() != null)
                        ? room.getHotel().getName()
                        : "SBHotel";

        Long id = booking.getId();
        String bookingCode = (id != null)
                ? String.format("SBH-%06d", id)
                : "SBH-XXXXXX";

        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        String checkInStr = (booking.getCheckIn() != null)
                ? booking.getCheckIn().toLocalDate().format(dateFmt)
                : "-";
        String checkOutStr = (booking.getCheckOut() != null)
                ? booking.getCheckOut().toLocalDate().format(dateFmt)
                : "-";

        float price = booking.getTotalPrice();
        String totalPriceStr = String.format(Locale.US, "$%,.2f", price);

        String paymentStatus = booking.isPayment()
                ? "ĐÃ THANH TOÁN"
                : "CHƯA THANH TOÁN";

        String detailUrl = "https://sbhotel.local/mod/bookings?code=" + bookingCode;

        String subject = "SBHotel – Đặt phòng mới tại " + hotelName;

        String html = buildNewBookingHtmlForOwner(
                hotelName,
                bookingCode,
                guestName,
                guestEmail,
                roomName,
                checkInStr,
                checkOutStr,
                totalPriceStr,
                paymentStatus,
                detailUrl
        );

        System.out.println(">>> Sending NEW BOOKING email to OWNER " + to +
                " for booking " + bookingCode);

        try {
            sendHtmlEmail(to, subject, html);
        } catch (MessagingException e) {
            e.printStackTrace();
        }
    }

    // =====================================================
    // 5. TEMPLATE HTML CHO KHÁCH
    // =====================================================
    private String buildBookingConfirmationHtmlForGuest(
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
        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                  <meta charset="UTF-8" />
                  <title>SBHotel - Xác nhận đặt phòng</title>
                </head>
                <body style="font-family: Arial, sans-serif; background-color:#f5f5f5; padding:24px;">
                  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;padding:24px;">
                    <h2 style="color:#333333;margin-top:0;">Xin chào %s,</h2>
                    <p>Cảm ơn bạn đã đặt phòng tại <strong>%s</strong>.</p>

                    <p style="margin:16px 0 8px;">Thông tin đặt phòng:</p>
                    <p><strong>Mã đặt phòng:</strong> %s</p>
                    <p><strong>Phòng:</strong> %s</p>
                    <p><strong>Check-in:</strong> %s</p>
                    <p><strong>Check-out:</strong> %s</p>
                    <p><strong>Tổng tiền:</strong> %s</p>
                    <p><strong>Thanh toán:</strong> %s</p>

                    <p style="margin-top:16px;">
                      Bạn có thể xem chi tiết đơn đặt phòng tại:
                      <a href="%s" target="_blank" rel="noopener">Xem chi tiết</a>
                    </p>

                    <p style="margin-top:16px;">Trân trọng,<br/>SB Hotel</p>
                  </div>
                </body>
                </html>
                """
                .formatted(
                        guestName,
                        hotelName,
                        bookingCode,
                        roomName,
                        checkIn,
                        checkOut,
                        totalPrice,
                        paymentStatus,
                        detailUrl
                );
    }

    // =====================================================
    // 6. TEMPLATE HTML CHO OWNER
    // =====================================================
    private String buildNewBookingHtmlForOwner(
            String hotelName,
            String bookingCode,
            String guestName,
            String guestEmail,
            String roomName,
            String checkIn,
            String checkOut,
            String totalPrice,
            String paymentStatus,
            String detailUrl
    ) {
        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                  <meta charset="UTF-8" />
                  <title>SBHotel - Đặt phòng mới</title>
                </head>
                <body style="font-family: Arial, sans-serif; background-color:#f5f5f5; padding:24px;">
                  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;padding:24px;">
                    <h2 style="color:#333333;margin-top:0;">Khách mới đặt phòng tại %s</h2>

                    <p style="margin:8px 0;">Mã đặt phòng: <strong>%s</strong></p>

                    <p style="margin:16px 0 8px;">Thông tin khách:</p>
                    <p><strong>Tên khách:</strong> %s</p>
                    <p><strong>Email:</strong> %s</p>

                    <p style="margin:16px 0 8px;">Thông tin đặt phòng:</p>
                    <p><strong>Phòng:</strong> %s</p>
                    <p><strong>Check-in:</strong> %s</p>
                    <p><strong>Check-out:</strong> %s</p>
                    <p><strong>Tổng tiền:</strong> %s</p>
                    <p><strong>Thanh toán:</strong> %s</p>

                    <p style="margin-top:16px;">
                      Xem chi tiết booking tại:
                      <a href="%s" target="_blank" rel="noopener">Trang quản lý booking</a>
                    </p>

                    <p style="margin-top:16px;">Trân trọng,<br/>SB Hotel System</p>
                  </div>
                </body>
                </html>
                """
                .formatted(
                        hotelName,
                        bookingCode,
                        guestName,
                        (guestEmail != null ? guestEmail : "-"),
                        roomName,
                        checkIn,
                        checkOut,
                        totalPrice,
                        paymentStatus,
                        detailUrl
                );
    }

    // =====================================================
    // 7. CSS CLASS CHO TRẠNG THÁI THANH TOÁN (nếu cần dùng)
    // =====================================================
    private String bookingStatusClass(String paymentStatus) {
        if ("ĐÃ THANH TOÁN".equalsIgnoreCase(paymentStatus)) {
            return "status-paid";
        }
        return "status-unpaid";
    }

    // =====================================================
    // 8. EMAIL CHO CONTACT (ADMIN + KHÁCH)
    // =====================================================
    @Async
    public void sendContactEmails(Contact contact, String adminEmail) {
        if (contact == null) return;

        // 8.1. Gửi cho ADMIN
        if (adminEmail != null && !adminEmail.isBlank()) {
            String subjectAdmin = "📩 New Contact from " + contact.getName();

            StringBuilder bodyAdmin = new StringBuilder();
            bodyAdmin.append("You have received a new contact message from SB Hotels.\n\n")
                    .append("Name: ").append(contact.getName()).append("\n")
                    .append("Email: ").append(contact.getEmail()).append("\n");

            if (contact.getTopic() != null && !contact.getTopic().isBlank()) {
                bodyAdmin.append("Topic: ").append(contact.getTopic()).append("\n");
            }
            if (contact.getSubject() != null && !contact.getSubject().isBlank()) {
                bodyAdmin.append("Subject: ").append(contact.getSubject()).append("\n");
            }

            bodyAdmin.append("\nMessage:\n")
                    .append(contact.getMessage()).append("\n\n")
                    .append("Status: ").append(contact.getStatus()).append("\n")
                    .append("Created at: ").append(contact.getCreatedAt());

            sendSimpleEmail(adminEmail, subjectAdmin, bodyAdmin.toString());
        }

        // 8.2. Gửi auto-reply cho KHÁCH
        if (contact.getEmail() != null && !contact.getEmail().isBlank()) {
            String subjectUser = "We received your message - SB Hotels";

            String bodyUser = "Hi " + contact.getName() + ",\n\n" +
                    "Thank you for contacting SB Hotels.\n" +
                    "We have received your message and our support team will get back to you as soon as possible.\n\n" +
                    "Your message:\n" +
                    contact.getMessage() + "\n\n" +
                    "Best regards,\n" +
                    "SB Hotels Support Team";

            sendSimpleEmail(contact.getEmail(), subjectUser, bodyUser);
        }
    }

    // =====================================================
    // 9. EMAIL WELCOME CHO NEWSLETTER
    // =====================================================
    @Async
    public void sendNewsletterWelcome(String to) {
        if (to == null || to.isBlank()) return;

        String subject = "Welcome to SB Hotel Newsletter";

        String body = """
                Xin chào,

                Cảm ơn bạn đã đăng ký nhận bản tin từ SB Hotel.
                Chúng tôi sẽ gửi cho bạn các ưu đãi độc quyền, mã giảm giá
                và mẹo du lịch hữu ích tại Cần Thơ.

                Nếu đây không phải là bạn, vui lòng bỏ qua email này.

                Thân mến,
                SB Hotel
                """;

        sendSimpleEmail(to, subject, body);
    }

    // =====================================================
    // 10. EMAIL KHUYẾN MÃI CHO NEWSLETTER (ADMIN GỬI)
    // =====================================================
    @Async
    public void sendNewsletterPromotion(String to, String subject, String content) {
        if (to == null || to.isBlank()) return;

        String safeSubject = (subject == null || subject.isBlank())
                ? "SB Hotel Promotion"
                : subject;

        String safeContent = (content == null || content.isBlank())
                ? """
                   Xin chào,

                   SB Hotel gửi đến bạn một số ưu đãi mới.
                   Vui lòng truy cập website SB Hotel để xem chi tiết.

                   Thân mến,
                   SB Hotel
                   """
                : content;

        sendSimpleEmail(to, safeSubject, safeContent);
    }
}
