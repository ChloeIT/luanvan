package com.java.hotel.repository;

import com.java.hotel.model.Contact;
import com.java.hotel.model.Contact.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContactRepository extends JpaRepository<Contact, Long> {

    // để sau này Admin lọc PENDING...
    List<Contact> findByStatus(Status status);
}
