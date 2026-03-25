package com.muhammed.Sportimo.service;

import com.muhammed.Sportimo.dto.MessageConversationSummaryDto;
import com.muhammed.Sportimo.dto.MessageConversationTargetDto;
import com.muhammed.Sportimo.dto.MessageDto;
import com.muhammed.Sportimo.dto.MessageRequest;
import com.muhammed.Sportimo.dto.MessageThreadResponse;
import com.muhammed.Sportimo.entity.Athlete;
import com.muhammed.Sportimo.entity.Message;
import com.muhammed.Sportimo.entity.Role;
import com.muhammed.Sportimo.entity.SportsCenter;
import com.muhammed.Sportimo.entity.User;
import com.muhammed.Sportimo.repository.AthleteRepository;
import com.muhammed.Sportimo.repository.MessageRepository;
import com.muhammed.Sportimo.repository.SportsCenterRepository;
import com.muhammed.Sportimo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MessageService {

    private final UserRepository userRepository;
    private final AthleteRepository athleteRepository;
    private final SportsCenterRepository sportsCenterRepository;
    private final MessageRepository messageRepository;

    public List<MessageConversationSummaryDto> getConversations(String email) {
        User currentUser = getCurrentUser(email);
        List<Message> messages = messageRepository.findBySenderIdOrRecipientIdOrderBySentAtDesc(currentUser.getId(), currentUser.getId());
        Map<String, MessageConversationSummaryDto> summaries = new LinkedHashMap<>();

        for (Message message : messages) {
            User counterpart = message.getSender().getId().equals(currentUser.getId())
                    ? message.getRecipient()
                    : message.getSender();

            MessageConversationTargetDto counterpartDto = toTargetDto(counterpart);
            String key = counterpartDto.getType() + ":" + counterpartDto.getProfileId();
            summaries.putIfAbsent(
                    key,
                    new MessageConversationSummaryDto(counterpartDto, message.getContent(), message.getSentAt())
            );
        }

        return new ArrayList<>(summaries.values());
    }

    public MessageThreadResponse getAthleteThread(String email, Long athleteId) {
        User currentUser = getCurrentUser(email);
        Athlete athlete = athleteRepository.findById(athleteId)
                .orElseThrow(() -> new RuntimeException("Athlete not found"));
        return buildThread(currentUser, athlete.getUser());
    }

    public MessageThreadResponse getCenterThread(String email, Long centerId) {
        User currentUser = getCurrentUser(email);
        SportsCenter center = sportsCenterRepository.findById(centerId)
                .orElseThrow(() -> new RuntimeException("Sports center not found"));
        return buildThread(currentUser, center.getUser());
    }

    @Transactional
    public MessageThreadResponse sendToAthlete(String email, Long athleteId, MessageRequest request) {
        User currentUser = getCurrentUser(email);
        Athlete athlete = athleteRepository.findById(athleteId)
                .orElseThrow(() -> new RuntimeException("Athlete not found"));
        return sendMessage(currentUser, athlete.getUser(), request);
    }

    @Transactional
    public MessageThreadResponse sendToCenter(String email, Long centerId, MessageRequest request) {
        User currentUser = getCurrentUser(email);
        SportsCenter center = sportsCenterRepository.findById(centerId)
                .orElseThrow(() -> new RuntimeException("Sports center not found"));
        return sendMessage(currentUser, center.getUser(), request);
    }

    private MessageThreadResponse sendMessage(User sender, User recipient, MessageRequest request) {
        String content = request != null && request.getContent() != null ? request.getContent().trim() : null;
        if (content == null || content.isEmpty()) {
            throw new RuntimeException("Message content is required");
        }
        if (sender.getId().equals(recipient.getId())) {
            throw new RuntimeException("You cannot send a message to yourself");
        }

        messageRepository.save(Message.builder()
                .sender(sender)
                .recipient(recipient)
                .content(content)
                .build());

        return buildThread(sender, recipient);
    }

    private MessageThreadResponse buildThread(User currentUser, User counterpart) {
        return new MessageThreadResponse(
                toTargetDto(counterpart),
                messageRepository.findConversationBetweenUsers(currentUser.getId(), counterpart.getId()).stream()
                        .map(message -> new MessageDto(
                                message.getId(),
                                message.getContent(),
                                message.getSentAt(),
                                message.getSender().getId().equals(currentUser.getId())
                        ))
                        .toList()
        );
    }

    private MessageConversationTargetDto toTargetDto(User user) {
        if (user.getRole() == Role.ATHLETE) {
            Athlete athlete = athleteRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Athlete not found"));
            String name = ((athlete.getFirstName() == null ? "" : athlete.getFirstName()) + " "
                    + (athlete.getLastName() == null ? "" : athlete.getLastName())).trim();
            return new MessageConversationTargetDto(
                    "ATHLETE",
                    athlete.getId(),
                    name.isBlank() ? "Athlete" : name,
                    user.getEmail()
            );
        }

        if (user.getRole() == Role.CENTER) {
            SportsCenter center = sportsCenterRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Sports center not found"));
            return new MessageConversationTargetDto(
                    "CENTER",
                    center.getId(),
                    center.getName() == null || center.getName().isBlank() ? "Sports Center" : center.getName(),
                    center.getAddress()
            );
        }

        throw new RuntimeException("Unsupported user role for messaging");
    }

    private User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
