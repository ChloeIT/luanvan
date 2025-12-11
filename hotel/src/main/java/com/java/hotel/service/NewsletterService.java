// src/main/java/com/java/hotel/service/NewsletterService.java
package com.java.hotel.service;

import com.java.hotel.model.NewsletterSubscriber;
import com.java.hotel.repository.NewsletterSubscriberRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
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
     * PUBLIC: Khách đăng ký newsletter ở Footer
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

    /**
     * ADMIN: gửi email khuyến mãi
     *
     *  - Nếu ids null / rỗng  => gửi cho TẤT CẢ subscribers
     *  - Nếu ids có giá trị   => gửi cho các subscriber này
     *
     * @return số subscriber đã gửi
     */
    public int sendPromotion(List<Long> ids, String subject, String content) {
        if (!StringUtils.hasText(subject)) {
            throw new IllegalArgumentException("Subject is required");
        }
        if (!StringUtils.hasText(content)) {
            throw new IllegalArgumentException("Content is required");
        }

        List<NewsletterSubscriber> targets;

        // không truyền ids => gửi cho tất cả
        if (ids == null || ids.isEmpty()) {
            targets = repo.findAllByOrderByCreatedAtDesc();
        } else {
            Iterable<NewsletterSubscriber> iterable = repo.findAllById(ids);
            targets = new ArrayList<>();
            iterable.forEach(targets::add);
        }

        if (targets.isEmpty()) {
            return 0;
        }

        String cleanSubject = subject.trim();
        String cleanContent = content.trim();

        for (NewsletterSubscriber s : targets) {
            String email = s.getEmail();
            if (!StringUtils.hasText(email)) continue;

            // gọi qua EmailService để gửi mail khuyến mãi
            emailService.sendNewsletterPromotion(email, cleanSubject, cleanContent);
        }

        return targets.size();
    }
}
