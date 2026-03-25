package com.muhammed.Sportimo.controller;

import com.muhammed.Sportimo.dto.SportsCenterProfileResponse;
import com.muhammed.Sportimo.dto.SportsCenterProfileUpdateRequest;
import com.muhammed.Sportimo.service.SportsCenterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/centers")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class SportsCenterController {

    private final SportsCenterService sportsCenterService;

    @GetMapping("/me")
    public ResponseEntity<SportsCenterProfileResponse> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(sportsCenterService.getMyProfile(authentication.getName()));
    }

    @PutMapping("/me")
    public ResponseEntity<SportsCenterProfileResponse> updateMyProfile(
            @RequestBody SportsCenterProfileUpdateRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(sportsCenterService.updateMyProfile(authentication.getName(), request));
    }
}
