package com.muhammed.Sportimo.controller;

import com.muhammed.Sportimo.dto.AvailableSlotDto;
import com.muhammed.Sportimo.dto.BookingRequest;
import com.muhammed.Sportimo.dto.CenterBookingDto;
import com.muhammed.Sportimo.dto.FacilityReviewRequest;
import com.muhammed.Sportimo.dto.FacilityReviewResponse;
import com.muhammed.Sportimo.dto.OpenMatchDto;
import com.muhammed.Sportimo.entity.Booking;
import com.muhammed.Sportimo.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/available-slots")
    public ResponseEntity<List<AvailableSlotDto>> getAvailableSlots(
            @RequestParam Long facilityId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(bookingService.getAvailableSlots(facilityId, date));
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @RequestBody BookingRequest request,
            Authentication authentication
    ) {
        Booking booking = bookingService.createBooking(request, authentication.getName());
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/center")
    public ResponseEntity<List<CenterBookingDto>> getCenterBookings(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getCenterBookings(authentication.getName()));
    }

    @PutMapping("/{bookingId}/confirm")
    public ResponseEntity<CenterBookingDto> confirmBooking(
            @PathVariable Long bookingId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(bookingService.confirmCenterBooking(bookingId, authentication.getName()));
    }

    @PostMapping("/{bookingId}/review")
    public ResponseEntity<FacilityReviewResponse> submitReview(
            @PathVariable Long bookingId,
            @RequestBody FacilityReviewRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(bookingService.submitFacilityReview(bookingId, request, authentication.getName()));
    }

    @GetMapping("/open-matches")
    public ResponseEntity<List<OpenMatchDto>> getOpenMatches(Authentication authentication) {
        return ResponseEntity.ok(bookingService.getOpenMatches(authentication.getName()));
    }

    @PostMapping("/{bookingId}/join")
    public ResponseEntity<OpenMatchDto> joinOpenMatch(
            @PathVariable Long bookingId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(bookingService.joinOpenMatch(bookingId, authentication.getName()));
    }

    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<Void> cancelAthleteBooking(
            @PathVariable Long bookingId,
            Authentication authentication
    ) {
        bookingService.cancelAthleteBooking(bookingId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
