package com.ecommerce.service;

import com.ecommerce.dto.AuthResponseDTO;
import com.ecommerce.dto.LoginRequestDTO;
import com.ecommerce.dto.RegisterRequestDTO;
import com.ecommerce.entity.User;
import com.ecommerce.exception.EmailAlreadyExistsException;
import com.ecommerce.exception.InvalidCredentialsException;
import com.ecommerce.exception.InvalidTokenException;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final EmailVerificationService emailVerificationService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       RefreshTokenService refreshTokenService,
                       EmailVerificationService emailVerificationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
        this.emailVerificationService = emailVerificationService;
    }

    /**
     * Register a new user. The account is always created as a regular {@code USER}
     * (clients cannot self-assign a role) and starts unverified. A verification
     * email is sent and an access + refresh token pair is issued.
     */
    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists: " + request.getEmail());
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER);
        user.setEnabled(true);
        user.setEmailVerified(false);

        User savedUser = userRepository.save(user);

        // Best-effort verification email (does not block registration on SMTP).
        emailVerificationService.sendVerification(savedUser);

        return buildAuthResponse(savedUser);
    }

    /**
     * Authenticate a user with email + password, rejecting disabled accounts, and
     * issue a fresh access + refresh token pair.
     */
    public AuthResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }
        if (!user.isEnabled()) {
            throw new InvalidCredentialsException("Account is disabled");
        }

        return buildAuthResponse(user);
    }

    /**
     * Exchange a valid refresh token for a new access + refresh token pair
     * (the old refresh token is rotated out / revoked).
     *
     * @throws InvalidTokenException if the token is invalid or the owning account
     *                               no longer exists or is disabled.
     */
    public AuthResponseDTO refresh(String rawRefreshToken) {
        RefreshTokenService.Rotation rotation = refreshTokenService.rotate(rawRefreshToken);

        User user = userRepository.findById(rotation.userId())
                .filter(User::isEnabled)
                .orElseThrow(InvalidTokenException::new);

        String accessToken = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        return new AuthResponseDTO(accessToken, rotation.rawToken(), user.getId(),
                user.getName(), user.getEmail(), user.getRole(), user.isEmailVerified());
    }

    /** Revoke a single refresh token (logout). Idempotent. */
    public void logout(String rawRefreshToken) {
        refreshTokenService.revoke(rawRefreshToken);
    }

    /**
     * Change the authenticated user's password after verifying their current one,
     * then revoke all of their refresh tokens (forcing re-login everywhere else).
     */
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = findById(userId);
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        refreshTokenService.revokeAllForUser(userId);
    }

    /** Find user by ID. */
    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));
    }

    /** Issue access + refresh tokens and assemble the auth response for a user. */
    private AuthResponseDTO buildAuthResponse(User user) {
        String accessToken = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        String refreshToken = refreshTokenService.issue(user.getId());
        return new AuthResponseDTO(accessToken, refreshToken, user.getId(),
                user.getName(), user.getEmail(), user.getRole(), user.isEmailVerified());
    }
}
