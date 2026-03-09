package com.muhammed.Sportimo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Formula;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
    private String imageUrl;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "facility_images", joinColumns = @JoinColumn(name = "facility_id"))
    @Column(name = "image_url", length = 1000)
    @OrderColumn(name = "display_order")
    private List<String> imageUrls = new ArrayList<>();
    private Double pricePerHour;
    private Boolean isActive = true;

    @Formula("(select avg(fr.rating) from facility_review fr where fr.facility_id = id)")
    private Double averageRating;

    @Formula("(select count(fr.id) from facility_review fr where fr.facility_id = id)")
    private Long reviewCount;

    @Formula("sports_center_id")
    private Long sportsCenterId;

    @Formula("(select sc.name from sports_center sc where sc.id = sports_center_id)")
    private String sportsCenterName;

    @Formula("(select u.email from _user u inner join sports_center sc on sc.user_id = u.id where sc.id = sports_center_id)")
    private String sportsCenterUsername;

    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "facility")
    @JsonIgnore // Prevents fetching all bookings when getting facilities
    private List<FacilityAvailability> availability;

    @OneToMany(mappedBy = "facility")
    @JsonIgnore // Prevent recursive serialization through bookings -> facility
    private List<Booking> bookings;
}
