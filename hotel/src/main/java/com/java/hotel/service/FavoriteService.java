package com.java.hotel.service;

import com.java.hotel.model.Favorite;
import com.java.hotel.model.Room;
import com.java.hotel.model.User;
import com.java.hotel.repository.FavoriteRepository;
import com.java.hotel.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
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
        return favoriteRepository.findById(id).orElseThrow(null);
    }

    public Favorite create() throws ExecutionException, InterruptedException {
        Favorite favorite = new Favorite();
        User user = storeService.getCurrentUser();
        favorite.setUser(user);
        favoriteRepository.save(favorite);
        return favorite;
    }

    public Favorite addRoom(long roomId, long favoriteId) throws ExecutionException, InterruptedException {
        Favorite favorite = favoriteRepository.findById(favoriteId).orElseThrow(null);
        Room room = roomRepository.findById(roomId).orElseThrow(null);
        favorite.getRooms().add(room);
        favoriteRepository.save(favorite);
        return favorite;

    }

    public Favorite removeRoom(long roomId, long favoriteId) throws ExecutionException, InterruptedException {
        Favorite favorite = favoriteRepository.findById(favoriteId).orElseThrow(null);
        Room room = roomRepository.findById(roomId).orElseThrow(null);
        favorite.getRooms().remove(room);
        favoriteRepository.save(favorite);
        return favorite;
    }

}
