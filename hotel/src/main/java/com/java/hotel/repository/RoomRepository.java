package com.java.hotel.repository;

import com.java.hotel.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    // Lấy danh sách Room theo list id (dùng cho BookingService)
    List<Room> findByIdIn(Collection<Long> ids);

    // ⭐ Lấy tất cả Room thuộc các hotel mà owner_id = :ownerId
    //   (đi đường: Room -> hotel -> owner -> id)
    @Query("SELECT r FROM Room r WHERE r.hotel.owner.id = :ownerId")
    List<Room> findByHotelOwnerId(@Param("ownerId") Long ownerId);
}
