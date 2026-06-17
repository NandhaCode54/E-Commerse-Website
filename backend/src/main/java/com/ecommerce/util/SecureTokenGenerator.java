package com.ecommerce.util;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Generates opaque, cryptographically-random tokens (for refresh, password-reset
 * and email-verification flows) and hashes them with SHA-256 for storage.
 *
 * <p>The raw token is handed to the client exactly once; only its hash is
 * persisted, so a database leak does not expose usable tokens. Lookups hash the
 * presented token and compare against the stored hash.
 */
@Component
public class SecureTokenGenerator {

    private static final int TOKEN_BYTES = 32; // 256 bits of entropy
    private final SecureRandom secureRandom = new SecureRandom();
    private final Base64.Encoder urlEncoder = Base64.getUrlEncoder().withoutPadding();

    /** Generate a new URL-safe random token (the raw value to give the client). */
    public String generateToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return urlEncoder.encodeToString(bytes);
    }

    /** SHA-256 hash of a raw token, as lowercase hex (64 chars) — what we store. */
    public String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 is guaranteed by the JLS to be present on every JVM.
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}
