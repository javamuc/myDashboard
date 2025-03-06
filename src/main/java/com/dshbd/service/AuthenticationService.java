package com.dshbd.service;

import com.dshbd.domain.User;
import com.dshbd.repository.UserRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for handling authentication-related operations.
 */
@Service
@Transactional
public class AuthenticationService {

    private final Logger log = LoggerFactory.getLogger(AuthenticationService.class);

    private final UserRepository userRepository;
    private final AccountLockoutSettings accountLockoutSettings;

    public AuthenticationService(UserRepository userRepository, AccountLockoutSettings accountLockoutSettings) {
        this.userRepository = userRepository;
        this.accountLockoutSettings = accountLockoutSettings;
    }

    /**
     * Process a failed login attempt for a user.
     * Increments the failed attempts counter and locks the account if the maximum number of attempts is reached.
     *
     * @param username the username of the user
     */
    public void processFailedLogin(String username) {
        userRepository
            .findOneByLogin(username.toLowerCase())
            .ifPresent(user -> {
                int failedAttempts = user.getFailedAttempts() != null ? user.getFailedAttempts() + 1 : 1;
                user.setFailedAttempts(failedAttempts);

                if (failedAttempts >= accountLockoutSettings.getMaxFailedAttempts()) {
                    Instant lockUntil = Instant.now().plus(accountLockoutSettings.getLockDurationMinutes(), ChronoUnit.MINUTES);
                    user.setAccountLockedUntil(lockUntil);
                    log.warn("User account locked: {} until {}", username, lockUntil);
                }

                userRepository.save(user);
            });
    }

    /**
     * Reset the failed attempts counter for a user after a successful login.
     *
     * @param username the username of the user
     */
    public void resetFailedAttempts(String username) {
        userRepository
            .findOneByLogin(username.toLowerCase())
            .ifPresent(user -> {
                if (user.getFailedAttempts() != null && user.getFailedAttempts() > 0) {
                    user.setFailedAttempts(0);
                    user.setAccountLockedUntil(null);
                    userRepository.save(user);
                }
            });
    }

    /**
     * Check if a user account is locked.
     *
     * @param username the username of the user
     * @return true if the account is locked, false otherwise
     */
    public boolean isAccountLocked(String username) {
        return userRepository.findOneByLogin(username.toLowerCase()).map(User::isAccountLocked).orElse(false);
    }
}
