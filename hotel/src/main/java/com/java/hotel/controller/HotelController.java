package com.java.hotel.controller;

import com.java.hotel.model.Hotel;
import com.java.hotel.model.Room;
import com.java.hotel.model.User;
import com.java.hotel.repository.HotelRepository;
import com.java.hotel.service.HotelService;
import com.java.hotel.service.StoreService;
import org.antlr.v4.runtime.misc.LogManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/hotel")
public class HotelController {
    @Autowired
    HotelService hotelService;
    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private StoreService storeService;

    @GetMapping("/all")
    public ResponseEntity<List<Hotel>> getAllRooms() {
        List<Hotel> hotels = hotelService.findAll();
        System.out.println("hotel " +hotels);
        return ResponseEntity.ok(hotels);
    }

    @PostMapping("/create")
    public ResponseEntity<Hotel> createHotel(@RequestParam String name,
            @RequestParam String address,
                                             @RequestParam String phone ,
                                             @RequestParam String rating ,
                                             @RequestParam String amenities ,
                                             @RequestParam("file") MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String newFilename = originalFilename != null ? originalFilename.substring(0, originalFilename.lastIndexOf('.')) + ".jpg" : "default.jpg";

        Hotel hotel = new Hotel();
        hotel.setName(name);
        hotel.setAddress(address);
        hotel.setPhone(phone);
        hotel.setRating(Float.parseFloat(rating));
        hotel.setAmenities(amenities);
        hotel.setImage(newFilename);
        Hotel savedHotel = hotelRepository.save(hotel);

        storeService.saveFile(file, newFilename, "hotels");
        return ResponseEntity.status(HttpStatus.CREATED).body(savedHotel);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteHotel(@PathVariable("id") Long id) {
        if (!hotelRepository.existsById(id)) {
            return ResponseEntity.notFound().build(); // Khách sạn không tồn tại
        }
        // Xóa khách sạn
        hotelRepository.deleteById(id);
        // Trả về phản hồi với HTTP 204 (No Content)
        return ResponseEntity.ok().body("Hotel deleted");
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<?> updateHotel(@PathVariable Long id, @RequestBody Hotel updatedHotel) {
        try {
            Optional<Hotel> hotelOptional = hotelRepository.findById(id);
            if (hotelOptional.isPresent()) {
                Hotel hotel = hotelService.updateHotel(id, updatedHotel);
                return ResponseEntity.ok(hotel);
            } else {
                return ResponseEntity.status(404).body("Hotel not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating hotel: " + e.getMessage());
        }
    }
}
