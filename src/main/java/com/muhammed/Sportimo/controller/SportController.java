package com.muhammed.Sportimo.controller;

import com.muhammed.Sportimo.entity.Sport;
import com.muhammed.Sportimo.repository.SportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sports")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class SportController {

    private final SportRepository sportRepository;

    @GetMapping
    public ResponseEntity<List<Sport>> getAllSports() {
        return ResponseEntity.ok(sportRepository.findAll()); //
    }

    @PostMapping
    public ResponseEntity<Sport> createSport(@RequestBody Sport sport) {
        return ResponseEntity.ok(sportRepository.save(sport)); //
    }
}