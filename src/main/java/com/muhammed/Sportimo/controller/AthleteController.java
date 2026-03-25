package com.muhammed.Sportimo.controller;

import com.muhammed.Sportimo.dto.AthleteDirectoryItemDto;
import com.muhammed.Sportimo.dto.AthleteMeResponse;
import com.muhammed.Sportimo.dto.AthleteProfileResponse;
import com.muhammed.Sportimo.dto.AthleteProfileUpdateRequest;
import com.muhammed.Sportimo.service.AthleteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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

    @GetMapping
    public ResponseEntity<List<AthleteDirectoryItemDto>> getDirectory(Authentication authentication) {
        return ResponseEntity.ok(athleteService.getAthleteDirectory(authentication.getName()));
    }

    @GetMapping("/{athleteId}")
    public ResponseEntity<AthleteProfileResponse> getAthleteProfile(
            @PathVariable Long athleteId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(athleteService.getAthleteProfile(authentication.getName(), athleteId));
    }

    @PutMapping("/me")
    public ResponseEntity<AthleteMeResponse> updateMe(
            @RequestBody AthleteProfileUpdateRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(athleteService.updateCurrentAthleteProfile(authentication.getName(), request));
    }

    @PostMapping("/{athleteId}/friend-requests")
    public ResponseEntity<Void> sendFriendRequest(
            @PathVariable Long athleteId,
            Authentication authentication
    ) {
        athleteService.sendFriendRequest(authentication.getName(), athleteId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/friend-requests/{requestId}/accept")
    public ResponseEntity<Void> acceptFriendRequest(
            @PathVariable Long requestId,
            Authentication authentication
    ) {
        athleteService.acceptFriendRequest(authentication.getName(), requestId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/friend-requests/{requestId}")
    public ResponseEntity<Void> declineFriendRequest(
            @PathVariable Long requestId,
            Authentication authentication
    ) {
        athleteService.declineFriendRequest(authentication.getName(), requestId);
        return ResponseEntity.noContent().build();
    }
}
