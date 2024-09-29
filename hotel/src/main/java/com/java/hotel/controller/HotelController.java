package com.java.hotel.controller;

import com.java.hotel.model.Hotel;
import com.java.hotel.model.Room;
import com.java.hotel.repository.HotelRepository;
import com.java.hotel.service.HotelService;
import org.antlr.v4.runtime.misc.LogManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hotel")
public class HotelController {
    @Autowired
    HotelService hotelService;
    @Autowired
    private HotelRepository hotelRepository;

    @GetMapping("/all")
    public ResponseEntity<List<Hotel>> getAllRooms() {
        List<Hotel> hotels = hotelService.findAll();
        return ResponseEntity.ok(hotels);
    }

    @PostMapping("/create")
    public ResponseEntity<Hotel> createHotel(@RequestBody Hotel hotel) {
        Hotel savedHotel = hotelRepository.save(hotel);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedHotel);
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<Hotel> editHotel(@PathVariable("id") Long id, @RequestBody Hotel hotelUpdates) {
        Hotel existingHotel = hotelRepository.findById(id).orElse(null);
        if (existingHotel == null) {
            return ResponseEntity.notFound().build();
        }
        if (hotelUpdates.getName() != null) {
            existingHotel.setName(hotelUpdates.getName());
        }
        if (hotelUpdates.getAddress() != null) {
            existingHotel.setAddress(hotelUpdates.getAddress());
        }
        if (hotelUpdates.getPhone() != null) {
            existingHotel.setPhone(hotelUpdates.getPhone());
        }
        if (hotelUpdates.getRating() != 0) {
            existingHotel.setRating(hotelUpdates.getRating());
        }
        if (hotelUpdates.getImage() != null) {
            existingHotel.setImage(hotelUpdates.getImage());
        }
        if (hotelUpdates.getAmenities() != null) {
            existingHotel.setAmenities(hotelUpdates.getAmenities());
        }
        Hotel updatedHotel = hotelRepository.save(existingHotel);

        return ResponseEntity.ok(updatedHotel);
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
}
