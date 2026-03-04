package com.muhammed.Sportimo.repository;

import com.muhammed.Sportimo.entity.Facility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FacilityRepository extends JpaRepository<Facility, Long> {

    List<Facility> findBySportName(String sportName);
    List<Facility> findTop3ByOrderByCreatedAtDesc();
    List<Facility> findBySportsCenterId(Long sportsCenterId);
    Optional<Facility> findByIdAndSportsCenterId(Long id, Long sportsCenterId);

}
