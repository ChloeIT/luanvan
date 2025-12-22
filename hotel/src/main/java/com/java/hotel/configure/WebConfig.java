package com.java.hotel.configure;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // 1) Users avatars
        Path usersDir = Paths.get("src/main/resources/static/images/users")
                .toAbsolutePath()
                .normalize();

        registry.addResourceHandler("/images/users/**")
                .addResourceLocations(usersDir.toUri().toString());

        // 2) Hotels images
        Path hotelsDir = Paths.get("src/main/resources/static/images/hotels")
                .toAbsolutePath()
                .normalize();

        registry.addResourceHandler("/images/hotels/**")
                .addResourceLocations(hotelsDir.toUri().toString());

        // 3) Rooms images
        Path roomsDir = Paths.get("src/main/resources/static/images/rooms")
                .toAbsolutePath()
                .normalize();

        registry.addResourceHandler("/images/rooms/**")
                .addResourceLocations(roomsDir.toUri().toString());
    }
}
