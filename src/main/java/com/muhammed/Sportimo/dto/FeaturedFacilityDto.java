package com.muhammed.Sportimo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class FeaturedFacilityDto {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private List<String> imageUrls;
    private String sportName;
    private Double pricePerHour;
    private String sportsCenterName;
}
