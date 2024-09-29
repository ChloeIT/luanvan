package com.java.hotel.controller;

import com.java.hotel.model.Booking;
import com.java.hotel.model.Room;
import com.java.hotel.model.User;
import com.java.hotel.service.BookingService;
import org.hibernate.internal.build.AllowSysOut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/booking") // URL gốc cho các API về booking
public class BookingController {

    @Autowired
    private BookingService BookingService;

    // API để tạo một booking mới
    @PostMapping("/create")
    public ResponseEntity<Booking> createBooking(
            @RequestParam(required = false) LocalDateTime checkIn,
            @RequestParam(required = false) LocalDateTime checkOut,
            @RequestParam float totalPrice,
            @RequestParam boolean payment) {
        System.out.println(totalPrice);
        Booking newBooking = BookingService.createBooking(checkIn, checkOut, totalPrice, payment);

        return ResponseEntity.ok(newBooking);
    }

    // API để lấy tất cả các bookings
    @GetMapping("/all")
    public ResponseEntity<?> getAllBookings() {
        List<Booking> bookings = BookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    // API để lấy một booking theo ID
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        Booking booking = BookingService.getBookingById(id);
        if (booking != null) {
            return ResponseEntity.ok(booking);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/payment")
    public ResponseEntity<Booking> editBookingPayment(@PathVariable Long id, @RequestParam boolean payment) {
        Booking updatedBooking = BookingService.editBookingPayment(id, payment);
        if (updatedBooking != null) {
            return ResponseEntity.ok(updatedBooking); // Trả về booking đã được cập nhật
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build(); // Trả về lỗi 404 nếu không tìm thấy booking
        }
    }
}


