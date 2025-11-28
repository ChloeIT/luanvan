package com.java.hotel.service;

import com.java.hotel.model.Booking;
import com.java.hotel.model.Room;
import com.java.hotel.model.User;
import com.java.hotel.payload.request.BookingRequest;
import com.java.hotel.repository.BookingRepository;
import com.java.hotel.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ExecutionException;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private StoreService storeService;

    // ====== CREATE ======

    /**
     * Tạo booking mới từ BookingRequest
     * - Lấy user hiện tại
     * - Load Room từ roomIds
     * - CHECK TRÙNG NGÀY cho từng room
     */
    @Transactional
    public Booking createBooking(BookingRequest request)
            throws ExecutionException, InterruptedException {

        User currentUser = storeService.getCurrentUser();

        LocalDateTime checkIn = request.getCheckIn();
        LocalDateTime checkOut = request.getCheckOut();

        if (checkIn == null || checkOut == null || !checkIn.isBefore(checkOut)) {
            throw new IllegalArgumentException("Invalid check-in/check-out time");
        }

        // lấy danh sách phòng
        Set<Long> roomIds = request.getRoomIds() != null
                ? new HashSet<>(request.getRoomIds())
                : Collections.emptySet();

        if (roomIds.isEmpty()) {
            throw new IllegalArgumentException("Booking must contain at least one room");
        }

        Set<Room> rooms = new HashSet<>(roomRepository.findByIdIn(roomIds));

        if (rooms.isEmpty()) {
            throw new IllegalArgumentException("Rooms not found");
        }

        // ❗Check trùng ngày cho từng room
        for (Room room : rooms) {
            if (Boolean.FALSE.equals(room.getAvailability())) {
                throw new RuntimeException("Room " + room.getName() + " is disabled");
            }

            boolean conflict = bookingRepository.existsOverlappingBooking(
                    room.getId(), checkIn, checkOut
            );
            if (conflict) {
                throw new RuntimeException(
                        "Room " + room.getName() + " is already booked in this date range"
                );
            }
        }

        // map DTO -> entity
        Booking booking = new Booking();
        booking.setCheckIn(checkIn);
        booking.setCheckOut(checkOut);
        booking.setTotalPrice(request.getTotalPrice());
        booking.setPayment(request.isPayment());
        booking.setUser(currentUser);
        booking.setRooms(rooms);

        return bookingRepository.save(booking);
    }

    // ====== READ ======

    public List<Booking> getAllBookings() {
        return bookingRepository.findAllWithRoomsAndHotel();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findByIdWithRoomsAndHotel(id).orElse(null);
    }

    // chỉ toggle payment
    @Transactional
    public Booking editBookingPayment(Long id, boolean payment) {
        return bookingRepository.findById(id)
                .map(b -> {
                    b.setPayment(payment);
                    return bookingRepository.save(b);
                })
                .orElse(null);
    }

    // ====== UPDATE FULL ======

    @Transactional
    public Booking updateBooking(Long id, BookingRequest request) throws Exception {
        Booking existingBooking = bookingRepository.findById(id)
                .orElseThrow(() -> new Exception("Booking not found"));

        LocalDateTime checkIn = request.getCheckIn();
        LocalDateTime checkOut = request.getCheckOut();

        if (checkIn == null || checkOut == null || !checkIn.isBefore(checkOut)) {
            throw new IllegalArgumentException("Invalid check-in/check-out time");
        }

        existingBooking.setCheckIn(checkIn);
        existingBooking.setCheckOut(checkOut);
        existingBooking.setTotalPrice(request.getTotalPrice());
        existingBooking.setPayment(request.isPayment());

        // cập nhật rooms nếu FE gửi roomIds
        if (request.getRoomIds() != null) {
            Set<Room> newRooms = new HashSet<>();
            if (!request.getRoomIds().isEmpty()) {
                newRooms.addAll(roomRepository.findByIdIn(request.getRoomIds()));
            }
            existingBooking.setRooms(newRooms);
        }

        Set<Room> rooms = existingBooking.getRooms();
        if (rooms == null || rooms.isEmpty()) {
            throw new IllegalArgumentException("Booking must contain at least one room");
        }

        // ❗Check trùng khi UPDATE (bỏ qua chính nó)
        for (Room room : rooms) {
            if (Boolean.FALSE.equals(room.getAvailability())) {
                throw new RuntimeException("Room " + room.getName() + " is disabled");
            }

            boolean conflict = bookingRepository.existsOverlappingBookingForUpdate(
                    existingBooking.getId(),
                    room.getId(),
                    checkIn,
                    checkOut
            );
            if (conflict) {
                throw new RuntimeException(
                        "Room " + room.getName() + " is already booked in this date range"
                );
            }
        }

        return bookingRepository.save(existingBooking);
    }

    // ====== DELETE ======

    @Transactional
    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new RuntimeException("Booking not found with id = " + id);
        }
        bookingRepository.deleteById(id);
    }

    // ====== DÙNG CHO MOD ======

    public List<Booking> getBookingsByHotelOwner(Long ownerId) {
        return bookingRepository.findAllByHotelOwner(ownerId);
    }
}
