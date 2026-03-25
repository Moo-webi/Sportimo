package com.muhammed.Sportimo.dto;

import lombok.Getter;

import java.time.LocalDate;

@Getter
public class AthleteProfileUpdateRequest {
    private String firstName;
    private String lastName;
    private LocalDate birthDate;
    private Double height;
    private Double weight;
}
