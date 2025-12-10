package com.java.hotel.controller;

import com.java.hotel.payload.request.NewsletterRequest;
import com.java.hotel.service.NewsletterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/newsletter")
@CrossOrigin(origins = "*")
public class NewsletterController {

    private final NewsletterService newsletterService;

    public NewsletterController(NewsletterService newsletterService) {
        this.newsletterService = newsletterService;
    }

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestBody NewsletterRequest request) {
        String msg = newsletterService.subscribe(request.getEmail());
        // Trả về message dạng text, FE sẽ show bằng antd message
        return ResponseEntity.ok(msg);
    }
}
