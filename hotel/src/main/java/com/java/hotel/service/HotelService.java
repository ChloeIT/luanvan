package com.java.hotel.service;

import com.java.hotel.model.Hotel;
import com.java.hotel.repository.HotelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HotelService {
    @Autowired
    private HotelRepository hotelRepository;

    public List<Hotel> findAll() {
        return hotelRepository.findAll();
    }

    public Hotel updateHotel(Long id, Hotel updatedHotel) throws Exception{
        Optional<Hotel> existingHotelOptional = hotelRepository.findById(id);
        if (existingHotelOptional.isPresent()) {
            Hotel existingHotel = existingHotelOptional.get();

            existingHotel.setName(updatedHotel.getName());
            existingHotel.setAddress(updatedHotel.getAddress());
            existingHotel.setPhone(updatedHotel.getPhone());
            existingHotel.setRating(updatedHotel.getRating());
            existingHotel.setImage(updatedHotel.getImage());
            existingHotel.setAmenities(updatedHotel.getAmenities());

            return hotelRepository.save(existingHotel);

        } else {
            throw new Exception("Hotel not found");
        }
    }
}
