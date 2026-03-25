package com.muhammed.Sportimo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class MessageDto {
    private Long id;
    private String content;
    private LocalDateTime sentAt;
    private boolean mine;
}
