package com.muhammed.Sportimo.repository;

import com.muhammed.Sportimo.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

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
}
