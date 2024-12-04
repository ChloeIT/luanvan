package com.java.hotel.controller;

import com.java.hotel.model.Booking;
import com.java.hotel.model.Room;
import com.java.hotel.model.User;
import com.java.hotel.repository.BookingRepository;
import com.java.hotel.security.services.UserDetailsImpl;
import com.java.hotel.service.BookingService;
import org.hibernate.internal.build.AllowSysOut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ExecutionException;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/booking") // URL gốc cho các API về booking
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingService bookingService;

    @PostMapping("/create")
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) throws ExecutionException, InterruptedException {
        Booking createdBooking = bookingService.createBooking(booking);
        return ResponseEntity.ok(createdBooking);
    }

    // API để lấy tất cả các bookings
    @GetMapping("/all")
    public ResponseEntity<?> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    // API để lấy một booking theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        Booking booking = bookingService.getBookingById(id);
        if (booking != null) {
            return ResponseEntity.ok(booking);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/payment")
    public ResponseEntity<Booking> editBookingPayment(@PathVariable Long id, @RequestParam boolean payment) {
        Booking updatedBooking = bookingService.editBookingPayment(id, payment);
        if (updatedBooking != null) {
            return ResponseEntity.ok(updatedBooking); // Trả về booking đã được cập nhật
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // Trả về lỗi 404 nếu không tìm thấy booking
        }
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<?> updateBooking(@PathVariable Long id, @RequestBody Booking updatedBooking) {
        try {
            Optional<Booking> bookingOptional = bookingRepository.findById(id);
            if (bookingOptional.isPresent()) {
                Booking booking = bookingService.updateBooking(id, updatedBooking);
                return ResponseEntity.ok(booking);
            } else {
                return ResponseEntity.status(404).body("Booking not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating booking: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteBooking(@PathVariable("id") Long id) {
        if (!bookingRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        bookingRepository.deleteById(id);
        return ResponseEntity.ok("Booking deleted successfully");
    }
}


