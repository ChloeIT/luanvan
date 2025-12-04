package com.java.hotel.controller;

import com.java.hotel.model.Booking;
import com.java.hotel.model.Review;
import com.java.hotel.payload.request.BookingRequest;
import com.java.hotel.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

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

    /* ========= GET BY ID (ADMIN / tuỳ bạn cấu hình thêm quyền) ========= */
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
            @RequestParam boolean payment
    ) {
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
            @RequestBody BookingRequest request
    ) {
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

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('MODERATOR','ADMIN')")
    public ResponseEntity<?> getMyBookings() {
        try {
            return ResponseEntity.ok(
                    bookingService.getBookingsByHotelOwnerForCurrentUser()
            );
        } catch (ExecutionException | InterruptedException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==================================================
    // ====================  REVIEW  ====================
    // ==================================================

    /* ========= CREATE REVIEW (USER) ========= */
    @PostMapping("/{id}/review")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createReview(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        try {
            Object ratingObj = body.get("rating");
            float rating = ratingObj != null
                    ? Float.parseFloat(ratingObj.toString())
                    : 5.0f;

            String comment = body.get("comment") != null
                    ? body.get("comment").toString()
                    : "";

            Review review = bookingService.createReview(id, rating, comment);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /* ========= UPDATE REVIEW (USER) ========= */
    @PutMapping("/{id}/review")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateReview(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        try {
            Object ratingObj = body.get("rating");
            float rating = ratingObj != null
                    ? Float.parseFloat(ratingObj.toString())
                    : 5.0f;

            String comment = body.get("comment") != null
                    ? body.get("comment").toString()
                    : "";

            Review review = bookingService.updateReview(id, rating, comment);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
