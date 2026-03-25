package com.muhammed.Sportimo.repository;

import com.muhammed.Sportimo.entity.Athlete;
import com.muhammed.Sportimo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AthleteRepository extends JpaRepository<Athlete, Long> {
    Optional<Athlete> findByUser(User user);

    @Query("""
            select a from Athlete a
            join fetch a.user u
            where a.id <> :athleteId
            order by lower(coalesce(a.firstName, '')), lower(coalesce(a.lastName, '')), lower(u.email)
            """)
    List<Athlete> findAllExceptIdOrderByName(Long athleteId);
}
