package com.muhammed.Sportimo.dto;

import com.muhammed.Sportimo.entity.BookingType;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Getter @Setter
public class BookingRequest {


    private Long facilityId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private BookingType bookingType;

    private Integer openSlots;
}
