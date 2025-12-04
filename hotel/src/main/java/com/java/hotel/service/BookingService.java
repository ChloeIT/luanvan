package com.java.hotel.service;

import com.java.hotel.model.Booking;
import com.java.hotel.model.Review;
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

    @Autowired
    private EmailService emailService;

    // ==================================================
    // ===============   CREATE BOOKING   ===============
    // ==================================================

    /**
     * Tạo booking mới từ BookingRequest:
     *  - Lấy user hiện tại
     *  - Load Room từ roomIds
     *  - Check trùng ngày cho từng room
     *  - Sau khi lưu thành công -> Gửi email xác nhận (KHÁCH + OWNER)
     */
    @Transactional
    public Booking createBooking(BookingRequest request)
            throws ExecutionException, InterruptedException {

        // 1. Lấy user hiện tại
        User currentUser = storeService.getCurrentUser();

        // 2. Validate ngày nhận / trả
        LocalDateTime checkIn = request.getCheckIn();
        LocalDateTime checkOut = request.getCheckOut();
        if (checkIn == null || checkOut == null || !checkIn.isBefore(checkOut)) {
            throw new IllegalArgumentException("Invalid check-in/check-out time");
        }

        // 3. Lấy danh sách roomId từ request
        Set<Long> roomIds = (request.getRoomIds() != null)
                ? new HashSet<>(request.getRoomIds())
                : Collections.emptySet();

        if (roomIds.isEmpty()) {
            throw new IllegalArgumentException("Booking must contain at least one room");
        }

        // 4. Load Room từ DB theo roomIds
        Set<Room> rooms = new HashSet<>(roomRepository.findByIdIn(roomIds));
        if (rooms.isEmpty()) {
            throw new IllegalArgumentException("Rooms not found");
        }

        // 5. Check trùng ngày cho từng room
        for (Room room : rooms) {
            // phòng bị disable
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

        // 6. Map DTO -> Entity Booking
        Booking booking = new Booking();
        booking.setCheckIn(checkIn);
        booking.setCheckOut(checkOut);
        booking.setTotalPrice(request.getTotalPrice());
        booking.setPayment(request.isPayment());
        booking.setUser(currentUser);
        booking.setRooms(rooms);

        // 7. Lưu vào DB
        Booking saved = bookingRepository.save(booking);

        // 8. Gửi email (KHÔNG được làm hỏng booking nếu email lỗi)
        try {
            // 1) Mail cho KHÁCH (Booking Confirmation)
            emailService.sendBookingConfirmation(saved);

            // 2) Mail cho HOTEL OWNER / MOD khi có booking mới
            emailService.sendNewBookingToOwner(saved);
        } catch (Exception e) {
            // chỉ log, không ném ra để tránh rollback / trả 400
            e.printStackTrace();
        }

        return saved;
    }

    // ==================================================
    // =====================  READ  =====================
    // ==================================================

    /** Lấy tất cả booking (đã join rooms & hotel) – dùng cho ADMIN. */
    public List<Booking> getAllBookings() {
        return bookingRepository.findAllWithRoomsAndHotel();
    }

    /** Lấy booking theo id (đã join rooms & hotel). */
    public Booking getBookingById(Long id) {
        return bookingRepository.findByIdWithRoomsAndHotel(id).orElse(null);
    }

    // ==================================================
    // ================  EDIT PAYMENT  ==================
    // ==================================================

    /** Chỉ cập nhật trường payment (đã thanh toán / chưa thanh toán). */
    @Transactional
    public Booking editBookingPayment(Long id, boolean payment) {
        return bookingRepository.findById(id)
                .map(b -> {
                    b.setPayment(payment);
                    return bookingRepository.save(b);
                })
                .orElse(null);
    }

    // ==================================================
    // ====================  UPDATE  ====================
    // ==================================================

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

        // Cập nhật rooms nếu FE gửi roomIds
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

        // Check trùng ngày khi UPDATE (bỏ qua chính nó)
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

    // ==================================================
    // ====================  DELETE  ====================
    // ==================================================

    @Transactional
    public void deleteBooking(Long id) {
        if (!bookingRepository.existsById(id)) {
            throw new RuntimeException("Booking not found with id = " + id);
        }
        bookingRepository.deleteById(id);
    }

    // ==================================================
    // ===========  DÙNG CHO MOD / OWNER VIEW  ==========
    // ==================================================

    /** Lấy booking theo ownerId – dùng cho MOD / OWNER. */
    public List<Booking> getBookingsByHotelOwner(Long ownerId) {
        return bookingRepository.findAllByHotelOwner(ownerId);
    }

    /** Lấy booking theo hotel owner là user hiện tại (endpoint /api/booking/my). */
    public List<Booking> getBookingsByHotelOwnerForCurrentUser()
            throws ExecutionException, InterruptedException {

        User currentUser = storeService.getCurrentUser();
        return bookingRepository.findAllByHotelOwner(currentUser.getId());
    }

    // ==================================================
    // ====================  REVIEW  ====================
    // ==================================================

    /**
     * Tạo review cho booking:
     *  - Chỉ chủ booking được review
     *  - Booking phải đã thanh toán
     *  - Booking đã check-out
     *  - Chưa có review trước đó
     */
    @Transactional
    public Review createReview(Long bookingId, float rating, String comment)
            throws ExecutionException, InterruptedException {

        User currentUser = storeService.getCurrentUser();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Check chủ booking
        if (booking.getUser() == null ||
                !Objects.equals(booking.getUser().getId(), currentUser.getId())) {
            throw new RuntimeException("You cannot review someone else's booking");
        }

        // Check đã thanh toán
        if (!booking.isPayment()) {
            throw new RuntimeException("Booking not paid yet");
        }

        // Check đã check-out
        if (booking.getCheckOut() == null ||
                booking.getCheckOut().isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Stay not completed yet");
        }

        // Check đã có review chưa
        if (booking.getReview() != null) {
            throw new RuntimeException("Review already exists for this booking");
        }

        Review review = new Review();
        review.setRating(rating);
        review.setComment(comment);
        review.setAuthor(currentUser.getUsername());
        review.setReview_date(LocalDateTime.now());
        review.setBooking(booking);

        booking.setReview(review);

        Booking saved = bookingRepository.save(booking);
        return saved.getReview();
    }

    /**
     * Cập nhật review của booking (cho phép edit).
     */
    @Transactional
    public Review updateReview(Long bookingId, float rating, String comment)
            throws ExecutionException, InterruptedException {

        User currentUser = storeService.getCurrentUser();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Check chủ booking
        if (booking.getUser() == null ||
                !Objects.equals(booking.getUser().getId(), currentUser.getId())) {
            throw new RuntimeException("You cannot edit someone else's review");
        }

        Review review = booking.getReview();
        if (review == null) {
            throw new RuntimeException("Review does not exist for this booking");
        }

        review.setRating(rating);
        review.setComment(comment);
        review.setReview_date(LocalDateTime.now());

        Booking saved = bookingRepository.save(booking);
        return saved.getReview();
    }
}
