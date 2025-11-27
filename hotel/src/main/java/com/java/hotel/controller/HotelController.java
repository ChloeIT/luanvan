    package com.java.hotel.controller;

    import com.java.hotel.model.Hotel;
    import com.java.hotel.repository.HotelRepository;
    import com.java.hotel.security.services.UserDetailsImpl;
    import com.java.hotel.service.HotelService;
    import com.java.hotel.service.StoreService;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.security.access.prepost.PreAuthorize;
    import org.springframework.security.core.annotation.AuthenticationPrincipal;
    import org.springframework.web.bind.annotation.*;
    import org.springframework.web.multipart.MultipartFile;

    import java.io.IOException;
    import java.util.List;

    @RestController
    @CrossOrigin(origins = "*", maxAge = 3600)
    @RequestMapping("/api/hotel")
    public class HotelController {

        @Autowired
        private HotelService hotelService;

        @Autowired
        private HotelRepository hotelRepository;

        @Autowired
        private StoreService storeService;

        // ⭐ PUBLIC – dùng cho trang Home, không cần token
        @GetMapping("/all")
        public ResponseEntity<List<Hotel>> getAllHotels() {
            return ResponseEntity.ok(hotelService.findAll());
        }

        // ADMIN tạo hotel
        @PostMapping("/create")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<?> createHotel(
                @RequestParam String name,
                @RequestParam String address,
                @RequestParam String phone,
                @RequestParam String rating,
                @RequestParam String amenities,
                @RequestParam("file") MultipartFile file
        ) throws IOException {

            String newFilename = storeService.generateImageName(file);

            Hotel hotel = new Hotel();
            hotel.setName(name);
            hotel.setAddress(address);
            hotel.setPhone(phone);
            hotel.setRating(Float.parseFloat(rating));
            hotel.setAmenities(amenities);
            hotel.setImage(newFilename);

            Hotel saved = hotelRepository.save(hotel);
            storeService.saveFile(file, newFilename, "hotels");

            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        }

        @DeleteMapping("/delete/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<?> deleteHotel(@PathVariable Long id) {
            if (!hotelRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            hotelRepository.deleteById(id);
            return ResponseEntity.ok("Hotel deleted");
        }

        @PutMapping("/edit/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<?> updateHotel(
                @PathVariable Long id,
                @RequestBody Hotel updatedHotel) {

            try {
                Hotel updated = hotelService.updateHotel(id, updatedHotel);
                return ResponseEntity.ok(updated);
            } catch (Exception e) {
                return ResponseEntity
                        .status(500)
                        .body("Error updating hotel: " + e.getMessage());
            }
        }

        // ⭐ MOD / ADMIN xem hotel của chính mình
        @GetMapping("/my")
        @PreAuthorize("hasAnyRole('MODERATOR','ADMIN')")
        public ResponseEntity<?> getMyHotels(
                @AuthenticationPrincipal UserDetailsImpl userDetails) {

            Long userId = userDetails.getId();
            List<Hotel> list = hotelRepository.findByOwnerId(userId);
            return ResponseEntity.ok(list);
        }
    }
