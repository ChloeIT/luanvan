package com.java.hotel.controller;

import com.java.hotel.service.EmailService;
import jakarta.mail.MessagingException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test-mail")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TestMailController {

    private final EmailService emailService;

    public TestMailController(EmailService emailService) {
        this.emailService = emailService;
    }

    // ===== 1. TEST MAIL TEXT đơn giản =====
    @GetMapping
    public ResponseEntity<String> testMail(@RequestParam String to) {
        emailService.sendSimpleEmail(
                to,
                "SBHotel – Test simple mail",
                "Đây là email test dạng text từ SBHotel."
        );
        return ResponseEntity.ok("Đã gửi simple email tới " + to);
    }

    // ===== 2. TEST MAIL HTML đơn giản =====
    @GetMapping("/html")
    public ResponseEntity<String> testMailHtml(@RequestParam String to)
            throws MessagingException {

        String html = """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                  <meta charset="UTF-8" />
                  <title>SBHotel - Test HTML</title>
                </head>
                <body>
                  <h1>SBHotel - Test HTML mail</h1>
                  <p>Đây là email HTML thử nghiệm từ SBHotel.</p>
                </body>
                </html>
                """;

        emailService.sendHtmlEmail(to, "SBHotel – Test HTML mail", html);
        return ResponseEntity.ok("Đã gửi email HTML test tới " + to);
    }
}
