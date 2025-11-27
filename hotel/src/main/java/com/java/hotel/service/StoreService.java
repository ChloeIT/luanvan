package com.java.hotel.service;

import com.java.hotel.model.User;
import com.java.hotel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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
        return user.orElse(null);
    }

    /**
     * Sinh tên file ảnh .jpg từ MultipartFile
     * - Nếu có đuôi: cắt bỏ phần đuôi và gán .jpg
     * - Nếu không có tên: trả về "default.jpg"
     */
    public String generateImageName(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            return "default.jpg";
        }

        int dotIndex = originalFilename.lastIndexOf('.');
        String baseName = (dotIndex > 0)
                ? originalFilename.substring(0, dotIndex)
                : originalFilename;

        return baseName + ".jpg";
    }

    /**
     * Lưu file vào thư mục resources/static/images/{folderName}/
     */
    public String saveFile(MultipartFile file, String filename, String folderName) throws IOException {
        String resourcePath = System.getProperty("user.dir")
                + "/src/main/resources/static/images/"
                + folderName + "/";

        Path path = Paths.get(resourcePath + filename);
        Files.createDirectories(path.getParent());
        Files.write(path, file.getBytes());
        return filename;
    }
}
