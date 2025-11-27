package com.java.hotel.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.util.List;

@Entity
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String address;
    private String phone;
    private float rating;
    private String image;
    private String amenities;

    // ⭐ Chủ khách sạn: map vào cột owner_id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;   // KHÔNG @JsonIgnore ở field

    // ⭐ Quan hệ với Room – ẩn đi để tránh vòng lặp Hotel <-> Room
    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Room> rooms;

    public Hotel() {}

    public Hotel(Long id,
                 String name,
                 String phone,
                 String address,
                 float rating,
                 String image,
                 String amenities,
                 User owner,
                 List<Room> rooms) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.address = address;
        this.rating = rating;
        this.image = image;
        this.amenities = amenities;
        this.owner = owner;
        this.rooms = rooms;
    }

    // ===== Getter / Setter =====

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public float getRating() { return rating; }
    public void setRating(float rating) { this.rating = rating; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }

    // ⛔ Không serialize owner để tránh vòng lặp
    @JsonIgnore
    public User getOwner() {
        return owner;
    }
    public void setOwner(User owner) {
        this.owner = owner;
    }

    @JsonIgnore
    public List<Room> getRooms() {
        return rooms;
    }
    public void setRooms(List<Room> rooms) {
        this.rooms = rooms;
    }

    // ⭐ Field ảo: gửi thêm ownerId cho FE
    @JsonProperty("ownerId")
    public Long getOwnerId() {
        return owner != null ? owner.getId() : null;
    }
}
