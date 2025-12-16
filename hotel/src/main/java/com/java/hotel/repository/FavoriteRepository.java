package com.java.hotel.repository;

import com.java.hotel.model.Favorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    // ✅ 1 user chỉ có 1 favorite
    Optional<Favorite> findByUserId(Long userId);

    // (OPTION) nếu bạn muốn check nhanh tồn tại
    boolean existsByUserId(Long userId);
}
