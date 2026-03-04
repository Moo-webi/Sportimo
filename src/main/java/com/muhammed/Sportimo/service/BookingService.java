package com.muhammed.Sportimo.service;

import com.muhammed.Sportimo.dto.BookingRequest;
import com.muhammed.Sportimo.dto.AvailableSlotDto;
import com.muhammed.Sportimo.dto.CenterBookingDto;
import com.muhammed.Sportimo.entity.*;
import com.muhammed.Sportimo.repository.AthleteRepository;
import com.muhammed.Sportimo.repository.BookingRepository;
import com.muhammed.Sportimo.repository.FacilityAvailabilityRepository;
import com.muhammed.Sportimo.repository.FacilityRepository;
import com.muhammed.Sportimo.repository.SportsCenterRepository;
import com.muhammed.Sportimo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FacilityRepository facilityRepository;
    private final FacilityAvailabilityRepository facilityAvailabilityRepository;
    private final AthleteRepository athleteRepository;
    private final SportsCenterRepository sportsCenterRepository;
    private final UserRepository userRepository;

    public Booking createBooking(BookingRequest request, String email) {

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }

        if (request.getStartTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot book in the past");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.ATHLETE) {
            throw new RuntimeException("Only athletes can book facilities");
        }

        Athlete athlete = athleteRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Athlete not found"));

        Facility facility = facilityRepository.findById(request.getFacilityId())
                .orElseThrow(() -> new RuntimeException("Facility not found"));

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                facility.getId(),
                request.getStartTime(),
                request.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Time slot already booked");
        }

        LocalDateTime now = LocalDateTime.now();

        Booking booking = Booking.builder()
                .facility(facility)
                .athlete(athlete)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(BookingStatus.PENDING)
                .createdAt(now)
                .expiresAt(now.plusMinutes(10))
                .build();

        return bookingRepository.save(booking);
    }

    @Transactional(readOnly = true)
    public List<AvailableSlotDto> getAvailableSlots(Long facilityId, LocalDate date) {
        Facility facility = facilityRepository.findById(facilityId)
                .orElseThrow(() -> new RuntimeException("Facility not found"));

        if (facility.getIsActive() == null || !facility.getIsActive()) {
            return List.of();
        }

        DayOfWeek dayOfWeek = mapDayOfWeek(date);
        List<FacilityAvailability> dayAvailabilities =
                facilityAvailabilityRepository.findByFacilityIdAndDayOfWeekOrderByStartTimeAsc(facilityId, dayOfWeek);

        if (dayAvailabilities.isEmpty()) {
            return List.of();
        }

        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = dayStart.plusDays(1);

        List<BookingStatus> activeStatuses = Arrays.asList(BookingStatus.PENDING, BookingStatus.CONFIRMED);
        List<Booking> dayBookings = bookingRepository
                .findByFacilityIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThanOrderByStartTimeAsc(
                        facilityId, activeStatuses, dayEnd, dayStart
                );

        List<AvailableSlotDto> availableSlots = new ArrayList<>();

        for (FacilityAvailability availability : dayAvailabilities) {
            LocalDateTime windowStart = date.atTime(availability.getStartTime());
            LocalDateTime windowEnd = date.atTime(availability.getEndTime());
            LocalDateTime cursor = windowStart;

            for (Booking booking : dayBookings) {
                if (booking.getEndTime().isBefore(windowStart) || booking.getEndTime().isEqual(windowStart)) {
                    continue;
                }
                if (booking.getStartTime().isAfter(windowEnd) || booking.getStartTime().isEqual(windowEnd)) {
                    break;
                }

                LocalDateTime overlapStart = booking.getStartTime().isAfter(windowStart) ? booking.getStartTime() : windowStart;
                LocalDateTime overlapEnd = booking.getEndTime().isBefore(windowEnd) ? booking.getEndTime() : windowEnd;

                if (overlapStart.isAfter(cursor)) {
                    availableSlots.add(new AvailableSlotDto(cursor, overlapStart));
                }
                if (overlapEnd.isAfter(cursor)) {
                    cursor = overlapEnd;
                }
            }

            if (windowEnd.isAfter(cursor)) {
                availableSlots.add(new AvailableSlotDto(cursor, windowEnd));
            }
        }

        return availableSlots;
    }

    private DayOfWeek mapDayOfWeek(LocalDate date) {
        return switch (date.getDayOfWeek()) {
            case MONDAY -> DayOfWeek.MON;
            case TUESDAY -> DayOfWeek.TUE;
            case WEDNESDAY -> DayOfWeek.WED;
            case THURSDAY -> DayOfWeek.THU;
            case FRIDAY -> DayOfWeek.FRI;
            case SATURDAY -> DayOfWeek.SAT;
            case SUNDAY -> DayOfWeek.SUN;
        };
    }

    @Transactional(readOnly = true)
    public List<CenterBookingDto> getCenterBookings(String email) {
        SportsCenter center = getCurrentCenter(email);

        return bookingRepository.findByFacilitySportsCenterIdOrderByStartTimeDesc(center.getId())
                .stream()
                .map(booking -> {
                    String athleteName = booking.getAthlete() != null
                            ? (safe(booking.getAthlete().getFirstName()) + " " + safe(booking.getAthlete().getLastName())).trim()
                            : null;
                    if (athleteName == null || athleteName.isBlank()) {
                        athleteName = "Athlete";
                    }

                    String athleteEmail = booking.getAthlete() != null && booking.getAthlete().getUser() != null
                            ? booking.getAthlete().getUser().getEmail()
                            : null;

                    return new CenterBookingDto(
                            booking.getId(),
                            booking.getFacility() != null ? booking.getFacility().getName() : null,
                            booking.getFacility() != null && booking.getFacility().getSport() != null
                                    ? booking.getFacility().getSport().getName()
                                    : null,
                            athleteName,
                            athleteEmail,
                            booking.getStartTime(),
                            booking.getEndTime(),
                            booking.getStatus()
                    );
                })
                .toList();
    }

    public CenterBookingDto confirmCenterBooking(Long bookingId, String email) {
        SportsCenter center = getCurrentCenter(email);
        Booking booking = bookingRepository.findByIdAndFacilitySportsCenterId(bookingId, center.getId())
                .orElseThrow(() -> new RuntimeException("Booking not found for this sports center"));

        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            return toCenterBookingDto(booking);
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only pending bookings can be confirmed");
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        return toCenterBookingDto(booking);
    }

    private SportsCenter getCurrentCenter(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.CENTER) {
            throw new RuntimeException("Only sports centers can access this endpoint");
        }

        return sportsCenterRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Sports center not found"));
    }

    private CenterBookingDto toCenterBookingDto(Booking booking) {
        String athleteName = booking.getAthlete() != null
                ? (safe(booking.getAthlete().getFirstName()) + " " + safe(booking.getAthlete().getLastName())).trim()
                : null;
        if (athleteName == null || athleteName.isBlank()) {
            athleteName = "Athlete";
        }

        String athleteEmail = booking.getAthlete() != null && booking.getAthlete().getUser() != null
                ? booking.getAthlete().getUser().getEmail()
                : null;

        return new CenterBookingDto(
                booking.getId(),
                booking.getFacility() != null ? booking.getFacility().getName() : null,
                booking.getFacility() != null && booking.getFacility().getSport() != null
                        ? booking.getFacility().getSport().getName()
                        : null,
                athleteName,
                athleteEmail,
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getStatus()
        );
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
