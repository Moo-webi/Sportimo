package com.muhammed.Sportimo.repository;

import com.muhammed.Sportimo.entity.FriendRequest;
import com.muhammed.Sportimo.entity.FriendRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    List<FriendRequest> findByReceiverIdAndStatusOrderBySentAtDesc(Long receiverId, FriendRequestStatus status);

    List<FriendRequest> findBySenderIdAndStatusOrderBySentAtDesc(Long senderId, FriendRequestStatus status);

    Optional<FriendRequest> findBySenderIdAndReceiverId(Long senderId, Long receiverId);

    Optional<FriendRequest> findBySenderIdAndReceiverIdAndStatus(Long senderId, Long receiverId, FriendRequestStatus status);

    List<FriendRequest> findBySenderIdOrReceiverId(Long senderId, Long receiverId);
}
