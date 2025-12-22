package com.java.hotel.service;

import com.java.hotel.model.Booking;
import com.java.hotel.model.Review;
import com.java.hotel.model.Room;
import com.java.hotel.model.User;
import com.java.hotel.payload.request.BookingRequest;
import com.java.hotel.repository.BookingRepository;
import com.java.hotel.repository.RoomRepository;
import com.java.hotel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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

    @Autowired
    private UserRepository userRepository;

    // ==============================
    // OPTION B: cutoff 14:00 check-in
    // ==============================
    private static final LocalTime CHECKIN_CUTOFF_TIME = LocalTime.of(14, 0);

    /**
     * Booking có "block room" hay không?
     * - PAID: luôn block
     * - UNPAID: chỉ block nếu hiện tại vẫn trước 14:00 ngày check-in
     */
    private boolean isBlockingBooking(Booking b) {
        if (b == null) return false;

        // PAID luôn block
        if (b.isPayment()) return true;

        // UNPAID: chỉ block trước cutoff
        if (b.getCheckIn() == null) return false;

        LocalDate checkInDate = b.getCheckIn().toLocalDate();
        LocalDateTime cutoff = checkInDate.atTime(CHECKIN_CUTOFF_TIME);

        return LocalDateTime.now().isBefore(cutoff);
    }

    /**
     * Có booking overlap nào thực sự block room không?
     */
    private boolean hasBlockingConflict(List<Booking> overlapped) {
        if (overlapped == null || overlapped.isEmpty()) return false;
        return overlapped.stream().anyMatch(this::isBlockingBooking);
    }

    // ==================================================
    // ===============   CREATE BOOKING   ===============
    // ==================================================
    @Transactional
    public Booking createBooking(BookingRequest request)
            throws ExecutionException, InterruptedException {

        User currentUser = storeService.getCurrentUser();

        LocalDateTime checkIn = request.getCheckIn();
        LocalDateTime checkOut = request.getCheckOut();
        if (checkIn == null || checkOut == null || !checkIn.isBefore(checkOut)) {
            throw new IllegalArgumentException("Invalid check-in/check-out time");
        }

        Set<Long> roomIds = (request.getRoomIds() != null)
                ? new HashSet<>(request.getRoomIds())
                : Collections.emptySet();

        if (roomIds.isEmpty()) {
            throw new IllegalArgumentException("Booking must contain at least one room");
        }

        Set<Room> rooms = new HashSet<>(roomRepository.findByIdIn(roomIds));
        if (rooms.isEmpty()) {
            throw new IllegalArgumentException("Rooms not found");
        }

        // ✅ SỬA CHÍNH Ở ĐÂY: check trùng ngày theo rule blocking (PAID luôn block, UNPAID chỉ block trước 14:00)
        for (Room room : rooms) {
            if (Boolean.FALSE.equals(room.getAvailability())) {
                throw new RuntimeException("Room " + room.getName() + " is disabled");
            }

            List<Booking> overlapped = bookingRepository.findOverlappingBookings(
                    room.getId(), checkIn, checkOut
            );

            if (hasBlockingConflict(overlapped)) {
                throw new RuntimeException(
                        "Room " + room.getName() + " is already booked in this date range"
                );
            }
        }

        Booking booking = new Booking();
        booking.setCheckIn(checkIn);
        booking.setCheckOut(checkOut);
        booking.setTotalPrice(request.getTotalPrice());
        booking.setPayment(request.isPayment()); // PAID true / UNPAID false
        booking.setUser(currentUser);
        booking.setRooms(rooms);

        Booking saved = bookingRepository.save(booking);

        // LOYALTY: chỉ cộng khi đã thanh toán
        if (currentUser != null && saved.isPayment()) {
            float totalPrice = saved.getTotalPrice();
            int pointsEarned = calculatePoints(totalPrice);

            Integer oldPoints = Optional.ofNullable(currentUser.getLoyaltyPoints()).orElse(0);
            int newPoints = oldPoints + pointsEarned;

            currentUser.setLoyaltyPoints(newPoints);
            currentUser.setLoyaltyTier(calculateTier(newPoints));

            userRepository.save(currentUser);
        }

        try {
            emailService.sendBookingConfirmation(saved);
            emailService.sendNewBookingToOwner(saved);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return saved;
    }

    // ==================================================
    // =====================  READ  =====================
    // ==================================================
    public List<Booking> getAllBookings() {
        return bookingRepository.findAllWithRoomsAndHotel();
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findByIdWithRoomsAndHotel(id).orElse(null);
    }

    // ==================================================
    // ================  EDIT PAYMENT  ==================
    // ==================================================
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

        // ✅ SỬA CHÍNH Ở ĐÂY: update cũng check theo rule blocking
        for (Room room : rooms) {
            if (Boolean.FALSE.equals(room.getAvailability())) {
                throw new RuntimeException("Room " + room.getName() + " is disabled");
            }

            List<Booking> overlapped = bookingRepository.findOverlappingBookingsForUpdate(
                    existingBooking.getId(),
                    room.getId(),
                    checkIn,
                    checkOut
            );

            if (hasBlockingConflict(overlapped)) {
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
    public List<Booking> getBookingsByHotelOwner(Long ownerId) {
        return bookingRepository.findAllByHotelOwner(ownerId);
    }

    public List<Booking> getBookingsByHotelOwnerForCurrentUser()
            throws ExecutionException, InterruptedException {
        User currentUser = storeService.getCurrentUser();
        return bookingRepository.findAllByHotelOwner(currentUser.getId());
    }

    // ==================================================
    // ====================  REVIEW  ====================
    // ==================================================
    @Transactional
    public Review createReview(Long bookingId, float rating, String comment)
            throws ExecutionException, InterruptedException {

        User currentUser = storeService.getCurrentUser();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getUser() == null ||
                !Objects.equals(booking.getUser().getId(), currentUser.getId())) {
            throw new RuntimeException("You cannot review someone else's booking");
        }

        if (!booking.isPayment()) {
            throw new RuntimeException("Booking not paid yet");
        }

        if (booking.getCheckOut() == null ||
                booking.getCheckOut().isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Stay not completed yet");
        }

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

    @Transactional
    public Review updateReview(Long bookingId, float rating, String comment)
            throws ExecutionException, InterruptedException {

        User currentUser = storeService.getCurrentUser();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

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

    // ==================================================
    // ============= LOYALTY HELPER METHODS =============
    // ==================================================
    private int calculatePoints(float totalPrice) {
        if (totalPrice <= 0) return 0;
        return (int) (totalPrice / 10f);
    }

    private String calculateTier(int points) {
        if (points >= 100) return "GOLD";
        if (points >= 10)  return "SILVER";
        return "BRONZE";
    }
}
