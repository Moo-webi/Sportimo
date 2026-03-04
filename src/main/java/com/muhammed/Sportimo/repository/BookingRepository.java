package com.muhammed.Sportimo.repository;

import com.muhammed.Sportimo.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    @Query("""
SELECT b FROM Booking b
WHERE b.facility.id = :facilityId
AND b.status IN ('PENDING', 'CONFIRMED')
AND (:start < b.endTime AND :end > b.startTime)
""")
    List<Booking> findConflictingBookings(
            @Param("facilityId") Long facilityId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    long countByStatusInAndStartTimeAfter(List<com.muhammed.Sportimo.entity.BookingStatus> statuses, LocalDateTime startTime);

    List<Booking> findTop3ByStatusInAndStartTimeAfterOrderByStartTimeAsc(
            List<com.muhammed.Sportimo.entity.BookingStatus> statuses,
            LocalDateTime startTime
    );

    long countByFacilityId(Long facilityId);

    List<Booking> findByFacilityIdAndStatusInAndStartTimeLessThanAndEndTimeGreaterThanOrderByStartTimeAsc(
            Long facilityId,
            List<com.muhammed.Sportimo.entity.BookingStatus> statuses,
            LocalDateTime dayEnd,
            LocalDateTime dayStart
    );

    List<Booking> findByAthleteIdOrderByStartTimeDesc(Long athleteId);

    List<Booking> findByFacilitySportsCenterIdOrderByStartTimeDesc(Long sportsCenterId);

    Optional<Booking> findByIdAndFacilitySportsCenterId(Long id, Long sportsCenterId);
}
