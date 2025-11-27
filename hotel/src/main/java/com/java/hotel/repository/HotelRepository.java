package com.java.hotel.repository;

import com.java.hotel.model.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    // Tìm hotel theo tên (đã có từ trước)
    List<Hotel> findByName(String name);

    // ⭐ Lấy tất cả hotel mà owner_id = ownerId (User.id)
    @Query("SELECT h FROM Hotel h WHERE h.owner.id = :ownerId")
    List<Hotel> findByOwnerId(@Param("ownerId") Long ownerId);
}
