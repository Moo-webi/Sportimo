package com.muhammed.Sportimo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class OpenMatchDto {
    private Long bookingId;
    private Long facilityId;
    private String facilityName;
    private String sportName;
    private String sportsCenterName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer openSlots;
    private Integer availableSlots;
    private Integer totalPlayers;
    private Integer currentPlayers;
    private boolean joinedByCurrentAthlete;
    private List<MatchParticipantDto> participants;
}
