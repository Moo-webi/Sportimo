package com.muhammed.Sportimo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UpcomingMatchDto {
    private Long id;
    private String facilityName;
    private String sportName;
    private LocalDateTime startTime;
}
