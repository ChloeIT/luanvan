package com.java.hotel.service;

import com.java.hotel.model.User;
import com.java.hotel.repository.UserRepository;
import com.java.hotel.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Service
public class StoreService {
    @Autowired
    private UserRepository userRepository;

    public User getCurrentUser() throws ExecutionException, InterruptedException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println(authentication.getPrincipal());
        Optional<User> user = userRepository.findByUsername(authentication.getName());
        return user.get();
    }

}
