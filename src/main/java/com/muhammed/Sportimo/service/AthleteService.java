package com.muhammed.Sportimo.service;

import com.muhammed.Sportimo.dto.AthleteBookingDto;
import com.muhammed.Sportimo.dto.AthleteMeResponse;
import com.muhammed.Sportimo.entity.Athlete;
import com.muhammed.Sportimo.entity.Role;
import com.muhammed.Sportimo.entity.User;
import com.muhammed.Sportimo.repository.AthleteRepository;
import com.muhammed.Sportimo.repository.BookingRepository;
import com.muhammed.Sportimo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AthleteService {

    private final UserRepository userRepository;
    private final AthleteRepository athleteRepository;
    private final BookingRepository bookingRepository;

    public AthleteMeResponse getCurrentAthleteProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.ATHLETE) {
            throw new RuntimeException("Only athletes can access this endpoint");
        }

        Athlete athlete = athleteRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Athlete not found"));

        List<AthleteBookingDto> bookings = bookingRepository.findByAthleteIdOrderByStartTimeDesc(athlete.getId())
                .stream()
                .map(booking -> new AthleteBookingDto(
                        booking.getId(),
                        booking.getFacility() != null ? booking.getFacility().getName() : null,
                        booking.getFacility() != null && booking.getFacility().getSport() != null
                                ? booking.getFacility().getSport().getName()
                                : null,
                        booking.getStartTime(),
                        booking.getEndTime(),
                        booking.getStatus(),
                        booking.getFacility() != null ? booking.getFacility().getPricePerHour() : null
                ))
                .toList();

        return new AthleteMeResponse(
                athlete.getId(),
                user.getEmail(),
                athlete.getFirstName(),
                athlete.getLastName(),
                athlete.getBirthDate(),
                athlete.getHeight(),
                athlete.getWeight(),
                athlete.getCreatedAt(),
                bookings
        );
    }
}
