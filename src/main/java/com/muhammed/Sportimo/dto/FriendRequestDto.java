package com.muhammed.Sportimo.dto;

import com.muhammed.Sportimo.entity.FriendRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class FriendRequestDto {
    private Long id;
    private AthleteFriendDto sender;
    private AthleteFriendDto receiver;
    private FriendRequestStatus status;
    private LocalDateTime sentAt;
}
