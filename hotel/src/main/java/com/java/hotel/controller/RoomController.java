package com.java.hotel.controller;

import com.java.hotel.model.Room;
import com.java.hotel.repository.RoomRepository;
import com.java.hotel.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/room")
public class RoomController {
    @Autowired
    private RoomRepository roomRepository;

    @GetMapping("/all")
    public ResponseEntity<List<Room>> getAllRooms() {
        List<Room> rooms = roomRepository.findAll();
        return ResponseEntity.ok(rooms);
    }

    @PostMapping("/create")
    public ResponseEntity<Room> createRoom(@RequestBody Room room) {
        room.setCreate_at(Date.valueOf(LocalDate.now()));
        room.setUpdate_at(Date.valueOf(LocalDate.now()));
        Room saveRoom = roomRepository.save(room);
        return ResponseEntity.status(HttpStatus.CREATED).body(saveRoom);
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<Room> editRoom(@PathVariable("id") Long id, @RequestBody Room roomUpdates) {
        Room existingRoom = roomRepository.findById(id).orElse(null);
        if (existingRoom == null) {
            return ResponseEntity.notFound().build();
        }
        if (roomUpdates.getName() != null) existingRoom.setName(roomUpdates.getName());
        if (roomUpdates.getCapacity() != 0) {
            existingRoom.setCapacity(roomUpdates.getCapacity());
        }
        float price = roomUpdates.getPrice();
        if (price==0) {
            existingRoom.setPrice(roomUpdates.getPrice());
        }
        if (roomUpdates.getType() != null) {
            existingRoom.setType(roomUpdates.getType());
        }
        if (roomUpdates.getImage() != null) {
            existingRoom.setImage(roomUpdates.getImage());
        }
        if (roomUpdates.getAvailability() != null) {
            existingRoom.setAvailability(roomUpdates.getAvailability());
        }
        Room updateRoom = roomRepository.save(existingRoom);

        return ResponseEntity.ok(updateRoom);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteRoom(@PathVariable("id") Long id) {
        if (!roomRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        roomRepository.deleteById(id);
        return ResponseEntity.ok().body("Room deleted");
    }
}
