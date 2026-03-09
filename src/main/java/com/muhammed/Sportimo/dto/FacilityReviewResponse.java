package com.muhammed.Sportimo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class FacilityReviewResponse {
    private Long id;
    private Long bookingId;
    private Long facilityId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
