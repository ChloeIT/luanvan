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
    private String from;   // Email gửi (config trong application.properties)

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // 1. EMAIL TEXT ĐƠN GIẢN
    public void sendSimpleEmail(String to, String subject, String text) {
        if (to == null || to.isBlank()) return;

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(text);

        mailSender.send(msg);
    }

    // 2. EMAIL HTML CHUNG
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

    // 3. MAIL CHO KHÁCH (BOOKING CONFIRMATION)
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

    // 4. MAIL CHO HOTEL OWNER / MOD KHI CÓ BOOKING MỚI
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

    // 5. TEMPLATE CHO KHÁCH
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
        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head>
              <meta charset="UTF-8" />
              <title>SBHotel - Xác nhận đặt phòng</title>
              ...
            </head>
            <body> ... (template như bạn đang dùng, giữ nguyên) ... </body>
            </html>
            """,
                hotelName,
                bookingCode,
                guestName,
                hotelName,
                roomName,
                checkIn,
                checkOut,
                totalPrice,
                bookingStatusClass(paymentStatus),
                paymentStatus,
                detailUrl
        );
    }

    // 6. TEMPLATE CHO OWNER
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
        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head>
              <meta charset="UTF-8" />
              <title>SBHotel - Đặt phòng mới</title>
              ...
            </head>
            <body> ... (template như bạn đang dùng, giữ nguyên) ... </body>
            </html>
            """,
                hotelName,
                bookingCode,
                guestName,
                (guestEmail != null ? guestEmail : "-"),
                roomName,
                checkIn,
                checkOut,
                totalPrice,
                bookingStatusClass(paymentStatus),
                paymentStatus,
                detailUrl
        );
    }

    // 7. CSS CLASS CHO TRẠNG THÁI THANH TOÁN
    private String bookingStatusClass(String paymentStatus) {
        if ("ĐÃ THANH TOÁN".equalsIgnoreCase(paymentStatus)) {
            return "status-paid";
        }
        return "status-unpaid";
    }
}
