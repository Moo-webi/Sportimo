package com.muhammed.Sportimo.controller;

import com.muhammed.Sportimo.dto.MessageConversationSummaryDto;
import com.muhammed.Sportimo.dto.MessageRequest;
import com.muhammed.Sportimo.dto.MessageThreadResponse;
import com.muhammed.Sportimo.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/conversations")
    public ResponseEntity<List<MessageConversationSummaryDto>> getConversations(Authentication authentication) {
        return ResponseEntity.ok(messageService.getConversations(authentication.getName()));
    }

    @GetMapping("/athletes/{athleteId}")
    public ResponseEntity<MessageThreadResponse> getAthleteThread(
            @PathVariable Long athleteId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(messageService.getAthleteThread(authentication.getName(), athleteId));
    }

    @GetMapping("/centers/{centerId}")
    public ResponseEntity<MessageThreadResponse> getCenterThread(
            @PathVariable Long centerId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(messageService.getCenterThread(authentication.getName(), centerId));
    }

    @PostMapping("/athletes/{athleteId}")
    public ResponseEntity<MessageThreadResponse> sendToAthlete(
            @PathVariable Long athleteId,
            @RequestBody MessageRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(messageService.sendToAthlete(authentication.getName(), athleteId, request));
    }

    @PostMapping("/centers/{centerId}")
    public ResponseEntity<MessageThreadResponse> sendToCenter(
            @PathVariable Long centerId,
            @RequestBody MessageRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(messageService.sendToCenter(authentication.getName(), centerId, request));
    }
}
