package com.muhammed.Sportimo.service;

import com.muhammed.Sportimo.dto.SportsCenterProfileResponse;
import com.muhammed.Sportimo.dto.SportsCenterProfileUpdateRequest;
import com.muhammed.Sportimo.entity.Role;
import com.muhammed.Sportimo.entity.SportsCenter;
import com.muhammed.Sportimo.entity.User;
import com.muhammed.Sportimo.repository.SportsCenterRepository;
import com.muhammed.Sportimo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SportsCenterService {

    private final UserRepository userRepository;
    private final SportsCenterRepository sportsCenterRepository;

    public SportsCenterProfileResponse getMyProfile(String email) {
        SportsCenter center = getCurrentCenter(email);
        return toProfileResponse(center);
    }

    public SportsCenterProfileResponse updateMyProfile(String email, SportsCenterProfileUpdateRequest request) {
        SportsCenter center = getCurrentCenter(email);

        center.setName(trimToNull(request.getName()));
        center.setDescription(trimToNull(request.getDescription()));
        center.setPhone(trimToNull(request.getPhone()));
        center.setAddress(trimToNull(request.getAddress()));
        center.setLatitude(request.getLatitude());
        center.setLongitude(request.getLongitude());

        sportsCenterRepository.save(center);
        return toProfileResponse(center);
    }

    private SportsCenter getCurrentCenter(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.CENTER) {
            throw new RuntimeException("Only sports centers can access this profile");
        }

        return sportsCenterRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Sports center not found"));
    }

    private SportsCenterProfileResponse toProfileResponse(SportsCenter center) {
        return new SportsCenterProfileResponse(
                center.getId(),
                center.getName(),
                center.getDescription(),
                center.getPhone(),
                center.getAddress(),
                center.getLatitude(),
                center.getLongitude(),
                center.getGoogleMapsUrl()
        );
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
