package com.muhammed.Sportimo.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class FacilityRequest {

    private String name;
    private String description;
    private String imageUrl;
    private List<String> imageUrls;
    private Double pricePerHour;
    private Long sportId;

}
