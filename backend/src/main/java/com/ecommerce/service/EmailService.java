package com.ecommerce.service;

import com.ecommerce.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends transactional auth emails (verification + password reset) over the
 * configured SMTP server.
 *
 * <p>Sends are best-effort: a transient SMTP failure is logged but never
 * propagated, so it cannot roll back the surrounding business transaction (e.g.
 * a registration must still succeed even if the welcome email bounces). Links
 * point at the frontend ({@code app.frontend.base-url}), which then calls the
 * corresponding API endpoint with the token.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /** Email a verification link containing the raw token. */
    public void sendVerificationEmail(User user, String rawToken) {
        String link = frontendBaseUrl + "/verify-email?token=" + rawToken;
        String body = "Hi " + user.getName() + ",\n\n"
                + "Welcome to our store! Please confirm your email address by clicking the link below:\n\n"
                + link + "\n\n"
                + "If you did not create this account, you can safely ignore this email.\n";
        send(user.getEmail(), "Verify your email address", body);
    }

    /** Email a password-reset link containing the raw token. */
    public void sendPasswordResetEmail(User user, String rawToken) {
        String link = frontendBaseUrl + "/reset-password?token=" + rawToken;
        String body = "Hi " + user.getName() + ",\n\n"
                + "We received a request to reset your password. Click the link below to choose a new one:\n\n"
                + link + "\n\n"
                + "This link will expire shortly. If you did not request a password reset, "
                + "you can safely ignore this email — your password will not change.\n";
        send(user.getEmail(), "Reset your password", body);
    }

    private void send(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Sent '{}' email to {}", subject, to);
        } catch (MailException ex) {
            // Best-effort: log and continue so the caller's transaction is unaffected.
            log.warn("Failed to send '{}' email to {}: {}", subject, to, ex.getMessage());
        }
    }
}
