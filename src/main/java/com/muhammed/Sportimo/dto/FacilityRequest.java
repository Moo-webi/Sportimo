package com.muhammed.Sportimo.dto;

import lombok.Getter;

public class FacilityRequest {

    @Getter
    private String name;
    @Getter
    private String description;
    @Getter
    private Double pricePerHour;
    @Getter
    private Long sportId;

}