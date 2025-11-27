package com.java.hotel.controller;

import com.java.hotel.model.Booking;
import com.java.hotel.payload.request.BookingRequest;
import com.java.hotel.security.services.UserDetailsImpl;
import com.java.hotel.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/booking")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    /* =========================
         CREATE BOOKING (USER)
       ========================= */
    @PostMapping("/create")
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
        try {
            Booking created = bookingService.createBooking(request);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /* =========================
          GET ALL (ADMIN)
       ========================= */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getAll() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    /* =========================
         GET BOOKING BY ID
       ========================= */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        Booking booking = bookingService.getBookingById(id);
        return booking != null
                ? ResponseEntity.ok(booking)
                : ResponseEntity.notFound().build();
    }

    /* =========================
       EDIT PAYMENT (ADMIN)
       ========================= */
    @PutMapping("/{id}/payment")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> editPayment(
            @PathVariable Long id,
            @RequestParam boolean payment) {

        Booking updated = bookingService.editBookingPayment(id, payment);
        return updated != null
                ? ResponseEntity.ok(updated)
                : ResponseEntity.notFound().build();
    }

    /* =========================
         UPDATE BOOKING (ADMIN)
       ========================= */
    @PutMapping("/edit/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateBooking(
            @PathVariable Long id,
            @RequestBody BookingRequest request) {
        try {
            return ResponseEntity.ok(bookingService.updateBooking(id, request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /* =========================
          DELETE (ADMIN)
       ========================= */
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        try {
            bookingService.deleteBooking(id);
            return ResponseEntity.ok("Deleted");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /* =========================
          GET MY BOOKINGS (MOD/ADMIN)
       ========================= */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('MODERATOR','ADMIN')")
    public ResponseEntity<?> getMyBookings(
            @AuthenticationPrincipal UserDetailsImpl user) {

        return ResponseEntity.ok(
                bookingService.getBookingsByHotelOwner(user.getId())
        );
    }
}
