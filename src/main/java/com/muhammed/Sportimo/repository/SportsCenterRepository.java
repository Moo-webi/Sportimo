package com.muhammed.Sportimo.repository;

import com.muhammed.Sportimo.entity.SportsCenter;
import com.muhammed.Sportimo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SportsCenterRepository extends JpaRepository<SportsCenter, Long> {
    Optional<SportsCenter> findByUser(User user);
}
