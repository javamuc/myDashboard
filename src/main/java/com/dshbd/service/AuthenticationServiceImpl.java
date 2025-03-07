package com.dshbd.service;

import com.dshbd.config.ApplicationProperties;
import com.dshbd.domain.User;
import com.dshbd.repository.UserRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for managing authentication-related operations.
 */
@Service
@Transactional
public class AuthenticationServiceImpl implements AuthenticationService {

    private final Logger log = LoggerFactory.getLogger(AuthenticationServiceImpl.class);

    private final UserRepository userRepository;
    // private final ApplicationProperties applicationProperties;
    private final AccountLockoutProperties accountLockoutProperties;

    public AuthenticationServiceImpl(UserRepository userRepository, AccountLockoutProperties accountLockoutProperties) {
        this.userRepository = userRepository;
        this.accountLockoutProperties = accountLockoutProperties;
    }

    /**
     * Record a failed login attempt for a user.
     *
     * @param login the login of the user
     * @return true if the account is now locked, false otherwise
     */
    @Override
    public boolean recordFailedLoginAttempt(String login) {
        log.debug("Recording failed login attempt for user: {}", login);

        Optional<User> userOptional = userRepository.findOneByLogin(login);
        if (userOptional.isEmpty()) {
            // User not found, nothing to do
            return false;
        }

        User user = userOptional.get();
        int maxFailedAttempts = accountLockoutProperties.getMaxFailedAttempts();

        // Increment failed attempts
        int failedAttempts = user.getFailedAttempts() != null ? user.getFailedAttempts() + 1 : 1;
        user.setFailedAttempts(failedAttempts);

        // Check if account should be locked
        if (failedAttempts >= maxFailedAttempts) {
            int lockDurationMinutes = accountLockoutProperties.getLockDurationMinutes();
            Instant lockTime = Instant.now().plus(lockDurationMinutes, ChronoUnit.MINUTES);
            user.setAccountLockedUntil(lockTime);
            log.warn("User account {} locked until {}", login, lockTime);
            userRepository.save(user);
            return true;
        }

        userRepository.save(user);
        return false;
    }

    /**
     * Check if a user account is locked.
     *
     * @param login the login of the user
     * @return true if the account is locked, false otherwise
     */
    @Override
    public boolean isAccountLocked(String login) {
        log.debug("Checking if account is locked for user: {}", login);

        Optional<User> userOptional = userRepository.findOneByLogin(login);
        if (userOptional.isEmpty()) {
            // User not found, consider not locked
            return false;
        }

        User user = userOptional.get();
        Instant lockedUntil = user.getAccountLockedUntil();

        if (lockedUntil != null && lockedUntil.isAfter(Instant.now())) {
            log.debug("User account {} is locked until {}", login, lockedUntil);
            return true;
        }

        // If the lock has expired, clear the lock and failed attempts
        if (lockedUntil != null) {
            user.setAccountLockedUntil(null);
            user.setFailedAttempts(0);
            userRepository.save(user);
        }

        return false;
    }

    /**
     * Reset failed login attempts for a user after successful login.
     *
     * @param login the login of the user
     */
    @Override
    public void resetFailedLoginAttempts(String login) {
        log.debug("Resetting failed login attempts for user: {}", login);

        Optional<User> userOptional = userRepository.findOneByLogin(login);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setFailedAttempts(0);
            user.setAccountLockedUntil(null);
            userRepository.save(user);
        }
    }
}
