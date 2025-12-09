package com.java.hotel.controller;

import com.java.hotel.model.User;
import com.java.hotel.repository.UserRepository;
import com.java.hotel.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/loyalty")
@CrossOrigin(origins = "*", maxAge = 3600)
public class LoyaltyController {

    @Autowired
    private UserRepository userRepository;

    /**
     * Lấy thông tin Loyalty của user đang đăng nhập:
     *  - Đọc user từ Authentication (JWT)
     *  - Trả về { points, tier }
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMyLoyalty(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> result = new HashMap<>();
        result.put("points", user.getLoyaltyPoints());
        result.put("tier", user.getLoyaltyTier());

        return ResponseEntity.ok(result);
    }
}
