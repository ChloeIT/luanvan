package com.java.hotel.repository;

import com.java.hotel.model.Contact;
import com.java.hotel.model.Contact.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContactRepository extends JpaRepository<Contact, Long> {

    // Lọc theo trạng thái (PENDING / IN_PROGRESS / DONE)
    List<Contact> findByStatus(Status status);

    // Lấy tất cả contact, mới nhất lên trên
    List<Contact> findAllByOrderByCreatedAtDesc();
}
