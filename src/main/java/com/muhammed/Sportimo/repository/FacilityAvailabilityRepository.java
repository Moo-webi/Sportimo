package com.muhammed.Sportimo.repository;

import com.muhammed.Sportimo.entity.FacilityAvailability;
import com.muhammed.Sportimo.entity.DayOfWeek;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FacilityAvailabilityRepository extends JpaRepository<FacilityAvailability, Long> {
    List<FacilityAvailability> findByFacilityIdOrderByDayOfWeekAscStartTimeAsc(Long facilityId);
    List<FacilityAvailability> findByFacilityIdAndDayOfWeekOrderByStartTimeAsc(Long facilityId, DayOfWeek dayOfWeek);
    Optional<FacilityAvailability> findByIdAndFacilityId(Long id, Long facilityId);
    void deleteByFacilityId(Long facilityId);
}
