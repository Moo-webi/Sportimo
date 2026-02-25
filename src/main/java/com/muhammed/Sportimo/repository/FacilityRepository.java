package com.muhammed.Sportimo.repository;

import com.muhammed.Sportimo.entity.Facility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FacilityRepository extends JpaRepository<Facility, Long> {

    List<Facility> findBySportName(String sportName);

}