package com.ecommerce.exception;

/**
 * Thrown when a refresh / password-reset / email-verification token is missing,
 * malformed, expired, already used, or revoked. Maps to HTTP 400.
 */
public class InvalidTokenException extends RuntimeException {

    public InvalidTokenException(String message) {
        super(message);
    }

    public InvalidTokenException() {
        super("Invalid or expired token");
    }
}
