package com.muhammed.Sportimo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MessageConversationTargetDto {
    private String type;
    private Long profileId;
    private String name;
    private String subtitle;
}
