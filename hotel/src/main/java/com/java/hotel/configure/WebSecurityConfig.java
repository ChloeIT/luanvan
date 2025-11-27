package com.java.hotel.configure;

import com.java.hotel.security.jwt.AuthEntryPointJwt;
import com.java.hotel.security.jwt.AuthTokenFilter;
import com.java.hotel.security.services.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity // để dùng @PreAuthorize ở controller
public class WebSecurityConfig {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration
    ) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Bỏ qua hoàn toàn security cho static resources (không ảnh hưởng /api/**).
     */
    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return web -> web.ignoring().requestMatchers(
                "/css/**",
                "/js/**",
                "/favicon.ico"
        );
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(ex -> ex.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 🔥 Chỉ áp dụng config này cho các URL /api/**
                .securityMatcher("/api/**")

                .authorizeHttpRequests(auth -> auth

                        // ====== PUBLIC APIs ======
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/test/**").permitAll()

                        // Cho Home, trang khách dùng để xem danh sách khách sạn / phòng
                        .requestMatchers("/api/hotel/all").permitAll()
                        .requestMatchers("/api/room/all").permitAll()

                        // Cho phép user (khách) tạo booking không cần role ADMIN
                        .requestMatchers("/api/booking/create").permitAll()

                        // ====== KHU VỰC MOD / ADMIN ======
                        // Nếu sau này có controller riêng /api/mod/** thì:
                        // chỉ MODERATOR hoặc ADMIN mới vào được
                        .requestMatchers("/api/mod/**")
                        .hasAnyRole("MODERATOR", "ADMIN")

                        // Các API /api/** còn lại yêu cầu phải đăng nhập,
                        // quyền cụ thể sẽ do @PreAuthorize trong controller kiểm soát
                        .anyRequest().authenticated()
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(),
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
