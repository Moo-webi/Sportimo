package com.muhammed.Sportimo.controller;

import com.muhammed.Sportimo.dto.FacilityRequest;
import com.muhammed.Sportimo.entity.Facility;
import com.muhammed.Sportimo.repository.FacilityRepository;
import com.muhammed.Sportimo.service.FacilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facilities")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class FacilityController {

    private final FacilityService facilityService;

    @GetMapping
    public ResponseEntity<List<Facility>> getAllFacilities() {
        return ResponseEntity.ok(facilityService.getAllFacilities());
    }

    @PostMapping
    public ResponseEntity<Facility> createFacility(
            @RequestBody FacilityRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName(); // comes from JWT

        Facility facility = facilityService.createFacility(request, email);

        return ResponseEntity.ok(facility);
    }
}