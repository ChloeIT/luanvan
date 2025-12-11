// src/main/java/com/java/hotel/payload/request/NewsletterRequest.java
package com.java.hotel.payload.request;

import java.util.List;

public class NewsletterRequest {

    // ===== 1) Khách subscribe ở Footer =====
    private String email;

    // ===== 2) Admin gửi khuyến mãi =====
    // ids có thể null / rỗng => gửi cho TẤT CẢ subscribers
    private List<Long> ids;
    private String subject;
    private String content;

    public NewsletterRequest() {
    }

    public NewsletterRequest(String email) {
        this.email = email;
    }

    // ---------- getter / setter ----------

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<Long> getIds() {
        return ids;
    }

    public void setIds(List<Long> ids) {
        this.ids = ids;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
