package com.java.hotel.service;

import com.java.hotel.model.NewsletterSubscriber;
import com.java.hotel.repository.NewsletterSubscriberRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class NewsletterService {

    private final NewsletterSubscriberRepository repo;
    private final EmailService emailService;

    public NewsletterService(NewsletterSubscriberRepository repo,
                             EmailService emailService) {
        this.repo = repo;
        this.emailService = emailService;
    }

    /**
     * PUBLIC: Đăng ký newsletter
     *  - validate email
     *  - lưu DB nếu chưa tồn tại
     *  - gửi email Welcome
     */
    public String subscribe(String rawEmail) {
        if (!StringUtils.hasText(rawEmail)) {
            throw new IllegalArgumentException("Email is required");
        }

        String email = rawEmail.trim().toLowerCase();

        // validate format đơn giản
        if (!email.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new IllegalArgumentException("Invalid email format");
        }

        // nếu đã tồn tại, không lưu lại nữa
        if (repo.existsByEmailIgnoreCase(email)) {
            return "This email is already subscribed.";
        }

        NewsletterSubscriber subscriber = new NewsletterSubscriber(email);
        repo.save(subscriber);

        // gửi email welcome
        emailService.sendNewsletterWelcome(email);

        return "Subscribed successfully.";
    }

    // ===== ADMIN: lấy tất cả subscribers =====
    public List<NewsletterSubscriber> getAllSubscribers() {
        return repo.findAllByOrderByCreatedAtDesc();
    }

    // ===== ADMIN: xoá 1 subscriber =====
    public void deleteSubscriber(Long id) {
        repo.deleteById(id);
    }
}
