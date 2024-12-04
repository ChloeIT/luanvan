package com.java.hotel.controller;

import com.java.hotel.model.Room;
import com.java.hotel.repository.RoomRepository;
import com.java.hotel.service.RoomService;
import com.java.hotel.service.StoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/room")
public class RoomController {
    @Autowired
    private RoomRepository roomRepository;
    @Autowired
    private RoomService roomService;
    @Autowired
    private StoreService storeService;

    @GetMapping("/all")
    public ResponseEntity<List<Room>> getAllRooms() {
        List<Room> rooms = roomRepository.findAll();
        return ResponseEntity.ok(rooms);
    }

    @PostMapping("/create")
    public ResponseEntity<Room> createRoom(@RequestParam String capacity,
                                           @RequestParam String availability,
                                           @RequestParam String image,
                                           @RequestParam String type,
                                           @RequestParam String price,
                                           @RequestParam String name,
                                           @RequestParam("file") MultipartFile file) throws IOException {

        String originalFilename = file.getOriginalFilename();
        String newFilename = originalFilename != null ? originalFilename.substring(0, originalFilename.lastIndexOf('.')) + ".jpg" : "default.jpg";


        Room room = new Room();
        room.setCapacity(Integer.parseInt(capacity));
        room.setName(name);
        room.setAvailability(Boolean.valueOf(availability));
        room.setUpdate_at(Date.valueOf(LocalDate.now()));
        room.setCreate_at(Date.valueOf(LocalDate.now()));
        room.setImage(image);
        room.setType(type);
        room.setPrice(Integer.parseInt(price));

        Room savedRoom = roomRepository.save(room);
        storeService.saveFile(file, newFilename,  "rooms");
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRoom);
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<Room> editRoom(@PathVariable("id") Long id, @RequestBody Room roomUpdates) throws Exception {
        Room updateRoom =roomService.updateRoom(id, roomUpdates);
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
