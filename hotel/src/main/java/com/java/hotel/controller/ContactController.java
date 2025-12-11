package com.java.hotel.controller;

import com.java.hotel.model.Contact;
import com.java.hotel.payload.request.ContactRequest;
import com.java.hotel.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    // ====== PUBLIC: Tạo contact từ trang Contact Us ======
    @PostMapping
    public ResponseEntity<Map<String, String>> createContact(
            @Valid @RequestBody ContactRequest request
    ) {
        contactService.createContact(request);
        return ResponseEntity.ok(Map.of("message", "Sent"));
    }

    // ====== ADMIN: Lấy toàn bộ contact ======
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Contact>> getAllContacts() {
        return ResponseEntity.ok(contactService.getAllContacts());
    }

    // (tuỳ chọn) ADMIN: Lọc theo status, nếu muốn dùng:
    @GetMapping("/admin/by-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Contact>> getByStatus(
            @RequestParam("status") Contact.Status status
    ) {
        return ResponseEntity.ok(contactService.getContactsByStatus(status));
    }

    // ====== ADMIN: Cập nhật status (PENDING / IN_PROGRESS / DONE) ======
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable Long id,
            @RequestParam("status") Contact.Status status
    ) {
        Contact updated = contactService.updateStatus(id, status);

        // trả gọn, tránh vấn đề LAZY
        return ResponseEntity.ok(
                Map.of(
                        "id", updated.getId(),
                        "status", updated.getStatus().name()
                )
        );
    }
}
