package com.muhammed.Sportimo.service;

import com.muhammed.Sportimo.dto.AthleteBookingDto;
import com.muhammed.Sportimo.dto.AthleteMeResponse;
import com.muhammed.Sportimo.dto.MatchParticipantDto;
import com.muhammed.Sportimo.entity.Athlete;
import com.muhammed.Sportimo.entity.Booking;
import com.muhammed.Sportimo.entity.BookingStatus;
import com.muhammed.Sportimo.entity.FacilityReview;
import com.muhammed.Sportimo.entity.BookingType;
import com.muhammed.Sportimo.entity.Role;
import com.muhammed.Sportimo.entity.User;
import com.muhammed.Sportimo.repository.AthleteRepository;
import com.muhammed.Sportimo.repository.BookingRepository;
import com.muhammed.Sportimo.repository.FacilityReviewRepository;
import com.muhammed.Sportimo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AthleteService {

    private final UserRepository userRepository;
    private final AthleteRepository athleteRepository;
    private final BookingRepository bookingRepository;
    private final FacilityReviewRepository facilityReviewRepository;

    public AthleteMeResponse getCurrentAthleteProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.ATHLETE) {
            throw new RuntimeException("Only athletes can access this endpoint");
        }

        Athlete athlete = athleteRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Athlete not found"));

        List<Booking> athleteBookings = bookingRepository.findAthleteRelatedBookingsOrderByStartTimeDesc(athlete.getId());
        Map<Long, FacilityReview> reviewByBookingId = facilityReviewRepository
                .findByBookingIdIn(athleteBookings.stream().map(Booking::getId).toList())
                .stream()
                .collect(Collectors.toMap(review -> review.getBooking().getId(), Function.identity()));

        LocalDateTime now = LocalDateTime.now();
        List<AthleteBookingDto> bookings = athleteBookings.stream()
                .map(booking -> {
                    boolean isOwner = booking.getAthlete() != null && booking.getAthlete().getId().equals(athlete.getId());
                    boolean hasReview = isOwner && reviewByBookingId.containsKey(booking.getId());
                    return new AthleteBookingDto(
                            booking.getId(),
                            booking.getFacility() != null ? booking.getFacility().getId() : null,
                            booking.getFacility() != null ? booking.getFacility().getName() : null,
                            booking.getFacility() != null && booking.getFacility().getSport() != null
                                    ? booking.getFacility().getSport().getName()
                                    : null,
                            booking.getStartTime(),
                            booking.getEndTime(),
                            booking.getStatus(),
                            booking.getBookingType(),
                            booking.getOpenSlots(),
                            booking.getBookingType() == BookingType.OPEN_MATCH
                                    ? Math.max(0, (booking.getOpenSlots() == null ? 0 : booking.getOpenSlots()) - booking.getJoinedAthletes().size())
                                    : 0,
                            isOwner,
                            toParticipants(booking),
                            booking.getFacility() != null ? booking.getFacility().getPricePerHour() : null,
                            isOwner
                                    && booking.getStatus() == BookingStatus.CONFIRMED
                                    && booking.getEndTime() != null
                                    && booking.getEndTime().isBefore(now),
                            hasReview,
                            hasReview ? reviewByBookingId.get(booking.getId()).getRating() : null,
                            hasReview ? reviewByBookingId.get(booking.getId()).getComment() : null
                    );
                })
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

    private List<MatchParticipantDto> toParticipants(Booking booking) {
        List<MatchParticipantDto> participants = new ArrayList<>();
        if (booking.getAthlete() != null) {
            participants.add(toParticipant(booking.getAthlete()));
        }
        participants.addAll(booking.getJoinedAthletes().stream()
                .sorted(Comparator.comparing(a -> safe(a.getFirstName()) + " " + safe(a.getLastName())))
                .map(this::toParticipant)
                .toList());
        return participants;
    }

    private MatchParticipantDto toParticipant(Athlete athlete) {
        String fullName = (safe(athlete.getFirstName()) + " " + safe(athlete.getLastName())).trim();
        if (fullName.isBlank()) {
            fullName = "Athlete";
        }
        String email = athlete.getUser() != null ? athlete.getUser().getEmail() : null;
        return new MatchParticipantDto(athlete.getId(), fullName, email);
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
