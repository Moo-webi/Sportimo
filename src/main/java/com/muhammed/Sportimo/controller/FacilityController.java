package com.muhammed.Sportimo.controller;

import com.muhammed.Sportimo.dto.FacilityRequest;
import com.muhammed.Sportimo.dto.FacilityAvailabilityRequest;
import com.muhammed.Sportimo.dto.FacilityAvailabilityResponse;
import com.muhammed.Sportimo.entity.Facility;
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

    @GetMapping("/mine")
    public ResponseEntity<List<Facility>> getMyFacilities(Authentication authentication) {
        return ResponseEntity.ok(facilityService.getMyFacilities(authentication.getName()));
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

    @PutMapping("/{facilityId}")
    public ResponseEntity<Facility> updateFacility(
            @PathVariable Long facilityId,
            @RequestBody FacilityRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(facilityService.updateFacility(facilityId, request, authentication.getName()));
    }

    @DeleteMapping("/{facilityId}")
    public ResponseEntity<Void> deleteFacility(@PathVariable Long facilityId, Authentication authentication) {
        facilityService.deleteFacility(facilityId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{facilityId}/availability")
    public ResponseEntity<List<FacilityAvailabilityResponse>> getFacilityAvailability(
            @PathVariable Long facilityId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(facilityService.getFacilityAvailability(facilityId, authentication.getName()));
    }

    @PostMapping("/{facilityId}/availability")
    public ResponseEntity<FacilityAvailabilityResponse> addFacilityAvailability(
            @PathVariable Long facilityId,
            @RequestBody FacilityAvailabilityRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(facilityService.addFacilityAvailability(facilityId, request, authentication.getName()));
    }

    @PutMapping("/{facilityId}/availability/{availabilityId}")
    public ResponseEntity<FacilityAvailabilityResponse> updateFacilityAvailability(
            @PathVariable Long facilityId,
            @PathVariable Long availabilityId,
            @RequestBody FacilityAvailabilityRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(facilityService.updateFacilityAvailability(
                facilityId, availabilityId, request, authentication.getName()
        ));
    }

    @DeleteMapping("/{facilityId}/availability/{availabilityId}")
    public ResponseEntity<Void> deleteFacilityAvailability(
            @PathVariable Long facilityId,
            @PathVariable Long availabilityId,
            Authentication authentication
    ) {
        facilityService.deleteFacilityAvailability(facilityId, availabilityId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
