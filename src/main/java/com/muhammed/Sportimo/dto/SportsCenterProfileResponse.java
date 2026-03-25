package com.muhammed.Sportimo.dto;

public record SportsCenterProfileResponse(
        Long id,
        String name,
        String description,
        String phone,
        String address,
        Double latitude,
        Double longitude,
        String googleMapsUrl
) {
}
