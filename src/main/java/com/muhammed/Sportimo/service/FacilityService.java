package com.muhammed.Sportimo.service;

import com.muhammed.Sportimo.dto.FacilityRequest;
import com.muhammed.Sportimo.dto.FacilityAvailabilityRequest;
import com.muhammed.Sportimo.dto.FacilityAvailabilityResponse;
import com.muhammed.Sportimo.entity.*;
import com.muhammed.Sportimo.repository.BookingRepository;
import com.muhammed.Sportimo.repository.FacilityAvailabilityRepository;
import com.muhammed.Sportimo.repository.FacilityRepository;
import com.muhammed.Sportimo.repository.SportRepository;
import com.muhammed.Sportimo.repository.SportsCenterRepository;
import com.muhammed.Sportimo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FacilityService {

    private final UserRepository userRepository;
    private final SportsCenterRepository sportsCenterRepository;
    private final FacilityRepository facilityRepository;
    private final FacilityAvailabilityRepository facilityAvailabilityRepository;
    private final BookingRepository bookingRepository;
    private final SportRepository sportRepository;

    public Facility createFacility(FacilityRequest request, String email) {

        SportsCenter center = getCurrentCenter(email);

        Sport sport = sportRepository.findById(request.getSportId())
                .orElseThrow(() -> new RuntimeException("Sport not found"));

        Facility facility = new Facility();
        facility.setName(request.getName());
        facility.setDescription(request.getDescription());
        List<String> normalizedImageUrls = normalizeImageUrls(request.getImageUrls(), request.getImageUrl());
        facility.setImageUrls(normalizedImageUrls);
        facility.setImageUrl(normalizedImageUrls.isEmpty() ? null : normalizedImageUrls.get(0));
        facility.setPricePerHour(request.getPricePerHour());
        facility.setSportsCenter(center);
        facility.setSport(sport);
        facility.setAddress(firstNonBlank(request.getAddress(), center.getAddress()));
        facility.setLatitude(request.getLatitude() != null ? request.getLatitude() : center.getLatitude());
        facility.setLongitude(request.getLongitude() != null ? request.getLongitude() : center.getLongitude());
        facility.setSportsCenterName(facility.getSportsCenterName());

        return facilityRepository.save(facility);
    }

    public List<Facility> getAllFacilities() {
        return facilityRepository.findAll();
    }

    public List<Facility> getMyFacilities(String email) {
        SportsCenter center = getCurrentCenter(email);
        return facilityRepository.findBySportsCenterId(center.getId());
    }

    public Facility updateFacility(Long facilityId, FacilityRequest request, String email) {
        Facility facility = getOwnedFacility(facilityId, email);

        Sport sport = sportRepository.findById(request.getSportId())
                .orElseThrow(() -> new RuntimeException("Sport not found"));

        facility.setName(request.getName());
        facility.setDescription(request.getDescription());
        List<String> normalizedImageUrls = normalizeImageUrls(request.getImageUrls(), request.getImageUrl());
        facility.setImageUrls(normalizedImageUrls);
        facility.setImageUrl(normalizedImageUrls.isEmpty() ? null : normalizedImageUrls.get(0));
        facility.setPricePerHour(request.getPricePerHour());
        facility.setSport(sport);
        facility.setAddress(firstNonBlank(request.getAddress(), facility.getSportsCenter().getAddress()));
        facility.setLatitude(request.getLatitude() != null ? request.getLatitude() : facility.getSportsCenter().getLatitude());
        facility.setLongitude(request.getLongitude() != null ? request.getLongitude() : facility.getSportsCenter().getLongitude());

        return facilityRepository.save(facility);
    }

    public void deleteFacility(Long facilityId, String email) {
        Facility facility = getOwnedFacility(facilityId, email);

        if (bookingRepository.countByFacilityId(facilityId) > 0) {
            throw new RuntimeException("Facility has bookings and cannot be deleted");
        }

        facilityAvailabilityRepository.deleteByFacilityId(facilityId);
        facilityRepository.delete(facility);
    }

    public List<FacilityAvailabilityResponse> getFacilityAvailability(Long facilityId, String email) {
        getOwnedFacility(facilityId, email);
        return facilityAvailabilityRepository.findByFacilityIdOrderByDayOfWeekAscStartTimeAsc(facilityId)
                .stream()
                .map(this::toAvailabilityResponse)
                .toList();
    }

    public FacilityAvailabilityResponse addFacilityAvailability(Long facilityId, FacilityAvailabilityRequest request, String email) {
        Facility facility = getOwnedFacility(facilityId, email);
        validateAvailabilityRequest(request);

        FacilityAvailability availability = FacilityAvailability.builder()
                .facility(facility)
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();

        return toAvailabilityResponse(facilityAvailabilityRepository.save(availability));
    }

    public FacilityAvailabilityResponse updateFacilityAvailability(Long facilityId, Long availabilityId, FacilityAvailabilityRequest request, String email) {
        getOwnedFacility(facilityId, email);
        validateAvailabilityRequest(request);

        FacilityAvailability availability = facilityAvailabilityRepository.findByIdAndFacilityId(availabilityId, facilityId)
                .orElseThrow(() -> new RuntimeException("Availability not found"));

        availability.setDayOfWeek(request.getDayOfWeek());
        availability.setStartTime(request.getStartTime());
        availability.setEndTime(request.getEndTime());

        return toAvailabilityResponse(facilityAvailabilityRepository.save(availability));
    }

    public void deleteFacilityAvailability(Long facilityId, Long availabilityId, String email) {
        getOwnedFacility(facilityId, email);

        FacilityAvailability availability = facilityAvailabilityRepository.findByIdAndFacilityId(availabilityId, facilityId)
                .orElseThrow(() -> new RuntimeException("Availability not found"));

        facilityAvailabilityRepository.delete(availability);
    }

    private SportsCenter getCurrentCenter(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.CENTER) {
            throw new RuntimeException("Only sports centers can manage facilities");
        }

        return sportsCenterRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Sports center not found"));
    }

    private Facility getOwnedFacility(Long facilityId, String email) {
        SportsCenter center = getCurrentCenter(email);
        return facilityRepository.findByIdAndSportsCenterId(facilityId, center.getId())
                .orElseThrow(() -> new RuntimeException("Facility not found for this sports center"));
    }

    private void validateAvailabilityRequest(FacilityAvailabilityRequest request) {
        if (request == null
                || request.getDayOfWeek() == null
                || request.getStartTime() == null
                || request.getEndTime() == null) {
            throw new RuntimeException("Availability day and time are required");
        }
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new RuntimeException("Availability end time must be after start time");
        }
    }

    private FacilityAvailabilityResponse toAvailabilityResponse(FacilityAvailability availability) {
        return new FacilityAvailabilityResponse(
                availability.getId(),
                availability.getDayOfWeek(),
                availability.getStartTime(),
                availability.getEndTime()
        );
    }

    private List<String> normalizeImageUrls(List<String> imageUrls, String fallbackImageUrl) {
        List<String> normalized = new ArrayList<>();
        if (imageUrls != null) {
            for (String imageUrl : imageUrls) {
                if (imageUrl == null) continue;
                String trimmed = imageUrl.trim();
                if (!trimmed.isEmpty() && !normalized.contains(trimmed)) {
                    normalized.add(trimmed);
                }
            }
        }

        if (normalized.isEmpty() && fallbackImageUrl != null && !fallbackImageUrl.trim().isEmpty()) {
            normalized.add(fallbackImageUrl.trim());
        }
        return normalized;
    }

    private String firstNonBlank(String preferred, String fallback) {
        if (preferred != null && !preferred.trim().isEmpty()) {
            return preferred.trim();
        }
        if (fallback != null && !fallback.trim().isEmpty()) {
            return fallback.trim();
        }
        return null;
    }
}
