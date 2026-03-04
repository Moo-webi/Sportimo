package com.muhammed.Sportimo.dto;

import com.muhammed.Sportimo.entity.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class AthleteBookingDto {
    private Long id;
    private String facilityName;
    private String sportName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BookingStatus status;
    private Double pricePerHour;
}
