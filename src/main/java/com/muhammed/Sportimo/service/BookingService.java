package com.muhammed.Sportimo.service;

import com.muhammed.Sportimo.dto.BookingRequest;
import com.muhammed.Sportimo.dto.AvailableSlotDto;
import com.muhammed.Sportimo.dto.CenterBookingDto;
import com.muhammed.Sportimo.dto.FacilityReviewRequest;
import com.muhammed.Sportimo.dto.FacilityReviewResponse;
import com.muhammed.Sportimo.dto.MatchParticipantDto;
import com.muhammed.Sportimo.dto.OpenMatchDto;
import com.muhammed.Sportimo.entity.*;
import com.muhammed.Sportimo.repository.AthleteRepository;
import com.muhammed.Sportimo.repository.BookingRepository;
import com.muhammed.Sportimo.repository.FacilityAvailabilityRepository;
import com.muhammed.Sportimo.repository.FacilityRepository;
import com.muhammed.Sportimo.repository.FacilityReviewRepository;
import com.muhammed.Sportimo.repository.SportsCenterRepository;
import com.muhammed.Sportimo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

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
    private final FacilityReviewRepository facilityReviewRepository;

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

        List<Booking> athleteConflicts = bookingRepository.findAthleteConflictingBookings(
                athlete.getId(),
                request.getStartTime(),
                request.getEndTime()
        );
        if (!athleteConflicts.isEmpty()) {
            throw new RuntimeException("You already have another booking at this time");
        }

        LocalDateTime now = LocalDateTime.now();
        BookingType bookingType = request.getBookingType() == null ? BookingType.CLOSED : request.getBookingType();
        int openSlots = bookingType == BookingType.OPEN_MATCH ? (request.getOpenSlots() == null ? 0 : request.getOpenSlots()) : 0;
        if (bookingType == BookingType.OPEN_MATCH && openSlots < 1) {
            throw new RuntimeException("Open match must have at least 1 available slot");
        }

        Booking booking = Booking.builder()
                .facility(facility)
                .athlete(athlete)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(BookingStatus.PENDING)
                .bookingType(bookingType)
                .openSlots(openSlots)
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
                            booking.getAthlete() != null ? booking.getAthlete().getId() : null,
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

    public FacilityReviewResponse submitFacilityReview(Long bookingId, FacilityReviewRequest request, String email) {
        if (request == null || request.getRating() == null) {
            throw new RuntimeException("Rating is required");
        }
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != Role.ATHLETE) {
            throw new RuntimeException("Only athletes can submit reviews");
        }

        Athlete athlete = athleteRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Athlete not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getAthlete() == null || !booking.getAthlete().getId().equals(athlete.getId())) {
            throw new RuntimeException("You can only review your own bookings");
        }
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new RuntimeException("Only confirmed bookings can be reviewed");
        }
        if (booking.getEndTime() == null || booking.getEndTime().isAfter(LocalDateTime.now())) {
            throw new RuntimeException("You can review only after the booking ends");
        }
        if (facilityReviewRepository.existsByBookingId(bookingId)) {
            throw new RuntimeException("This booking already has a review");
        }

        FacilityReview saved = facilityReviewRepository.save(
                FacilityReview.builder()
                        .booking(booking)
                        .facility(booking.getFacility())
                        .athlete(athlete)
                        .rating(request.getRating())
                        .comment(request.getComment())
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        return new FacilityReviewResponse(
                saved.getId(),
                booking.getId(),
                booking.getFacility() != null ? booking.getFacility().getId() : null,
                saved.getRating(),
                saved.getComment(),
                saved.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<OpenMatchDto> getOpenMatches(String email) {
        Athlete currentAthlete = getCurrentAthlete(email);
        List<BookingStatus> statuses = Arrays.asList(BookingStatus.PENDING, BookingStatus.CONFIRMED);
        LocalDateTime now = LocalDateTime.now();

        return bookingRepository.findByBookingTypeAndStatusInAndStartTimeAfterOrderByStartTimeAsc(
                        BookingType.OPEN_MATCH, statuses, now
                ).stream()
                .filter(booking -> booking.getOpenSlots() != null && booking.getOpenSlots() > 0)
                .filter(booking -> booking.getAthlete() != null && !booking.getAthlete().getId().equals(currentAthlete.getId()))
                .filter(booking -> booking.getOpenSlots() > booking.getJoinedAthletes().size())
                .map(booking -> toOpenMatchDto(booking, currentAthlete.getId()))
                .toList();
    }

    public OpenMatchDto joinOpenMatch(Long bookingId, String email) {
        Athlete athlete = getCurrentAthlete(email);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getBookingType() != BookingType.OPEN_MATCH) {
            throw new RuntimeException("Only open matches can be joined");
        }
        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new RuntimeException("Only active matches can be joined");
        }
        if (booking.getStartTime() == null || !booking.getStartTime().isAfter(LocalDateTime.now())) {
            throw new RuntimeException("Cannot join a match that already started");
        }
        if (booking.getAthlete() != null && booking.getAthlete().getId().equals(athlete.getId())) {
            throw new RuntimeException("You are already the owner of this booking");
        }
        if (booking.getJoinedAthletes().stream().anyMatch(a -> a.getId().equals(athlete.getId()))) {
            throw new RuntimeException("You already joined this match");
        }
        int openSlots = booking.getOpenSlots() == null ? 0 : booking.getOpenSlots();
        if (booking.getJoinedAthletes().size() >= openSlots) {
            throw new RuntimeException("No available slots left");
        }

        List<Booking> athleteConflicts = bookingRepository.findAthleteConflictingBookings(
                athlete.getId(),
                booking.getStartTime(),
                booking.getEndTime()
        );
        if (!athleteConflicts.isEmpty()) {
            throw new RuntimeException("You already have another booking at this time");
        }

        booking.getJoinedAthletes().add(athlete);
        Booking saved = bookingRepository.save(booking);
        return toOpenMatchDto(saved, athlete.getId());
    }

    public void cancelAthleteBooking(Long bookingId, String email) {
        Athlete athlete = getCurrentAthlete(email);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getAthlete() == null || !booking.getAthlete().getId().equals(athlete.getId())) {
            throw new RuntimeException("You can only cancel your own booking");
        }
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new RuntimeException("Only pending bookings can be canceled");
        }

        booking.setStatus(BookingStatus.CANCELED);
        bookingRepository.save(booking);
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

    private Athlete getCurrentAthlete(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != Role.ATHLETE) {
            throw new RuntimeException("Only athletes can access this endpoint");
        }
        return athleteRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Athlete not found"));
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
                booking.getAthlete() != null ? booking.getAthlete().getId() : null,
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

    private OpenMatchDto toOpenMatchDto(Booking booking, Long currentAthleteId) {
        List<MatchParticipantDto> participants = getParticipants(booking);
        int openSlots = booking.getOpenSlots() == null ? 0 : booking.getOpenSlots();
        int currentPlayers = participants.size();
        int availableSlots = Math.max(0, openSlots - booking.getJoinedAthletes().size());
        boolean joinedByCurrentAthlete = booking.getJoinedAthletes().stream()
                .anyMatch(a -> a.getId().equals(currentAthleteId));

        return new OpenMatchDto(
                booking.getId(),
                booking.getFacility() != null ? booking.getFacility().getId() : null,
                booking.getFacility() != null ? booking.getFacility().getName() : null,
                booking.getFacility() != null && booking.getFacility().getSport() != null
                        ? booking.getFacility().getSport().getName()
                        : null,
                booking.getFacility() != null ? booking.getFacility().getSportsCenterName() : null,
                booking.getStartTime(),
                booking.getEndTime(),
                openSlots,
                availableSlots,
                1 + openSlots,
                currentPlayers,
                joinedByCurrentAthlete,
                participants
        );
    }

    private List<MatchParticipantDto> getParticipants(Booking booking) {
        List<MatchParticipantDto> participants = new ArrayList<>();
        if (booking.getAthlete() != null) {
            participants.add(toParticipantDto(booking.getAthlete()));
        }
        participants.addAll(booking.getJoinedAthletes().stream()
                .sorted(Comparator.comparing(a -> safe(a.getFirstName()) + " " + safe(a.getLastName())))
                .map(this::toParticipantDto)
                .toList());
        return participants;
    }

    private MatchParticipantDto toParticipantDto(Athlete athlete) {
        String fullName = (safe(athlete.getFirstName()) + " " + safe(athlete.getLastName())).trim();
        if (fullName.isBlank()) {
            fullName = "Athlete";
        }
        String email = athlete.getUser() != null ? athlete.getUser().getEmail() : null;
        return new MatchParticipantDto(athlete.getId(), fullName, email);
    }
}
