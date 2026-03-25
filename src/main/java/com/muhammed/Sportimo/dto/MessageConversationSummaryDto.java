package com.muhammed.Sportimo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class MessageConversationSummaryDto {
    private MessageConversationTargetDto counterpart;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
}
