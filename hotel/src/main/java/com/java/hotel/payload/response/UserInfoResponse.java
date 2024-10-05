package com.java.hotel.payload.response;
import java.util.Date;
import java.util.List;

public class UserInfoResponse {
    private String accessToken;
    private Long id;
    private String fullName;
    private String email;
    private String username;
    private int phone;
    private String image;
    private String address;
    private String gender; // Example: "Male", "Female", etc.
    private Date birthDate;
    private List<String> roles;

    public UserInfoResponse() {    }

    public UserInfoResponse(String accessToken,Long id, String fullName, String email, String username,  int phone, String image, String address, String gender, Date birthDate, List<String> roles) {
        this.accessToken = accessToken;
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.username = username;
        this.phone = phone;
        this.image = image;
        this.address = address;
        this.gender = gender;
        this.birthDate = birthDate;
        this.roles = roles;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public int getPhone() {
        return phone;
    }

    public void setPhone(int phone) {
        this.phone = phone;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Date getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(Date birthDate) {
        this.birthDate = birthDate;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}
