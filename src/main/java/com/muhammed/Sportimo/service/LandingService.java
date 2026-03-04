package com.muhammed.Sportimo.service;

import com.muhammed.Sportimo.dto.FeaturedFacilityDto;
import com.muhammed.Sportimo.dto.LandingDataResponse;
import com.muhammed.Sportimo.dto.UpcomingMatchDto;
import com.muhammed.Sportimo.entity.BookingStatus;
import com.muhammed.Sportimo.repository.BookingRepository;
import com.muhammed.Sportimo.repository.FacilityAvailabilityRepository;
import com.muhammed.Sportimo.repository.FacilityRepository;
import com.muhammed.Sportimo.repository.SportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LandingService {

    private final SportRepository sportRepository;
    private final FacilityRepository facilityRepository;
    private final FacilityAvailabilityRepository facilityAvailabilityRepository;
    private final BookingRepository bookingRepository;

    public LandingDataResponse getLandingData() {
        List<BookingStatus> activeStatuses = Arrays.asList(BookingStatus.PENDING, BookingStatus.CONFIRMED);
        LocalDateTime now = LocalDateTime.now();

        List<String> spotlightSports = sportRepository.findAll().stream()
                .map(s -> s.getName())
                .limit(4)
                .toList();

        List<FeaturedFacilityDto> featuredFacilities = facilityRepository.findTop3ByOrderByCreatedAtDesc().stream()
                .map(f -> new FeaturedFacilityDto(
                        f.getId(),
                        f.getName(),
                        f.getDescription(),
                        f.getSport() != null ? f.getSport().getName() : null,
                        f.getPricePerHour()
                ))
                .toList();

        List<UpcomingMatchDto> upcomingMatches = bookingRepository
                .findTop3ByStatusInAndStartTimeAfterOrderByStartTimeAsc(activeStatuses, now).stream()
                .map(b -> new UpcomingMatchDto(
                        b.getId(),
                        b.getFacility() != null ? b.getFacility().getName() : null,
                        b.getFacility() != null && b.getFacility().getSport() != null ? b.getFacility().getSport().getName() : null,
                        b.getStartTime()
                ))
                .toList();

        return new LandingDataResponse(
                sportRepository.count(),
                facilityRepository.count(),
                facilityAvailabilityRepository.count(),
                bookingRepository.countByStatusInAndStartTimeAfter(activeStatuses, now),
                spotlightSports,
                featuredFacilities,
                upcomingMatches
        );
    }
}
