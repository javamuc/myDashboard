package com.dshbd.service;

public interface AuthenticationService {
    /**
     * Record a failed login attempt for a user.
     *
     * @param login the login of the user
     * @return true if the account is now locked, false otherwise
     */
    boolean recordFailedLoginAttempt(String login);

    /**
     * Check if a user account is locked.
     *
     * @param login the login of the user
     * @return true if the account is locked, false otherwise
     */
    boolean isAccountLocked(String login);

    /**
     * Reset failed login attempts for a user after successful login.
     *
     * @param login the login of the user
     */
    void resetFailedLoginAttempts(String login);
}
