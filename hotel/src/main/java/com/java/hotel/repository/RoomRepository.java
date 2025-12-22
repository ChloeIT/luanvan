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

    // Lấy danh sách Room theo list id (dùng cho BookingService)
    List<Room> findByIdIn(Collection<Long> ids);

    // Lấy tất cả Room thuộc các hotel mà owner_id = :ownerId (ADMIN/MOD dashboard)
    @Query("SELECT r FROM Room r WHERE r.hotel.owner.id = :ownerId")
    List<Room> findByHotelOwnerId(@Param("ownerId") Long ownerId);

    // ✅ NEW: ADMIN/MOD xem full rooms theo hotel (gồm availability true/false)
    List<Room> findByHotelId(Long hotelId);

    // ✅ NEW: PUBLIC/Customer - rooms theo hotel chỉ lấy availability=true
    @Query("SELECT r FROM Room r WHERE r.hotel.id = :hotelId AND r.availability = true")
    List<Room> findByHotelIdActive(@Param("hotelId") Long hotelId);

    // ✅ NEW: PUBLIC/Customer - all rooms chỉ lấy availability=true (Home/RoomsPage)
    @Query("SELECT r FROM Room r WHERE r.availability = true")
    List<Room> findAllActive();

    // Lấy các phòng TRỐNG trong một khoảng thời gian cho 1 hotel
    // ✅ Sửa: chỉ xét rooms availability=true
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
             )
           """)
    List<Room> findAvailableRoomsForHotel(
            @Param("hotelId") Long hotelId,
            @Param("checkIn") LocalDateTime checkIn,
            @Param("checkOut") LocalDateTime checkOut
    );

    // ✅ check FK booking_room -> room (room đã từng được đặt chưa)
    @Query(value = "SELECT EXISTS(SELECT 1 FROM booking_room br WHERE br.room_id = :roomId)", nativeQuery = true)
    int existsInBookingRoom(@Param("roomId") Long roomId);
}
