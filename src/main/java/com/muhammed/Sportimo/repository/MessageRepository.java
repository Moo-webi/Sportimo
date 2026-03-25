package com.muhammed.Sportimo.repository;

import com.muhammed.Sportimo.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findBySenderIdOrRecipientIdOrderBySentAtDesc(Long senderId, Long recipientId);

    @Query("""
            select m from Message m
            where (m.sender.id = :firstUserId and m.recipient.id = :secondUserId)
               or (m.sender.id = :secondUserId and m.recipient.id = :firstUserId)
            order by m.sentAt asc
            """)
    List<Message> findConversationBetweenUsers(
            @Param("firstUserId") Long firstUserId,
            @Param("secondUserId") Long secondUserId
    );
}
