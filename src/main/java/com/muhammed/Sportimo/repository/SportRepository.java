package com.muhammed.Sportimo.repository;

import com.muhammed.Sportimo.entity.Sport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SportRepository extends JpaRepository<Sport, Long> {
}
