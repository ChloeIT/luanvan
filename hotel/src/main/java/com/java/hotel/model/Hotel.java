package com.java.hotel.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "hotel")
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

    // ⭐ THÊM TỌA ĐỘ
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    // ⭐ Chủ khách sạn: khóa ngoại owner_id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    @JsonIgnore   // tránh vòng lặp
    private User owner;

    // ⭐ Danh sách phòng – KHÔNG gửi ra FE để tránh vòng lặp
    @OneToMany(mappedBy = "hotel", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Room> rooms;

    public Hotel() {}

    public Hotel(Long id, String name, String phone, String address,
                 float rating, String image, String amenities,
                 Double latitude, Double longitude,
                 User owner, List<Room> rooms) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.address = address;
        this.rating = rating;
        this.image = image;
        this.amenities = amenities;
        this.latitude = latitude;
        this.longitude = longitude;
        this.owner = owner;
        this.rooms = rooms;
    }

    // ============= GETTER - SETTER ============= //

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

    // ⭐ GET/SET TỌA ĐỘ (QUAN TRỌNG CHO MAP & NEARBY)
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    // ⭐ Quan hệ owner
    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public List<Room> getRooms() { return rooms; }
    public void setRooms(List<Room> rooms) { this.rooms = rooms; }

    // ⭐ Field ảo gửi ownerId cho FE
    @JsonProperty("ownerId")
    public Long getOwnerId() {
        return owner != null ? owner.getId() : null;
    }
}
