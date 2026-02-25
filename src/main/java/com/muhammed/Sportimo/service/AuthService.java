package com.muhammed.Sportimo.service;

import com.muhammed.Sportimo.dto.LoginRequest;
import com.muhammed.Sportimo.dto.RegisterRequest;
import com.muhammed.Sportimo.entity.Athlete;
import com.muhammed.Sportimo.entity.SportsCenter;
import com.muhammed.Sportimo.entity.User;
import com.muhammed.Sportimo.entity.Role;
import com.muhammed.Sportimo.repository.AthleteRepository;
import com.muhammed.Sportimo.repository.SportsCenterRepository;
import com.muhammed.Sportimo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AthleteRepository athleteRepository;
    private final SportsCenterRepository sportsCenterRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager; // Add this to your final fields

    @Transactional
    public void register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .isActive(true)
                .build();

        userRepository.save(user);

        if (request.getRole() == Role.ATHLETE) {

            Athlete athlete = Athlete.builder()
                    .user(user)
                    .build();

            athleteRepository.save(athlete);

        } else if (request.getRole() == Role.CENTER) {

            SportsCenter center = SportsCenter.builder()
                    .user(user)
                    .build();

            sportsCenterRepository.save(center);
        }
    }

    public String login(LoginRequest request) {
        // This line replaces your manual password check.
        // It will automatically throw an exception if the email/password is wrong.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // If we reach this line, the user is authenticated!
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return jwtService.generateToken(user);
    }
}