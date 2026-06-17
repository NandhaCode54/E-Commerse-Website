package com.ecommerce.service;

import com.ecommerce.entity.EmailVerificationToken;
import com.ecommerce.entity.User;
import com.ecommerce.exception.InvalidTokenException;
import com.ecommerce.repository.EmailVerificationTokenRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.util.SecureTokenGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Email-verification flow: issues one-time verification tokens (emailed to the
 * user) and flips {@code emailVerified} when a valid token is presented.
 */
@Service
@Transactional
public class EmailVerificationService {

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository tokenRepository;
    private final SecureTokenGenerator tokenGenerator;
    private final EmailService emailService;

    @Value("${app.auth.email-verification-expiration:86400000}") // 24 hours in milliseconds
    private long verificationExpirationMs;

    public EmailVerificationService(UserRepository userRepository,
                                    EmailVerificationTokenRepository tokenRepository,
                                    SecureTokenGenerator tokenGenerator,
                                    EmailService emailService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.tokenGenerator = tokenGenerator;
        this.emailService = emailService;
    }

    /** Invalidate any outstanding tokens, issue a fresh one and email it to the user. */
    public void sendVerification(User user) {
        tokenRepository.invalidateAllForUser(user.getId());
        String rawToken = tokenGenerator.generateToken();
        tokenRepository.save(new EmailVerificationToken(
                user.getId(),
                tokenGenerator.hash(rawToken),
                LocalDateTime.now().plusNanos(verificationExpirationMs * 1_000_000)));
        emailService.sendVerificationEmail(user, rawToken);
    }

    /**
     * Resend verification for the given email. Silently does nothing if the email
     * is unknown or already verified — callers must not reveal which.
     */
    public void resend(String email) {
        userRepository.findByEmail(email)
                .filter(user -> !user.isEmailVerified())
                .ifPresent(this::sendVerification);
    }

    /**
     * Verify an email-verification token, marking the user verified and the token
     * used.
     *
     * @throws InvalidTokenException if the token is unknown, used or expired.
     */
    public void verify(String rawToken) {
        EmailVerificationToken token = tokenRepository.findByTokenHash(tokenGenerator.hash(rawToken))
                .orElseThrow(InvalidTokenException::new);
        if (!token.isActive()) {
            throw new InvalidTokenException();
        }
        User user = userRepository.findById(token.getUserId())
                .orElseThrow(InvalidTokenException::new);

        user.setEmailVerified(true);
        userRepository.save(user);

        token.setUsed(true);
        tokenRepository.save(token);
    }
}
