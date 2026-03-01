package com.muhammed.Sportimo.controller;

import com.muhammed.Sportimo.dto.LoginRequest;
import com.muhammed.Sportimo.dto.RegisterRequest;
import com.muhammed.Sportimo.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // Allow react
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        String token = authService.login(request);
        return ResponseEntity.ok(token); // Or return a DTO containing the token
    }

    @GetMapping("/profile")
    public ResponseEntity<String> getProfile(Principal principal) {
        // principal.getName() will return the Email you stored in the JWT Subject
        return ResponseEntity.ok("Hello, " + principal.getName());
    }
}