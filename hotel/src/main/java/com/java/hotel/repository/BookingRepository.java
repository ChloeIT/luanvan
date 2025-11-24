package com.java.hotel.repository;

import com.java.hotel.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT DISTINCT b FROM Booking b " +
            "LEFT JOIN FETCH b.rooms r " +
            "LEFT JOIN FETCH r.hotel")
    List<Booking> findAllWithRoomsAndHotel();

    @Query("SELECT b FROM Booking b " +
            "LEFT JOIN FETCH b.rooms r " +
            "LEFT JOIN FETCH r.hotel " +
            "WHERE b.id = :id")
    Optional<Booking> findByIdWithRoomsAndHotel(@Param("id") Long id);
}
