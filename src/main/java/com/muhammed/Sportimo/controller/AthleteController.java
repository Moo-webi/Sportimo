package com.muhammed.Sportimo.controller;

import com.muhammed.Sportimo.dto.AthleteMeResponse;
import com.muhammed.Sportimo.service.AthleteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/athletes")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AthleteController {

    private final AthleteService athleteService;

    @GetMapping("/me")
    public ResponseEntity<AthleteMeResponse> getMe(Authentication authentication) {
        return ResponseEntity.ok(athleteService.getCurrentAthleteProfile(authentication.getName()));
    }
}
