package com.java.hotel.repository;

import com.java.hotel.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    // JpaRepository đã cung cấp các phương thức CRUD như save, findById, delete, findAll
    // Bạn có thể thêm các phương thức tùy chỉnh khác tại đây nếu cần
}
