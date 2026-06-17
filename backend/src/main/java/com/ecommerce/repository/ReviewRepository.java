package com.ecommerce.repository;

import com.ecommerce.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByProductIdAndStatus(Long productId, Review.ReviewStatus status, Pageable pageable);

    Page<Review> findByStatus(Review.ReviewStatus status, Pageable pageable);

    Optional<Review> findByProductIdAndUserId(Long productId, Long userId);

    long countByProductIdAndStatus(Long productId, Review.ReviewStatus status);
}
