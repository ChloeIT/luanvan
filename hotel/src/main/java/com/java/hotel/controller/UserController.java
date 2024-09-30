package com.java.hotel.controller;


import com.java.hotel.model.ERole;
import com.java.hotel.model.Role;
import com.java.hotel.model.User;
import com.java.hotel.payload.request.SignupRequest;
import com.java.hotel.payload.response.ResponseMessage;
import com.java.hotel.repository.UserRepository;
import com.java.hotel.service.StoreService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ExecutionException;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/user")
public class UserController {
    @Autowired
    private StoreService storeService;
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/getUser")
    public ResponseEntity<?> getUser() throws ExecutionException, InterruptedException {
        return ResponseEntity.ok(storeService.getCurrentUser());
    }

}
