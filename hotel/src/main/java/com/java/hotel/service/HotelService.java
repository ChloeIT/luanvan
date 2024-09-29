package com.java.hotel.service;

import com.java.hotel.model.Hotel;
import com.java.hotel.repository.HotelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HotelService {
    @Autowired private HotelRepository hotelRepository;
    public List<Hotel> findAll() {
        return hotelRepository.findAll();
    }
}
