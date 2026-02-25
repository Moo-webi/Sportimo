package com.muhammed.Sportimo.repository;

import com.muhammed.Sportimo.entity.Athlete;
import com.muhammed.Sportimo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AthleteRepository extends JpaRepository<Athlete, Long> {
    Optional<Athlete> findByUser(User user);
}