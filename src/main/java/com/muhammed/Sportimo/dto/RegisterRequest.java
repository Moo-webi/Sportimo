package com.muhammed.Sportimo.dto;

import com.muhammed.Sportimo.entity.Role;
import lombok.Data;

import java.time.LocalDate;

@Data
public class RegisterRequest {

    private String email;
    private String password;
    private Role role;

    // Athlete fields
    private String firstName;
    private String lastName;
    private LocalDate birthDate;
    private Double height;
    private Double weight;

    // SportsCenter fields
    private String name;
    private String description;
    private String phone;
    private String address;
    private Double latitude;
    private Double longitude;
}