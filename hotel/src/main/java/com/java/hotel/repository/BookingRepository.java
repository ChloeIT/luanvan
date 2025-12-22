// src/main/java/com/java/hotel/repository/BookingRepository.java
package com.java.hotel.repository;

import com.java.hotel.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // ====== FETCH JOIN DÙNG CHO ADMIN / MOD ======
    @Query("""
           SELECT DISTINCT b
           FROM Booking b
           LEFT JOIN FETCH b.user u
           LEFT JOIN FETCH b.rooms r
           LEFT JOIN FETCH r.hotel
           LEFT JOIN FETCH b.review
           ORDER BY b.checkIn DESC
           """)
    List<Booking> findAllWithRoomsAndHotel();

    @Query("""
           SELECT DISTINCT b
           FROM Booking b
           LEFT JOIN FETCH b.user u
           LEFT JOIN FETCH b.rooms r
           LEFT JOIN FETCH r.hotel
           LEFT JOIN FETCH b.review
           WHERE b.id = :id
           """)
    Optional<Booking> findByIdWithRoomsAndHotel(@Param("id") Long id);

    @Query("""
           SELECT DISTINCT b
           FROM Booking b
           JOIN b.rooms r
           JOIN r.hotel h
           LEFT JOIN FETCH b.user u
           LEFT JOIN FETCH b.review
           LEFT JOIN FETCH b.rooms rr
           LEFT JOIN FETCH rr.hotel
           WHERE h.owner.id = :ownerId
           ORDER BY b.checkIn DESC
           """)
    List<Booking> findAllByHotelOwner(@Param("ownerId") Long ownerId);

    // ✅ USER: chỉ lấy booking của user hiện tại (có join rooms + hotel + review + user)
    @Query("""
           SELECT DISTINCT b
           FROM Booking b
           LEFT JOIN FETCH b.user u
           LEFT JOIN FETCH b.rooms r
           LEFT JOIN FETCH r.hotel
           LEFT JOIN FETCH b.review
           WHERE u.id = :userId
           ORDER BY b.checkIn DESC
           """)
    List<Booking> findAllByUserId(@Param("userId") Long userId);


    // ==================================================
    // ================  CHECK TRÙNG NGÀY  ===============
    // ==================================================
    @Query("""
           SELECT b
           FROM Booking b
           JOIN b.rooms r
           WHERE r.id = :roomId
             AND :checkIn < b.checkOut
             AND :checkOut > b.checkIn
           """)
    List<Booking> findOverlappingBookings(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDateTime checkIn,
            @Param("checkOut") LocalDateTime checkOut
    );

    @Query("""
           SELECT b
           FROM Booking b
           JOIN b.rooms r
           WHERE r.id = :roomId
             AND b.id <> :bookingId
             AND :checkIn < b.checkOut
             AND :checkOut > b.checkIn
           """)
    List<Booking> findOverlappingBookingsForUpdate(
            @Param("bookingId") Long bookingId,
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDateTime checkIn,
            @Param("checkOut") LocalDateTime checkOut
    );
}
