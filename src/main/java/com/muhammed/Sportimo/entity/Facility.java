package com.muhammed.Sportimo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Facility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JsonIgnore // Prevents fetching all bookings when getting facilities
    @JoinColumn(name = "sports_center_id", nullable = false)
    private SportsCenter sportsCenter;

    @ManyToOne
    @JoinColumn(name = "sport_id", nullable = false)
    private Sport sport;

    @Getter
    private String name;
    private String description;
    private Double pricePerHour;
    private Boolean isActive = true;

    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "facility")
    @JsonIgnore // Prevents fetching all bookings when getting facilities
    private List<FacilityAvailability> availability;

    @OneToMany(mappedBy = "facility")
    private List<Booking> bookings;
}