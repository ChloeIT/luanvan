package com.java.hotel.service;

import com.java.hotel.model.User;
import com.java.hotel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User updateUser(Long id, User updatedUser) throws Exception {
        Optional<User> existingUserOptional = userRepository.findById(id);
        if (existingUserOptional.isPresent()) {
            User existingUser = existingUserOptional.get();

            // Update allowed fields only
            existingUser.setFullName(updatedUser.getFullName());
            existingUser.setPhone(updatedUser.getPhone());
            existingUser.setAddress(updatedUser.getAddress());
            existingUser.setImage(updatedUser.getImage());
            existingUser.setBirthDate(updatedUser.getBirthDate());
            existingUser.setGender(updatedUser.getGender());

            // Save updated user
            return userRepository.save(existingUser);
        } else {
            throw new Exception("User not found");
        }
    }
}
