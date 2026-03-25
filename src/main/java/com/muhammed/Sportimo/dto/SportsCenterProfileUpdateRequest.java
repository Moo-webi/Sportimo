package com.muhammed.Sportimo.dto;

import lombok.Getter;

@Getter
public class SportsCenterProfileUpdateRequest {
    private String name;
    private String description;
    private String phone;
    private String address;
    private Double latitude;
    private Double longitude;
}
