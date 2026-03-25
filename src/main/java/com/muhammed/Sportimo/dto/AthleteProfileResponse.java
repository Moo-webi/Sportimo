package com.muhammed.Sportimo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class AthleteProfileResponse {
    private Long athleteId;
    private String email;
    private String firstName;
    private String lastName;
    private LocalDate birthDate;
    private Double height;
    private Double weight;
    private LocalDateTime joinedAt;
    private boolean self;
    private boolean friend;
    private String friendshipStatus;
    private List<AthleteFriendDto> friends;
    private List<AthleteBookingDto> matches;
}
