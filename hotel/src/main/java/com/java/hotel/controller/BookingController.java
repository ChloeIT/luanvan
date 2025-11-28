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

    /* ========= CREATE BOOKING (USER / MOD / ADMIN) ========= */
    @PostMapping("/create")
    @PreAuthorize("isAuthenticated()") // hoặc hasAnyRole('USER','MODERATOR','ADMIN')
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
        try {
            Booking created = bookingService.createBooking(request);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /* ========= GET ALL (ADMIN) ========= */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getAll() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    /* ========= GET BY ID (ADMIN / MOD tuỳ bạn) ========= */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        Booking booking = bookingService.getBookingById(id);
        if (booking == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(booking);
    }

    /* ========= EDIT PAYMENT (ADMIN) ========= */
    @PutMapping("/{id}/payment")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> editPayment(
            @PathVariable Long id,
            @RequestParam boolean payment) {

        Booking updated = bookingService.editBookingPayment(id, payment);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    /* ========= UPDATE BOOKING (ADMIN) ========= */
    @PutMapping("/edit/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateBooking(
            @PathVariable Long id,
            @RequestBody BookingRequest request) {
        try {
            Booking updated = bookingService.updateBooking(id, request);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /* ========= DELETE (ADMIN) ========= */
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

    /* ========= GET BOOKINGS BY HOTEL OWNER (MOD / ADMIN) ========= */
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('MODERATOR','ADMIN')")
    public ResponseEntity<?> getMyBookings(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(
                bookingService.getBookingsByHotelOwner(user.getId())
        );
    }
}
