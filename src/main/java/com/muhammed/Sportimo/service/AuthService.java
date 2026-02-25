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

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // 1️⃣ Create User (authentication part)
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        userRepository.save(user);

        // 2️⃣ Create role-specific profile
        if (request.getRole() == Role.ATHLETE) {

            validateAthleteData(request);

            Athlete athlete = new Athlete();
            athlete.setUser(user);
            athlete.setFirstName(request.getFirstName());
            athlete.setLastName(request.getLastName());
            athlete.setBirthDate(request.getBirthDate());
            athlete.setHeight(request.getHeight());
            athlete.setWeight(request.getWeight());

            athleteRepository.save(athlete);
        }

        else if (request.getRole() == Role.CENTER) {

            validateSportsCenterData(request);

            SportsCenter center = new SportsCenter();
            center.setUser(user);
            center.setName(request.getName());
            center.setDescription(request.getDescription());
            center.setPhone(request.getPhone());
            center.setAddress(request.getAddress());
            center.setLatitude(request.getLatitude());
            center.setLongitude(request.getLongitude());

            sportsCenterRepository.save(center);
        }

        else {
            throw new RuntimeException("Invalid role");
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

    private void validateAthleteData(RegisterRequest request) {
        if (request.getFirstName() == null || request.getLastName() == null) {
            throw new RuntimeException("Athlete name is required");
        }
    }


    private void validateSportsCenterData(RegisterRequest request) {
        if (request.getName() == null || request.getAddress() == null) {
            throw new RuntimeException("Sports center data incomplete");
        }
    }
}