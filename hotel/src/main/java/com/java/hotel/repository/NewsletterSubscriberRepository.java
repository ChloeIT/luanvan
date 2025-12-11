package com.java.hotel.repository;

import com.java.hotel.model.NewsletterSubscriber;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NewsletterSubscriberRepository
        extends JpaRepository<NewsletterSubscriber, Long> {

    boolean existsByEmailIgnoreCase(String email);

    // Admin xem danh sách, mới nhất lên trên
    List<NewsletterSubscriber> findAllByOrderByCreatedAtDesc();
}
