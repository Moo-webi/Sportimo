package com.muhammed.Sportimo.entity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "facility_id", nullable = false)
    private Facility facility;

    @ManyToOne
    @JoinColumn(name = "athlete_id", nullable = false)
    private Athlete athlete;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;

    @Enumerated(EnumType.STRING)
    private BookingType bookingType = BookingType.CLOSED;

    // Number of extra athletes allowed to join (owner is not counted here)
    private Integer openSlots = 0;

    @ManyToMany
    @JoinTable(
            name = "booking_joined_athletes",
            joinColumns = @JoinColumn(name = "booking_id"),
            inverseJoinColumns = @JoinColumn(name = "athlete_id")
    )
    @JsonIgnore
    private Set<Athlete> joinedAthletes = new HashSet<>();

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime expiresAt;
}
