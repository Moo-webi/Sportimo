package com.muhammed.Sportimo.service;

import com.muhammed.Sportimo.dto.FacilityRequest;
import com.muhammed.Sportimo.entity.*;
import com.muhammed.Sportimo.repository.FacilityRepository;
import com.muhammed.Sportimo.repository.SportRepository;
import com.muhammed.Sportimo.repository.SportsCenterRepository;
import com.muhammed.Sportimo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class FacilityService {

    private final UserRepository userRepository;
    private final SportsCenterRepository sportsCenterRepository;
    private final FacilityRepository facilityRepository;
    private final SportRepository sportRepository;

    public Facility createFacility(FacilityRequest request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.CENTER) {
            throw new RuntimeException("Only sports centers can create facilities");
        }

        SportsCenter center = sportsCenterRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Sports center not found"));

        Sport sport = sportRepository.findById(request.getSportId())
                .orElseThrow(() -> new RuntimeException("Sport not found"));

        Facility facility = new Facility();
        facility.setName(request.getName());
        facility.setDescription(request.getDescription());
        facility.setPricePerHour(request.getPricePerHour());
        facility.setSportsCenter(center);
        facility.setSport(sport);

        return facilityRepository.save(facility);
    }
}