package com.muhammed.Sportimo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AthleteFriendDto {
    private Long athleteId;
    private String firstName;
    private String lastName;
    private String email;
}
