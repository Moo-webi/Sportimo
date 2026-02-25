package com.muhammed.Sportimo.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter @Setter
public class BookingRequest {


    private Long facilityId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;
}