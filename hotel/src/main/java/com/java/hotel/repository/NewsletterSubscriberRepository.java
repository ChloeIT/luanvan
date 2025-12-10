package com.java.hotel.repository;

import com.java.hotel.model.NewsletterSubscriber;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsletterSubscriberRepository
        extends JpaRepository<NewsletterSubscriber, Long> {

    boolean existsByEmailIgnoreCase(String email);
}
