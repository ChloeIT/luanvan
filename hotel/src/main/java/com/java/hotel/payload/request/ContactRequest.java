package com.java.hotel.payload.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ContactRequest {

    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Email
    @Size(max = 150)
    private String email;

    @Size(max = 150)
    private String subject;

    /**
     * Topic gốc từ form (booking, payment, loyalty, support, other, ...)
     * FE có thể gửi dạng chữ thường, BE lưu lại string này.
     */
    @Size(max = 50)
    private String topic;

    @NotBlank
    private String message;

    // ✅ Dùng cho ADMIN khi reply (optional, FE chỉ cần gửi khi reply)
    @Size(max = 2000)
    private String reply;

    // ===== GETTER / SETTER =====

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }
}
