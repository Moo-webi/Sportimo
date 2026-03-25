package com.muhammed.Sportimo.service;

import com.muhammed.Sportimo.dto.AthleteBookingDto;
import com.muhammed.Sportimo.dto.AthleteDirectoryItemDto;
import com.muhammed.Sportimo.dto.AthleteFriendDto;
import com.muhammed.Sportimo.dto.AthleteMeResponse;
import com.muhammed.Sportimo.dto.AthleteProfileResponse;
import com.muhammed.Sportimo.dto.AthleteProfileUpdateRequest;
import com.muhammed.Sportimo.dto.FriendRequestDto;
import com.muhammed.Sportimo.dto.MatchParticipantDto;
import com.muhammed.Sportimo.entity.Athlete;
import com.muhammed.Sportimo.entity.Booking;
import com.muhammed.Sportimo.entity.BookingStatus;
import com.muhammed.Sportimo.entity.BookingType;
import com.muhammed.Sportimo.entity.FacilityReview;
import com.muhammed.Sportimo.entity.FriendRequest;
import com.muhammed.Sportimo.entity.FriendRequestStatus;
import com.muhammed.Sportimo.entity.Role;
import com.muhammed.Sportimo.entity.User;
import com.muhammed.Sportimo.repository.AthleteRepository;
import com.muhammed.Sportimo.repository.BookingRepository;
import com.muhammed.Sportimo.repository.FacilityReviewRepository;
import com.muhammed.Sportimo.repository.FriendRequestRepository;
import com.muhammed.Sportimo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
    private final FriendRequestRepository friendRequestRepository;

    public AthleteMeResponse getCurrentAthleteProfile(String email) {
        Athlete athlete = getCurrentAthlete(email);
        User user = athlete.getUser();

        List<Booking> athleteBookings = bookingRepository.findAthleteRelatedBookingsOrderByStartTimeDesc(athlete.getId());
        List<AthleteBookingDto> bookings = toBookingDtos(athlete, athleteBookings);

        return new AthleteMeResponse(
                athlete.getId(),
                user.getEmail(),
                athlete.getFirstName(),
                athlete.getLastName(),
                athlete.getBirthDate(),
                athlete.getHeight(),
                athlete.getWeight(),
                athlete.getCreatedAt(),
                athlete.getFriends().stream()
                        .sorted(Comparator.comparing(this::athleteSortKey))
                        .map(this::toFriendDto)
                        .toList(),
                friendRequestRepository.findByReceiverIdAndStatusOrderBySentAtDesc(athlete.getId(), FriendRequestStatus.PENDING)
                        .stream()
                        .map(this::toFriendRequestDto)
                        .toList(),
                friendRequestRepository.findBySenderIdAndStatusOrderBySentAtDesc(athlete.getId(), FriendRequestStatus.PENDING)
                        .stream()
                        .map(this::toFriendRequestDto)
                        .toList(),
                bookings
        );
    }

    public List<AthleteDirectoryItemDto> getAthleteDirectory(String email) {
        Athlete currentAthlete = getCurrentAthlete(email);
        Map<Long, String> friendshipStatusByAthleteId = buildFriendshipStatusMap(currentAthlete);

        return athleteRepository.findAllExceptIdOrderByName(currentAthlete.getId()).stream()
                .map(athlete -> new AthleteDirectoryItemDto(
                        athlete.getId(),
                        athlete.getFirstName(),
                        athlete.getLastName(),
                        athlete.getUser() != null ? athlete.getUser().getEmail() : null,
                        friendshipStatusByAthleteId.getOrDefault(athlete.getId(), "NONE")
                ))
                .toList();
    }

    public AthleteProfileResponse getAthleteProfile(String email, Long athleteId) {
        Athlete currentAthlete = getCurrentAthlete(email);
        Athlete athlete = athleteRepository.findById(athleteId)
                .orElseThrow(() -> new RuntimeException("Athlete not found"));

        boolean self = currentAthlete.getId().equals(athlete.getId());
        boolean friend = currentAthlete.getFriends().stream().anyMatch(existing -> existing.getId().equals(athlete.getId()));
        List<AthleteBookingDto> matches = toBookingDtos(athlete, bookingRepository.findAthleteRelatedBookingsOrderByStartTimeDesc(athlete.getId()));

        return new AthleteProfileResponse(
                athlete.getId(),
                self && athlete.getUser() != null ? athlete.getUser().getEmail() : null,
                athlete.getFirstName(),
                athlete.getLastName(),
                self ? athlete.getBirthDate() : null,
                self ? athlete.getHeight() : null,
                self ? athlete.getWeight() : null,
                self ? athlete.getCreatedAt() : null,
                self,
                friend,
                self ? "SELF" : buildFriendshipStatusMap(currentAthlete).getOrDefault(athlete.getId(), "NONE"),
                self ? athlete.getFriends().stream()
                        .sorted(Comparator.comparing(this::athleteSortKey))
                        .map(this::toFriendDto)
                        .toList() : List.of(),
                matches
        );
    }

    private List<AthleteBookingDto> toBookingDtos(Athlete athlete, List<Booking> athleteBookings) {
        Map<Long, FacilityReview> reviewByBookingId = facilityReviewRepository
                .findByBookingIdIn(athleteBookings.stream().map(Booking::getId).toList())
                .stream()
                .collect(Collectors.toMap(review -> review.getBooking().getId(), Function.identity()));

        LocalDateTime now = LocalDateTime.now();
        return athleteBookings.stream()
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
    }

    @Transactional
    public AthleteMeResponse updateCurrentAthleteProfile(String email, AthleteProfileUpdateRequest request) {
        Athlete athlete = getCurrentAthlete(email);

        athlete.setFirstName(trimToNull(request.getFirstName()));
        athlete.setLastName(trimToNull(request.getLastName()));
        athlete.setBirthDate(request.getBirthDate());
        athlete.setHeight(request.getHeight());
        athlete.setWeight(request.getWeight());

        athleteRepository.save(athlete);
        return getCurrentAthleteProfile(email);
    }

    @Transactional
    public void sendFriendRequest(String email, Long receiverId) {
        Athlete sender = getCurrentAthlete(email);
        Athlete receiver = athleteRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Athlete not found"));

        if (sender.getId().equals(receiver.getId())) {
            throw new RuntimeException("You cannot send a friend request to yourself");
        }

        if (sender.getFriends().stream().anyMatch(friend -> friend.getId().equals(receiver.getId()))) {
            throw new RuntimeException("You are already friends with this athlete");
        }

        if (friendRequestRepository.findBySenderIdAndReceiverIdAndStatus(sender.getId(), receiver.getId(), FriendRequestStatus.PENDING).isPresent()) {
            throw new RuntimeException("Friend request already sent");
        }

        if (friendRequestRepository.findBySenderIdAndReceiverIdAndStatus(receiver.getId(), sender.getId(), FriendRequestStatus.PENDING).isPresent()) {
            throw new RuntimeException("This athlete already sent you a friend request");
        }

        FriendRequest request = FriendRequest.builder()
                .sender(sender)
                .receiver(receiver)
                .status(FriendRequestStatus.PENDING)
                .build();

        friendRequestRepository.save(request);
    }

    @Transactional
    public void acceptFriendRequest(String email, Long requestId) {
        Athlete receiver = getCurrentAthlete(email);
        FriendRequest request = getPendingRequestForReceiver(receiver, requestId);

        Athlete sender = request.getSender();
        addFriendship(sender, receiver);
        request.setStatus(FriendRequestStatus.ACCEPTED);

        athleteRepository.save(sender);
        athleteRepository.save(receiver);
        friendRequestRepository.save(request);
    }

    @Transactional
    public void declineFriendRequest(String email, Long requestId) {
        Athlete receiver = getCurrentAthlete(email);
        FriendRequest request = getPendingRequestForReceiver(receiver, requestId);
        request.setStatus(FriendRequestStatus.DECLINED);
        friendRequestRepository.save(request);
    }

    private void addFriendship(Athlete left, Athlete right) {
        left.getFriends().add(right);
        right.getFriends().add(left);
    }

    private FriendRequest getPendingRequestForReceiver(Athlete receiver, Long requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));

        if (!request.getReceiver().getId().equals(receiver.getId())) {
            throw new RuntimeException("You can only respond to your own friend requests");
        }

        if (request.getStatus() != FriendRequestStatus.PENDING) {
            throw new RuntimeException("Friend request is no longer pending");
        }

        return request;
    }

    private Map<Long, String> buildFriendshipStatusMap(Athlete athlete) {
        Map<Long, String> statuses = athlete.getFriends().stream()
                .collect(Collectors.toMap(Athlete::getId, ignored -> "FRIENDS"));

        List<FriendRequest> requests = friendRequestRepository.findBySenderIdOrReceiverId(athlete.getId(), athlete.getId());
        for (FriendRequest request : requests) {
            if (request.getStatus() != FriendRequestStatus.PENDING) {
                continue;
            }

            if (request.getSender().getId().equals(athlete.getId())) {
                statuses.putIfAbsent(request.getReceiver().getId(), "REQUEST_SENT");
            } else if (request.getReceiver().getId().equals(athlete.getId())) {
                statuses.putIfAbsent(request.getSender().getId(), "REQUEST_RECEIVED");
            }
        }

        return statuses;
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

    private FriendRequestDto toFriendRequestDto(FriendRequest request) {
        return new FriendRequestDto(
                request.getId(),
                toFriendDto(request.getSender()),
                toFriendDto(request.getReceiver()),
                request.getStatus(),
                request.getSentAt()
        );
    }

    private AthleteFriendDto toFriendDto(Athlete athlete) {
        return new AthleteFriendDto(
                athlete.getId(),
                athlete.getFirstName(),
                athlete.getLastName(),
                athlete.getUser() != null ? athlete.getUser().getEmail() : null
        );
    }

    private String athleteSortKey(Athlete athlete) {
        return (safe(athlete.getFirstName()) + " " + safe(athlete.getLastName()) + " " + safe(athlete.getUser() != null ? athlete.getUser().getEmail() : null))
                .toLowerCase();
    }

    private String safe(String value) {
        return value == null ? "" : value;
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

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
