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

    public Booking createBooking(Booking booking) throws ExecutionException, InterruptedException {
        User user = storeService.getCurrentUser();
        booking.setUser(user);
        booking.setRooms(booking.getRooms());
        return bookingRepository.save(booking);
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

    public Booking updateBooking(Long id, Booking updatedBooking) throws Exception {
        Optional<Booking> existingBookingOptional = bookingRepository.findById(id);
        if (existingBookingOptional.isPresent()) {
            Booking existingBooking = existingBookingOptional.get();

            existingBooking.setCheckOut(updatedBooking.getCheckOut());
            existingBooking.setCheckIn(updatedBooking.getCheckIn());
            existingBooking.setTotalPrice(updatedBooking.getTotalPrice());
            existingBooking.setPayment(updatedBooking.isPayment());
            existingBooking.setRooms(updatedBooking.getRooms());
            return  bookingRepository.save(existingBooking);

        } else {
            throw new Exception("Booking not found");
        }
    }
}
