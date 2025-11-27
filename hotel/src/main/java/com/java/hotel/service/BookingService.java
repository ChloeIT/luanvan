package com.java.hotel.service;

import com.java.hotel.model.Booking;
import com.java.hotel.model.Room;
import com.java.hotel.model.User;
import com.java.hotel.payload.request.BookingRequest;
import com.java.hotel.repository.BookingRepository;
import com.java.hotel.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ExecutionException;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private StoreService storeService;

    /**
     * Tạo booking mới từ BookingRequest (DTO)
     * - Lấy user hiện tại
     * - Load Room từ roomIds
     * - Map sang entity Booking rồi save
     */
    public Booking createBooking(BookingRequest request) throws ExecutionException, InterruptedException {
        // user hiện tại (đang login)
        User currentUser = storeService.getCurrentUser();

        // Lấy rooms từ roomIds
        Set<Room> rooms = new HashSet<>();
        if (request.getRoomIds() != null && !request.getRoomIds().isEmpty()) {
            rooms.addAll(roomRepository.findByIdIn(request.getRoomIds()));
        }

        // Map DTO -> entity
        Booking booking = new Booking();
        booking.setCheckIn(request.getCheckIn());
        booking.setCheckOut(request.getCheckOut());
        booking.setTotalPrice(request.getTotalPrice());
        booking.setPayment(request.isPayment());
        booking.setUser(currentUser);
        booking.setRooms(rooms);

        return bookingRepository.save(booking);
    }

    /**
     * Lấy toàn bộ booking, kèm luôn rooms + hotel (fetch join)
     */
    public List<Booking> getAllBookings() {
        return bookingRepository.findAllWithRoomsAndHotel();
    }

    /**
     * Lấy 1 booking theo id, kèm rooms + hotel (fetch join)
     */
    public Booking getBookingById(Long id) {
        return bookingRepository.findByIdWithRoomsAndHotel(id).orElse(null);
    }

    /**
     * Chỉ sửa trạng thái payment (dùng cho nút toggle thanh toán)
     */
    public Booking editBookingPayment(Long id, boolean payment) {
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking != null) {
            booking.setPayment(payment);
            bookingRepository.save(booking);
        }
        return booking;
    }

    /**
     * Cập nhật booking bằng BookingRequest
     * (Admin có thể sửa lại ngày, giá, payment, rooms)
     */
    public Booking updateBooking(Long id, BookingRequest request) throws Exception {
        Optional<Booking> existingBookingOptional = bookingRepository.findById(id);
        if (existingBookingOptional.isEmpty()) {
            throw new Exception("Booking not found");
        }

        Booking existingBooking = existingBookingOptional.get();

        // update các field cơ bản
        existingBooking.setCheckIn(request.getCheckIn());
        existingBooking.setCheckOut(request.getCheckOut());
        existingBooking.setTotalPrice(request.getTotalPrice());
        existingBooking.setPayment(request.isPayment());

        // Nếu FE gửi roomIds (kể cả rỗng) thì cập nhật lại rooms
        if (request.getRoomIds() != null) {
            Set<Room> rooms = new HashSet<>();
            if (!request.getRoomIds().isEmpty()) {
                rooms.addAll(roomRepository.findByIdIn(request.getRoomIds()));
            }
            existingBooking.setRooms(rooms);
        }

        return bookingRepository.save(existingBooking);
    }

    /**
     * Xoá booking theo id (dùng cho API DELETE)
     */
    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new RuntimeException("Booking not found with id = " + id);
        }
        bookingRepository.deleteById(id);
    }

    /**
     * Lấy danh sách booking của các hotel thuộc owner (dùng cho MOD)
     */
    public List<Booking> getBookingsByHotelOwner(Long ownerId) {
        return bookingRepository.findAllByHotelOwner(ownerId);
    }
}
