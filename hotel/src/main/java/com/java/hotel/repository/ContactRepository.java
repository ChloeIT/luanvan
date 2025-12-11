package com.java.hotel.repository;

import com.java.hotel.model.Contact;
import com.java.hotel.model.Contact.Status;
import com.java.hotel.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContactRepository extends JpaRepository<Contact, Long> {

    // Lọc theo trạng thái (PENDING / DONE)
    List<Contact> findByStatus(Status status);

    // Lấy tất cả contact, mới nhất lên trên
    List<Contact> findAllByOrderByCreatedAtDesc();

    // Lấy contact của 1 user cụ thể, mới nhất lên trên (dùng cho trang Profile)
    List<Contact> findByUserOrderByCreatedAtDesc(User user);
}
