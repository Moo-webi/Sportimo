package com.muhammed.Sportimo.repository;

import com.muhammed.Sportimo.entity.Athlete;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AthleteRepository extends JpaRepository<Athlete, Long> {}