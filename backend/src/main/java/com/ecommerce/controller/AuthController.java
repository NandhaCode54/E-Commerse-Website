package com.ecommerce.controller;

import com.ecommerce.dto.AuthResponseDTO;
import com.ecommerce.dto.ChangePasswordRequestDTO;
import com.ecommerce.dto.ForgotPasswordRequestDTO;
import com.ecommerce.dto.LoginRequestDTO;
import com.ecommerce.dto.RefreshTokenRequestDTO;
import com.ecommerce.dto.RegisterRequestDTO;
import com.ecommerce.dto.ResendVerificationRequestDTO;
import com.ecommerce.dto.ResetPasswordRequestDTO;
import com.ecommerce.dto.UserProfileDTO;
import com.ecommerce.dto.VerifyEmailRequestDTO;
import com.ecommerce.security.CustomUserDetails;
import com.ecommerce.service.EmailVerificationService;
import com.ecommerce.service.PasswordResetService;
import com.ecommerce.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final PasswordResetService passwordResetService;
    private final EmailVerificationService emailVerificationService;

    public AuthController(UserService userService,
                          PasswordResetService passwordResetService,
                          EmailVerificationService emailVerificationService) {
        this.userService = userService;
        this.passwordResetService = passwordResetService;
        this.emailVerificationService = emailVerificationService;
    }

    /** Register a new user. POST /api/auth/register */
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        AuthResponseDTO response = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /** Login. POST /api/auth/login */
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(userService.login(request));
    }

    /** Exchange a refresh token for a new token pair. POST /api/auth/refresh */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponseDTO> refresh(@Valid @RequestBody RefreshTokenRequestDTO request) {
        return ResponseEntity.ok(userService.refresh(request.getRefreshToken()));
    }

    /** Revoke a refresh token. POST /api/auth/logout */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@Valid @RequestBody RefreshTokenRequestDTO request) {
        userService.logout(request.getRefreshToken());
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    /** Current authenticated user's profile. GET /api/auth/me */
    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> me(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(UserProfileDTO.fromEntity(userService.findById(principal.getId())));
    }

    /** Change password for the authenticated user. POST /api/auth/change-password */
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody ChangePasswordRequestDTO request) {
        userService.changePassword(principal.getId(), request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password changed successfully. Please log in again."));
    }

    /**
     * Begin a password reset. Always returns 200 with a generic message so the
     * endpoint cannot be used to probe which emails are registered.
     * POST /api/auth/forgot-password
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
        passwordResetService.requestReset(request.getEmail());
        return ResponseEntity.ok(Map.of("message",
                "If an account exists for that email, a password reset link has been sent."));
    }

    /** Complete a password reset using a token. POST /api/auth/reset-password */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO request) {
        passwordResetService.reset(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Password has been reset. You can now log in."));
    }

    /** Verify an email address using a token. POST /api/auth/verify-email */
    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@Valid @RequestBody VerifyEmailRequestDTO request) {
        emailVerificationService.verify(request.getToken());
        return ResponseEntity.ok(Map.of("message", "Email verified successfully."));
    }

    /**
     * Resend a verification email. Always returns 200 with a generic message so it
     * cannot be used to probe account state. POST /api/auth/resend-verification
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification(
            @Valid @RequestBody ResendVerificationRequestDTO request) {
        emailVerificationService.resend(request.getEmail());
        return ResponseEntity.ok(Map.of("message",
                "If an unverified account exists for that email, a verification link has been sent."));
    }
}
