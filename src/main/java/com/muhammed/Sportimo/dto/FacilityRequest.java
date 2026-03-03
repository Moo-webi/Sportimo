package com.muhammed.Sportimo.dto;

import lombok.Getter;

@Getter
public class FacilityRequest {

    private String name;
    private String description;
    private Double pricePerHour;
    private Long sportId;

}