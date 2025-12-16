package com.java.hotel.service;

import com.java.hotel.model.Favorite;
import com.java.hotel.model.Room;
import com.java.hotel.model.User;
import com.java.hotel.repository.FavoriteRepository;
import com.java.hotel.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ExecutionException;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private StoreService storeService;

    public List<Favorite> findAll() {
        return favoriteRepository.findAll();
    }

    public Favorite findById(Long id) {
        return favoriteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Favorite not found: " + id));
    }

    /**
     * Create favorite for current user.
     * If already exists, return the existing one (avoid duplicates).
     */
    public Favorite create() throws ExecutionException, InterruptedException {
        User user = storeService.getCurrentUser();

        // ✅ tránh tạo trùng favorite cho 1 user
        Favorite existed = favoriteRepository.findByUserId(user.getId()).orElse(null);
        if (existed != null) return existed;

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        return favoriteRepository.save(favorite);
    }

    public Favorite addRoom(long roomId, long favoriteId) throws ExecutionException, InterruptedException {
        Favorite favorite = favoriteRepository.findById(favoriteId)
                .orElseThrow(() -> new RuntimeException("Favorite not found: " + favoriteId));

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomId));

        // ✅ tránh add trùng (đề phòng equals/hashCode chưa đúng)
        boolean exists = favorite.getRooms().stream()
                .anyMatch(r -> r.getId() != null && r.getId().equals(roomId));

        if (!exists) {
            favorite.getRooms().add(room);
        }

        return favoriteRepository.save(favorite);
    }

    public Favorite removeRoom(long roomId, long favoriteId) throws ExecutionException, InterruptedException {
        Favorite favorite = favoriteRepository.findById(favoriteId)
                .orElseThrow(() -> new RuntimeException("Favorite not found: " + favoriteId));

        // ✅ remove theo ID để chắc chắn (không phụ thuộc equals/hashCode)
        favorite.getRooms().removeIf(r -> r.getId() != null && r.getId().equals(roomId));

        return favoriteRepository.save(favorite);
    }
}
