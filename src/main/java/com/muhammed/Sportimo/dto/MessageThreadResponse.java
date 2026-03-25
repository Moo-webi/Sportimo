package com.muhammed.Sportimo.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class MessageThreadResponse {
    private MessageConversationTargetDto counterpart;
    private List<MessageDto> messages;
}
