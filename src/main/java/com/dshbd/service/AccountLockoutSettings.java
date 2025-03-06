package com.dshbd.service;

/**
 * Interface for account lockout settings.
 * This provides an abstraction for the service layer to access configuration properties
 * without violating the layered architecture.
 */
public interface AccountLockoutSettings {
    /**
     * Get the maximum number of failed login attempts allowed before locking an account.
     *
     * @return the maximum number of failed attempts
     */
    int getMaxFailedAttempts();

    /**
     * Get the duration in minutes for which an account remains locked after exceeding
     * the maximum number of failed login attempts.
     *
     * @return the lock duration in minutes
     */
    int getLockDurationMinutes();
}
