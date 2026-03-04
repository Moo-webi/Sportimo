package com.muhammed.Sportimo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class AvailableSlotDto {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
