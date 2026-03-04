package com.muhammed.Sportimo.controller;

import com.muhammed.Sportimo.dto.LandingDataResponse;
import com.muhammed.Sportimo.service.LandingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class PublicController {

    private final LandingService landingService;

    @GetMapping("/landing")
    public ResponseEntity<LandingDataResponse> getLandingData() {
        return ResponseEntity.ok(landingService.getLandingData());
    }
}
