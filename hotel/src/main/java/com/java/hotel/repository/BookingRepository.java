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
           LEFT JOIN FETCH b.rooms r
           LEFT JOIN FETCH r.hotel
           LEFT JOIN FETCH b.review
           """)
    List<Booking> findAllWithRoomsAndHotel();

    @Query("""
           SELECT b
           FROM Booking b
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
           WHERE h.owner.id = :ownerId
           """)
    List<Booking> findAllByHotelOwner(@Param("ownerId") Long ownerId);

    // ==================================================
    // ================  CHECK TRÙNG NGÀY  ===============
    // ==================================================

    /**
     * Lấy danh sách booking bị overlap theo roomId để Service tự filter theo rule:
     *  - PAID: luôn blocking
     *  - UNPAID: chỉ blocking nếu now < cutoff(14:00 ngày check-in)
     */
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

    /**
     * Dùng khi UPDATE: bỏ qua chính booking đang sửa.
     */
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
