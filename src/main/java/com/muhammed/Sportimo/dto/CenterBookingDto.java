package com.muhammed.Sportimo.dto;

import com.muhammed.Sportimo.entity.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class CenterBookingDto {
    private Long id;
    private String facilityName;
    private String sportName;
    private String athleteName;
    private String athleteEmail;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BookingStatus status;
}
