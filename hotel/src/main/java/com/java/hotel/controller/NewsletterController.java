// src/main/java/com/java/hotel/controller/NewsletterController.java
package com.java.hotel.controller;

import com.java.hotel.model.NewsletterSubscriber;
import com.java.hotel.payload.request.NewsletterRequest;
import com.java.hotel.service.NewsletterService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/newsletter")
@CrossOrigin(origins = "*")
public class NewsletterController {

    private final NewsletterService newsletterService;

    public NewsletterController(NewsletterService newsletterService) {
        this.newsletterService = newsletterService;
    }

    // ===== PUBLIC: khách sign up newsletter =====
    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody NewsletterRequest request) {
        String msg = newsletterService.subscribe(request.getEmail());
        return ResponseEntity.ok(msg);
    }

    // ===== ADMIN: xem tất cả subscribers =====
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<NewsletterSubscriber>> getAll() {
        return ResponseEntity.ok(newsletterService.getAllSubscribers());
    }

    // ===== ADMIN: xoá 1 subscriber =====
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        newsletterService.deleteSubscriber(id);
        return ResponseEntity.noContent().build();
    }

    // ===== ADMIN: gửi mail khuyến mãi tới subscribers =====
    @PostMapping("/admin/send")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> sendPromotion(@RequestBody NewsletterRequest request) {
        int count = newsletterService.sendPromotion(
                request.getIds(),
                request.getSubject(),
                request.getContent()
        );

        if (count == 0) {
            return ResponseEntity.badRequest().body("No subscribers to send.");
        }

        return ResponseEntity.ok("Newsletter sent to " + count + " subscriber(s).");
    }
}
