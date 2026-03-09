package com.muhammed.Sportimo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MatchParticipantDto {
    private Long athleteId;
    private String name;
    private String email;
}
