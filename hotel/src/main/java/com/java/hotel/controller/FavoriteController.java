package com.java.hotel.controller;

import com.java.hotel.model.Favorite;
import com.java.hotel.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
@RequestMapping("/api/favorite")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;
    @GetMapping("/all")
        public ResponseEntity<List<Favorite>> findAll() {
        List<Favorite> favorites = favoriteService.findAll();
        return ResponseEntity.ok(favorites);

    }

    @GetMapping("/{id}")
        public ResponseEntity<Favorite> findById(@PathVariable long id) {
         Favorite favorite = favoriteService.findById(id);
         return ResponseEntity.ok(favorite);
    }

    @PostMapping("/create")
    public ResponseEntity<?> create() throws ExecutionException, InterruptedException {
        Favorite createFavorite = favoriteService.create();
        return ResponseEntity.ok(createFavorite);
    }

    @PostMapping("/{favoriteId}/add/{roomId}")
    public ResponseEntity<?> add(@PathVariable long favoriteId, @PathVariable long roomId) throws ExecutionException, InterruptedException {
        Favorite favorite = favoriteService.addRoom(roomId, favoriteId);
        return  ResponseEntity.ok(favorite);
    }

    @PostMapping("/{favoriteId}/remove/{roomId}")
    public ResponseEntity<?> remove(@PathVariable long favoriteId, @PathVariable long roomId) throws ExecutionException, InterruptedException {
        Favorite favorite = favoriteService.removeRoom(roomId, favoriteId);
        return  ResponseEntity.ok(favorite);
    }


}

