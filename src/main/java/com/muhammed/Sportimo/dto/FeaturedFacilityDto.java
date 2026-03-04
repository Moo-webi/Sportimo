package com.muhammed.Sportimo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FeaturedFacilityDto {
    private Long id;
    private String name;
    private String description;
    private String sportName;
    private Double pricePerHour;
}
