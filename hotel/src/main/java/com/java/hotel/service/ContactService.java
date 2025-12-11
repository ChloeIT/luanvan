package com.java.hotel.service;

import com.java.hotel.model.Contact;
import com.java.hotel.model.User;
import com.java.hotel.payload.request.ContactRequest;
import com.java.hotel.repository.ContactRepository;
import com.java.hotel.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ContactService {

    // Mail ADMIN nhận contact (dùng ở chỗ gửi email – để TODO sau)
    private static final String ADMIN_EMAIL = "saoluune1207@gmail.com";

    private final ContactRepository contactRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public ContactService(ContactRepository contactRepository,
                          UserRepository userRepository,
                          EmailService emailService) {
        this.contactRepository = contactRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    /**
     * Tạo contact mới từ form Contact Us.
     * - Lưu DB (status = PENDING)
     * - Gắn user nếu đang đăng nhập
     * - Trigger gửi email (async) cho admin + khách
     */
    @Transactional
    public Contact createContact(ContactRequest request) {
        Contact c = new Contact();
        c.setName(request.getName());
        c.setEmail(request.getEmail());
        c.setSubject(request.getSubject());
        c.setTopic(request.getTopic());
        c.setMessage(request.getMessage());
        c.setStatus(Contact.Status.PENDING);

        // Gắn user nếu có đăng nhập
        User currentUser = getCurrentUserOrNull();
        if (currentUser != null) {
            c.setUser(currentUser);
        }

        Contact saved = contactRepository.save(c);

        // Gửi email ở background (async) – không chặn response
        try {
            emailService.sendContactEmails(saved, ADMIN_EMAIL);
        } catch (Exception e) {
            System.err.println("Failed to trigger contact emails: " + e.getMessage());
        }

        return saved;
    }

    /** ADMIN: Lấy toàn bộ contact (mới nhất lên trên). */
    @Transactional(readOnly = true)
    public List<Contact> getAllContacts() {
        return contactRepository.findAllByOrderByCreatedAtDesc();
    }

    /** ADMIN: Lọc contact theo status. */
    @Transactional(readOnly = true)
    public List<Contact> getContactsByStatus(Contact.Status status) {
        return contactRepository.findByStatus(status);
    }

    /**
     * USER: Lấy các contact do chính user hiện tại gửi (mới nhất lên trên).
     * Dùng cho trang Profile → My support messages.
     */
    @Transactional(readOnly = true)
    public List<Contact> getMyContacts() {
        User currentUser = getCurrentUserOrNull();
        if (currentUser == null) {
            throw new RuntimeException("User must be authenticated to view their contacts.");
        }
        return contactRepository.findByUserOrderByCreatedAtDesc(currentUser);
    }

    /**
     * ADMIN: Cập nhật trạng thái contact (PENDING / DONE) qua dropdown.
     * DONE là trạng thái cuối, không cho đổi ngược lại PENDING.
     */
    @Transactional
    public Contact updateStatus(Long id, Contact.Status status) {
        Contact c = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found with id = " + id));

        // Không cho đổi từ DONE về PENDING
        if (c.getStatus() == Contact.Status.DONE && status == Contact.Status.PENDING) {
            throw new RuntimeException("Cannot change DONE contact back to PENDING.");
        }

        c.setStatus(status);
        return contactRepository.save(c);
    }

    /**
     * ADMIN: Reply cho contact → lưu nội dung + set trạng thái DONE.
     */
    @Transactional
    public Contact replyToContact(Long id, String reply) {
        Contact c = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found with id = " + id));

        c.setAdminReply(reply);
        c.setStatus(Contact.Status.DONE);
        c.setRepliedAt(LocalDateTime.now());

        Contact saved = contactRepository.save(c);

        // TODO: gửi email phản hồi cho khách sau này
        // try {
        //     emailService.sendContactReplyEmail(saved);
        // } catch (Exception e) {
        //     System.err.println("Failed to send contact reply email: " + e.getMessage());
        // }

        return saved;
    }

    // ===== Helpers =====

    private User getCurrentUserOrNull() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) return null;
            String username = auth.getName();
            if ("anonymousUser".equals(username)) return null;
            return userRepository.findByUsername(username).orElse(null);
        } catch (Exception e) {
            return null;
        }
    }
}
