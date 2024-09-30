package com.java.hotel.service;

import com.java.hotel.model.Booking;
import com.java.hotel.model.Room;
import com.java.hotel.model.User;
import com.java.hotel.repository.BookingRepository;
import com.java.hotel.repository.UserRepository;
import com.java.hotel.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ExecutionException;

@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private StoreService storeService;

    public Booking createBooking(LocalDateTime checkIn, LocalDateTime checkOut, float totalPrice, boolean payment) throws ExecutionException, InterruptedException {
        User user = storeService.getCurrentUser();
        Booking booking = new Booking();
        booking.setCheckIn(checkIn);
        booking.setCheckOut(checkOut);
        booking.setTotalPrice(totalPrice);
        booking.setPayment(payment);
        booking.setUser(user);

        bookingRepository.save(booking);
        return booking;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id).orElse(null);
    }

    public Booking editBookingPayment(Long id, boolean payment) {
        Booking booking = getBookingById(id); // Lấy booking theo ID
        if (booking != null) {
            booking.setPayment(payment); // Thay đổi trạng thái payment
            bookingRepository.save(booking); // Lưu lại booking đã được cập nhật
        }
        return booking; // Trả về booking đã được cập nhật hoặc null nếu không tìm thấy
    }

}
