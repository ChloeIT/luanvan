package com.java.hotel.controller;

import com.java.hotel.model.Booking;
import com.java.hotel.payload.request.BookingRequest;
import com.java.hotel.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/booking")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    /* =========================
       CREATE BOOKING (DÙNG DTO)
       ========================= */
    @PostMapping("/create")
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
        try {
            Booking created = bookingService.createBooking(request);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating booking: " + e.getMessage());
        }
    }

    /* =========================
       GET ALL BOOKING
       ========================= */
    @GetMapping("/all")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    /* =========================
       GET BOOKING BY ID
       ========================= */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        Booking booking = bookingService.getBookingById(id);
        return booking != null ? ResponseEntity.ok(booking) :
                ResponseEntity.notFound().build();
    }

    /* =========================
       EDIT PAYMENT ONLY
       ========================= */
    @PutMapping("/{id}/payment")
    public ResponseEntity<?> editPayment(@PathVariable Long id,
                                         @RequestParam boolean payment) {

        Booking updated = bookingService.editBookingPayment(id, payment);
        return updated != null ? ResponseEntity.ok(updated) :
                ResponseEntity.notFound().build();
    }

    /* =========================
       UPDATE BOOKING (DÙNG DTO)
       ========================= */
    @PutMapping("/edit/{id}")
    public ResponseEntity<?> updateBooking(@PathVariable Long id,
                                           @RequestBody BookingRequest request) {
        try {
            Booking updated = bookingService.updateBooking(id, request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating booking: " + e.getMessage());
        }
    }

    /* =========================
       DELETE BOOKING
       ========================= */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        try {
            bookingService.deleteBooking(id);
            return ResponseEntity.ok("Booking deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting booking");
        }
    }
}
