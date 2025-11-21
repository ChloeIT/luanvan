package com.java.hotel.controller;

import com.java.hotel.model.ERole;
import com.java.hotel.model.Role;
import com.java.hotel.model.User;
import com.java.hotel.repository.RoleRepository;
import com.java.hotel.repository.UserRepository;
import com.java.hotel.service.StoreService;
import com.java.hotel.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private StoreService storeService;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    PasswordEncoder encoder;

    // ================== GET ALL ==================
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    // ================== CREATE USER (ADMIN) ==================
    @PostMapping("/create")
    public ResponseEntity<?> createUser(
            @RequestParam String fullName,
            @RequestParam String phone,
            @RequestParam String email,
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam String gender,
            @RequestParam String address,

            // nhận birthDate dạng "yyyy-MM-dd" từ FE, map sang java.util.Date
            @RequestParam(required = false)
            @DateTimeFormat(pattern = "yyyy-MM-dd")
            Date birthDate,

            @RequestParam List<String> roles,
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        String originalFilename = file.getOriginalFilename();
        String newFilename = originalFilename != null
                ? originalFilename.substring(0, originalFilename.lastIndexOf('.')) + ".jpg"
                : "default.jpg";

        User user = new User();
        Set<Role> roleSet = new HashSet<>();

        if (roles == null || roles.isEmpty()) {
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roleSet.add(userRole);
        } else {
            roles.forEach(role -> {
                switch (role) {
                    case "admin" -> {
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roleSet.add(adminRole);
                    }
                    case "mod" -> {
                        Role modRole = roleRepository.findByName(ERole.ROLE_MODERATOR)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roleSet.add(modRole);
                    }
                    default -> {
                        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roleSet.add(userRole);
                    }
                }
            });
        }

        // Set user info
        user.setRoles(roleSet);
        user.setFullName(fullName);
        user.setPhone(Integer.parseInt(phone));
        user.setEmail(email);
        user.setUsername(username);
        user.setPassword(encoder.encode(password));
        user.setGender(gender);
        user.setAddress(address);
        user.setImage(newFilename);

        // lưu birthDate nếu có
        if (birthDate != null) {
            user.setBirthDate(birthDate);
        }

        User savedUser = userRepository.save(user);

        // Lưu file vào static/images/users
        storeService.saveFile(file, newFilename, "users");

        return ResponseEntity.ok(savedUser);
    }

    // ================== UPDATE INFO (JSON) ==================
    @PutMapping("/edit/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody User updatedUser
    ) {
        try {
            Optional<User> userOptional = userRepository.findById(id);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            User user = userOptional.get();
            user.setFullName(updatedUser.getFullName());
            user.setPhone(updatedUser.getPhone());
            user.setAddress(updatedUser.getAddress());
            user.setGender(updatedUser.getGender());
            user.setBirthDate(updatedUser.getBirthDate());

            User saved = userRepository.save(user);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating user: " + e.getMessage());
        }
    }

    // ================== UPDATE AVATAR (FormData) ==================
    @PutMapping("/edit/{id}/avatar")
    public ResponseEntity<?> updateAvatar(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            Optional<User> userOptional = userRepository.findById(id);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            User user = userOptional.get();

            String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
            if (ext == null || ext.isBlank()) {
                ext = "jpg";
            }

            String newFilename = "avt_" + user.getId() + "_" + System.currentTimeMillis() + "." + ext;

            storeService.saveFile(file, newFilename, "users");

            user.setImage(newFilename);
            User saved = userRepository.save(user);

            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating avatar: " + e.getMessage());
        }
    }

    // ================== DELETE ==================
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable("id") Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}
