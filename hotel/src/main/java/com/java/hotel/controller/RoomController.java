package com.java.hotel.controller;

import com.java.hotel.model.Hotel;
import com.java.hotel.model.Room;
import com.java.hotel.repository.HotelRepository;
import com.java.hotel.repository.RoomRepository;
import com.java.hotel.security.services.UserDetailsImpl;
import com.java.hotel.service.RoomService;
import com.java.hotel.service.StoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.format.annotation.DateTimeFormat;

import java.io.IOException;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/room")
public class RoomController {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomService roomService;

    @Autowired
    private StoreService storeService;

    // ⭐ PUBLIC – cho Home/RoomsPage
    @GetMapping("/all")
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(roomRepository.findAll());
    }

    // ⭐ ADMIN + MOD tạo room
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR')")
    public ResponseEntity<?> createRoom(
            @RequestParam String capacity,
            @RequestParam String availability,
            @RequestParam String type,
            @RequestParam String price,
            @RequestParam String name,
            @RequestParam Long hotel_id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) throws IOException {

        Hotel hotel = hotelRepository.findById(hotel_id)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        boolean isModerator = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MODERATOR"));

        // MOD chỉ được tạo room cho hotel mà mình là owner
        if (isModerator &&
                (hotel.getOwner() == null ||
                        !hotel.getOwner().getId().equals(userDetails.getId()))) {
            return ResponseEntity.status(403)
                    .body("You are not the owner of this hotel");
        }

        String newFilename = storeService.generateImageName(file);

        Room room = new Room();
        room.setName(name);
        room.setCapacity(Integer.parseInt(capacity));
        room.setAvailability(Boolean.parseBoolean(availability));
        room.setType(type);
        room.setPrice(Float.parseFloat(price));
        room.setCreate_at(Date.valueOf(LocalDate.now()));
        room.setUpdate_at(Date.valueOf(LocalDate.now()));
        room.setImage(newFilename);
        room.setHotel(hotel);

        Room savedRoom = roomRepository.save(room);
        storeService.saveFile(file, newFilename, "rooms");

        return ResponseEntity.status(HttpStatus.CREATED).body(savedRoom);
    }

    // ⭐ ADMIN + MOD sửa room
    @PutMapping("/edit/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR')")
    public ResponseEntity<?> editRoom(
            @PathVariable Long id,
            @RequestBody Room updates,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) throws Exception {

        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        boolean isModerator = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MODERATOR"));

        // MOD chỉ được sửa room thuộc hotel của mình
        if (isModerator &&
                (room.getHotel().getOwner() == null ||
                        !room.getHotel().getOwner().getId().equals(userDetails.getId()))) {
            return ResponseEntity.status(403).body("Not your hotel");
        }

        Room updated = roomService.updateRoom(id, updates);
        return ResponseEntity.ok(updated);
    }

    // ⭐ ADMIN + MOD xoá room
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR')")
    public ResponseEntity<?> deleteRoom(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {

        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found"));

        boolean isModerator = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_MODERATOR"));

        // MOD chỉ được xoá room thuộc hotel của mình
        if (isModerator &&
                (room.getHotel().getOwner() == null ||
                        !room.getHotel().getOwner().getId().equals(userDetails.getId()))) {
            return ResponseEntity.status(403).body("Not allowed");
        }

        roomRepository.deleteById(id);
        return ResponseEntity.ok("Room deleted");
    }

    // ⭐ Lấy tất cả room thuộc các hotel mà current user là owner (cho trang MOD)
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMIN','MODERATOR')")
    public ResponseEntity<?> getMyRooms(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        Long ownerId = userDetails.getId();
        List<Room> list = roomRepository.findByHotelOwnerId(ownerId);
        return ResponseEntity.ok(list);
    }

    // ⭐ PUBLIC – Lấy danh sách phòng TRỐNG của một hotel trong khoảng thời gian
    //   dùng cho trang /hotel/:id (ẩn nút Book now cho phòng đang bị booking)
    @GetMapping("/hotel/{hotelId}/available")
    public ResponseEntity<List<Room>> getAvailableRoomsForHotel(
            @PathVariable Long hotelId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime checkIn,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime checkOut
    ) {
        List<Room> available = roomRepository.findAvailableRoomsForHotel(
                hotelId, checkIn, checkOut
        );
        return ResponseEntity.ok(available);
    }
}
