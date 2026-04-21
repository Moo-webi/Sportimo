package com.muhammed.Sportimo.repository;

import com.muhammed.Sportimo.entity.FacilityReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FacilityReviewRepository extends JpaRepository<FacilityReview, Long> {
    boolean existsByBookingId(Long bookingId);
    Optional<FacilityReview> findByBookingId(Long bookingId);
    List<FacilityReview> findByBookingIdIn(List<Long> bookingIds);
    List<FacilityReview> findByAthleteId(Long athleteId);
}
