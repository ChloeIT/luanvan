package com.java.hotel.repository;

import com.java.hotel.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByIdIn(Collection<Long> ids);

    @Query("SELECT r FROM Room r WHERE r.hotel.owner.id = :ownerId")
    List<Room> findByHotelOwnerId(@Param("ownerId") Long ownerId);

    List<Room> findByHotelId(Long hotelId);

    @Query("SELECT r FROM Room r WHERE r.hotel.id = :hotelId AND r.availability = true")
    List<Room> findByHotelIdActive(@Param("hotelId") Long hotelId);

    @Query("SELECT r FROM Room r WHERE r.availability = true")
    List<Room> findAllActive();

    /**
     * ✅ Available rooms (Option B):
     * - Room phải availability=true
     * - Room không được nằm trong các booking overlap "BLOCKING"
     *   BLOCKING nếu:
     *     (b.payment = true)  // PAID: luôn block
     *     OR
     *     (b.payment = false AND :now < cutoff(14:00 ngày check-in)) // UNPAID chỉ block trước cutoff
     */
    @Query("""
           SELECT r
           FROM Room r
           WHERE r.hotel.id = :hotelId
             AND r.availability = true
             AND r.id NOT IN (
                 SELECT r2.id
                 FROM Booking b
                 JOIN b.rooms r2
                 WHERE b.checkOut > :checkIn
                   AND b.checkIn < :checkOut
                   AND (
                        b.payment = true
                        OR (
                            b.payment = false
                            AND :now < function('timestamp', function('date', b.checkIn), '14:00:00')
                        )
                   )
             )
           """)
    List<Room> findAvailableRoomsForHotel(
            @Param("hotelId") Long hotelId,
            @Param("checkIn") LocalDateTime checkIn,
            @Param("checkOut") LocalDateTime checkOut,
            @Param("now") LocalDateTime now
    );

    @Query(value = "SELECT EXISTS(SELECT 1 FROM booking_room br WHERE br.room_id = :roomId)", nativeQuery = true)
    int existsInBookingRoom(@Param("roomId") Long roomId);
}
