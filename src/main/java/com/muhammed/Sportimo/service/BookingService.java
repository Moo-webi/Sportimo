package com.muhammed.Sportimo.service;

import com.muhammed.Sportimo.dto.BookingRequest;
import com.muhammed.Sportimo.entity.*;
import com.muhammed.Sportimo.repository.AthleteRepository;
import com.muhammed.Sportimo.repository.BookingRepository;
import com.muhammed.Sportimo.repository.FacilityRepository;
import com.muhammed.Sportimo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FacilityRepository facilityRepository;
    private final AthleteRepository athleteRepository;
    private final UserRepository userRepository;

    public Booking createBooking(BookingRequest request, String email) {

        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new RuntimeException("Start time must be before end time");
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
}