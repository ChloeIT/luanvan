package com.java.hotel.service;

import com.java.hotel.model.Booking;
import com.java.hotel.model.Room;
import com.java.hotel.model.User;
import com.java.hotel.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;

    // Phương thức tạo mới một booking
    public Booking createBooking(LocalDateTime checkIn, LocalDateTime checkOut, float totalPrice, boolean payment) {
        Booking booking = new Booking();
        booking.setCheckIn(checkIn);
        booking.setCheckOut(checkOut);
        booking.setTotalPrice(totalPrice);
        booking.setPayment(payment);

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
