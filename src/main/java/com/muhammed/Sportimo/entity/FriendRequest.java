package com.muhammed.Sportimo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private Athlete sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private Athlete receiver;

    @Enumerated(EnumType.STRING)
    private FriendRequestStatus status;

    private LocalDateTime sentAt = LocalDateTime.now();
}