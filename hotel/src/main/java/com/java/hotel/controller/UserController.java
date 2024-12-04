package com.java.hotel.controller;

import com.java.hotel.model.ERole;
import com.java.hotel.model.Hotel;
import com.java.hotel.model.Role;
import com.java.hotel.model.User;
import com.java.hotel.payload.request.SignupRequest;
import com.java.hotel.payload.response.ResponseMessage;
import com.java.hotel.repository.RoleRepository;
import com.java.hotel.repository.UserRepository;
import com.java.hotel.service.StoreService;
import com.java.hotel.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ExecutionException;

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

    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }


    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestParam String fullName,
                                           @RequestParam String phone,
                                           @RequestParam String email,
                                           @RequestParam String username,
                                           @RequestParam String password,
                                           @RequestParam String gender,
                                           @RequestParam String address,
                                           @RequestParam List<String> roles,
                                           @RequestParam("file") MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String newFilename = originalFilename != null ? originalFilename.substring(0, originalFilename.lastIndexOf('.')) + ".jpg" : "default.jpg";

        User user = new User();
        Set<Role> roleSet = new HashSet<>();

        if (roles == null || roles.isEmpty()) {
            // Default to ROLE_USER if no roles provided
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roleSet.add(userRole);
        } else {
            // Iterate over each role in the request
            roles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roleSet.add(adminRole);
                        break;
                    case "mod":
                        Role modRole = roleRepository.findByName(ERole.ROLE_MODERATOR)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roleSet.add(modRole);
                        break;
                    default:
                        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roleSet.add(userRole);
                        break;
                }
            });
        }

        // Set user details
        user.setRoles(roleSet);
        user.setFullName(fullName);
        user.setPhone(Integer.parseInt(phone));
        user.setEmail(email);
        user.setUsername(username);
        user.setPassword(encoder.encode(password));
        user.setGender(gender);
        user.setAddress(address);
        user.setImage(newFilename);

        // Save the user
        User savedUser = userRepository.save(user);

        // Store the file
        storeService.saveFile(file, newFilename, "users");

        return ResponseEntity.ok(savedUser);
    }


    @PutMapping("/edit/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        try {
            Optional<User> userOptional = userRepository.findById(id);
            if (userOptional.isPresent()) {
                User user = userService.updateUser(id, updatedUser);
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(404).body("User not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating user: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable("id") Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }


}
