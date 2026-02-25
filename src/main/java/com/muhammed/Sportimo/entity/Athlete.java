package com.muhammed.Sportimo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Athlete {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String firstName;
    private String lastName;
    private LocalDate birthDate;
    private Double height;
    private Double weight;

    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "athlete")
    private List<Booking> bookings;
}