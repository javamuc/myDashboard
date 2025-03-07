package com.dshbd.web.rest.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a user account is locked due to too many failed login attempts.
 */
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class AccountLockedException extends RuntimeException {

    private static final long serialVersionUID = 1L;
    private final int lockDurationMinutes;

    public AccountLockedException(String message) {
        super(message);
        this.lockDurationMinutes = 15; // Default lock duration
    }

    public AccountLockedException(String message, int lockDurationMinutes) {
        super(message);
        this.lockDurationMinutes = lockDurationMinutes;
    }

    public int getLockDurationMinutes() {
        return lockDurationMinutes;
    }
}
