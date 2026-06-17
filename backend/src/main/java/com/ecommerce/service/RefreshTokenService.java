package com.ecommerce.service;

import com.ecommerce.entity.RefreshToken;
import com.ecommerce.exception.InvalidTokenException;
import com.ecommerce.repository.RefreshTokenRepository;
import com.ecommerce.util.SecureTokenGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Issues, validates, rotates and revokes refresh tokens. Refresh tokens are
 * opaque random strings; only their SHA-256 hash is stored.
 */
@Service
@Transactional
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final SecureTokenGenerator tokenGenerator;

    @Value("${jwt.refresh-expiration:604800000}") // 7 days in milliseconds
    private long refreshExpirationMs;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository,
                               SecureTokenGenerator tokenGenerator) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.tokenGenerator = tokenGenerator;
    }

    /** Issue a new refresh token for the user; returns the raw token for the client. */
    public String issue(Long userId) {
        String rawToken = tokenGenerator.generateToken();
        RefreshToken entity = new RefreshToken(
                userId,
                tokenGenerator.hash(rawToken),
                LocalDateTime.now().plusNanos(refreshExpirationMs * 1_000_000));
        refreshTokenRepository.save(entity);
        return rawToken;
    }

    /**
     * Validate a presented refresh token and rotate it: the old token is revoked
     * and a brand-new one is issued. Returns the new raw refresh token.
     *
     * @throws InvalidTokenException if the token is unknown, revoked or expired.
     */
    public Rotation rotate(String rawToken) {
        RefreshToken existing = refreshTokenRepository.findByTokenHash(tokenGenerator.hash(rawToken))
                .orElseThrow(InvalidTokenException::new);
        if (!existing.isActive()) {
            throw new InvalidTokenException();
        }
        existing.setRevoked(true);
        refreshTokenRepository.save(existing);
        String newRaw = issue(existing.getUserId());
        return new Rotation(existing.getUserId(), newRaw);
    }

    /** Revoke a single refresh token (logout). Unknown tokens are ignored (idempotent). */
    public void revoke(String rawToken) {
        refreshTokenRepository.findByTokenHash(tokenGenerator.hash(rawToken))
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }

    /** Revoke every active refresh token for a user (e.g. after a password change). */
    public void revokeAllForUser(Long userId) {
        refreshTokenRepository.revokeAllForUser(userId);
    }

    /** Result of a rotation: the owning user and the freshly issued raw token. */
    public record Rotation(Long userId, String rawToken) {
    }
}
