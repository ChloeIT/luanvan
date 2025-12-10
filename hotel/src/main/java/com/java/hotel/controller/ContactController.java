package com.java.hotel.controller;

import com.java.hotel.model.Contact;
import com.java.hotel.payload.request.ContactRequest;
import com.java.hotel.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    // ====== Tạo contact từ trang Contact Us ======
    @PostMapping
    public ResponseEntity<Map<String, String>> createContact(
            @Valid @RequestBody ContactRequest request
    ) {
        contactService.createContact(request);
        return ResponseEntity.ok(Map.of("message", "Sent"));
    }

    // ====== Cập nhật status (PENDING / IN_PROGRESS / DONE) ======
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestParam("status") Contact.Status status
    ) {
        Contact updated = contactService.updateStatus(id, status);

        // 👉 Chỉ trả đơn giản để tránh lỗi serialize Hibernate LAZY
        return ResponseEntity.ok(
                Map.of(
                        "id", updated.getId(),
                        "status", updated.getStatus().name()
                )
        );
    }
}
