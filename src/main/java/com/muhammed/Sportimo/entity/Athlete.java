package com.muhammed.Sportimo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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

    @Builder.Default
    @ManyToMany
    @JoinTable(
            name = "athlete_friends",
            joinColumns = @JoinColumn(name = "athlete_id"),
            inverseJoinColumns = @JoinColumn(name = "friend_id")
    )
    private Set<Athlete> friends = new HashSet<>();
}
