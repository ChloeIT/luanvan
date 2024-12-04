package com.java.hotel.service;

import com.java.hotel.model.Room;
import com.java.hotel.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.util.List;
import java.util.Optional;

@Service
public class RoomService {
    @Autowired
    private RoomRepository roomRepository;

    public List<Room> findAll() {
        return roomRepository.findAll();
    }

    public Room updateRoom(Long id, Room updateRoom) throws Exception {
        Optional<Room> existingRoomOptional = roomRepository.findById(id);

        if (existingRoomOptional.isPresent()) {
            Room existingRoom = existingRoomOptional.get();

            existingRoom.setName(updateRoom.getName());
            existingRoom.setCapacity(updateRoom.getCapacity());
            existingRoom.setPrice(updateRoom.getPrice());
            existingRoom.setType(updateRoom.getType());
            existingRoom.setAvailability(updateRoom.getAvailability());
            existingRoom.setImage(updateRoom.getImage());
            existingRoom.setCreate_at(updateRoom.getCreate_at());
            existingRoom.setUpdate_at(updateRoom.getUpdate_at());

            return roomRepository.save(existingRoom);

        } else {
            throw new Exception("Room not found");
        }
    }
}
