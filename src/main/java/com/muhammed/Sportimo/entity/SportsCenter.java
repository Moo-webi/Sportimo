package com.muhammed.Sportimo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
public class SportsCenter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String name;
    private String description;
    private String phone;
    private String address;
    private Double latitude;
    private Double longitude;

    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "sportsCenter")
    @JsonIgnoreProperties({"facilities"})
    private List<Facility> facilities;
}
