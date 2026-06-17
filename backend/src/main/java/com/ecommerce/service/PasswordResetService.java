package com.ecommerce.service;

import com.ecommerce.entity.PasswordResetToken;
import com.ecommerce.entity.User;
import com.ecommerce.exception.InvalidTokenException;
import com.ecommerce.repository.PasswordResetTokenRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.util.SecureTokenGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * "Forgot password" flow: issues one-time reset tokens (emailed to the user) and
 * applies a new password when a valid token is presented.
 */
@Service
@Transactional
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final SecureTokenGenerator tokenGenerator;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final RefreshTokenService refreshTokenService;

    @Value("${app.auth.password-reset-expiration:3600000}") // 1 hour in milliseconds
    private long resetExpirationMs;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository tokenRepository,
                                SecureTokenGenerator tokenGenerator,
                                PasswordEncoder passwordEncoder,
                                EmailService emailService,
                                RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.tokenGenerator = tokenGenerator;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.refreshTokenService = refreshTokenService;
    }

    /**
     * Begin a password reset. If the email maps to a user, any outstanding tokens
     * are invalidated and a fresh one is emailed. Always returns silently —
     * callers must not reveal whether the email is registered.
     */
    public void requestReset(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            tokenRepository.invalidateAllForUser(user.getId());
            String rawToken = tokenGenerator.generateToken();
            tokenRepository.save(new PasswordResetToken(
                    user.getId(),
                    tokenGenerator.hash(rawToken),
                    LocalDateTime.now().plusNanos(resetExpirationMs * 1_000_000)));
            emailService.sendPasswordResetEmail(user, rawToken);
        });
    }

    /**
     * Complete a password reset. Validates the token, sets the new password,
     * marks the token used and revokes all of the user's refresh tokens so any
     * stolen sessions are killed.
     *
     * @throws InvalidTokenException if the token is unknown, used or expired.
     */
    public void reset(String rawToken, String newPassword) {
        PasswordResetToken token = tokenRepository.findByTokenHash(tokenGenerator.hash(rawToken))
                .orElseThrow(InvalidTokenException::new);
        if (!token.isActive()) {
            throw new InvalidTokenException();
        }
        User user = userRepository.findById(token.getUserId())
                .orElseThrow(InvalidTokenException::new);

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        token.setUsed(true);
        tokenRepository.save(token);

        refreshTokenService.revokeAllForUser(user.getId());
    }
}
