package com.java.hotel.repository;

import com.java.hotel.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Lấy tất cả booking, kèm rooms + hotel (admin)
    @Query("SELECT DISTINCT b FROM Booking b " +
            "LEFT JOIN FETCH b.rooms r " +
            "LEFT JOIN FETCH r.hotel")
    List<Booking> findAllWithRoomsAndHotel();

    // Lấy 1 booking theo id, kèm rooms + hotel
    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.rooms r " +
            "LEFT JOIN FETCH r.hotel " +
            "WHERE b.id = :id")
    Optional<Booking> findByIdWithRoomsAndHotel(@Param("id") Long id);

    // Lấy tất cả booking của các hotel thuộc owner (MOD xem booking của mình)
    @Query("""
           SELECT DISTINCT b
           FROM Booking b
           JOIN b.rooms r
           JOIN r.hotel h
           WHERE h.owner.id = :ownerId
           """)
    List<Booking> findAllByHotelOwner(@Param("ownerId") Long ownerId);
}
