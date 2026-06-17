-- =====================================================================
-- V2: Auth completeness (Phase 2).
-- Adds persistent token stores for the stateful auth flows introduced in
-- Phase 2:
--   * refresh_tokens          - rotating refresh tokens + logout/revocation
--   * password_reset_tokens   - "forgot password" one-time tokens
--   * email_verification_tokens - email-verification one-time tokens
-- Only the SHA-256 hash of each token is stored; the raw value is sent to
-- the user (in the response or by email) and never persisted. Expiry uses
-- DATETIME(6) to match Hibernate's LocalDateTime mapping.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Refresh tokens (rotating; one row per issued token)
-- ---------------------------------------------------------------------
CREATE TABLE refresh_tokens (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    user_id    BIGINT       NOT NULL,
    token_hash VARCHAR(64)  NOT NULL,
    expires_at DATETIME(6)  NOT NULL,
    revoked    BIT(1)       NOT NULL DEFAULT b'0',
    created_at DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_refresh_tokens_hash UNIQUE (token_hash),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id);

-- ---------------------------------------------------------------------
-- Password reset tokens (one-time use)
-- ---------------------------------------------------------------------
CREATE TABLE password_reset_tokens (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    user_id    BIGINT       NOT NULL,
    token_hash VARCHAR(64)  NOT NULL,
    expires_at DATETIME(6)  NOT NULL,
    used       BIT(1)       NOT NULL DEFAULT b'0',
    created_at DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_password_reset_tokens_hash UNIQUE (token_hash),
    CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens (user_id);

-- ---------------------------------------------------------------------
-- Email verification tokens (one-time use)
-- ---------------------------------------------------------------------
CREATE TABLE email_verification_tokens (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    user_id    BIGINT       NOT NULL,
    token_hash VARCHAR(64)  NOT NULL,
    expires_at DATETIME(6)  NOT NULL,
    used       BIT(1)       NOT NULL DEFAULT b'0',
    created_at DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uq_email_verification_tokens_hash UNIQUE (token_hash),
    CONSTRAINT fk_email_verification_tokens_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_email_verification_tokens_user ON email_verification_tokens (user_id);
