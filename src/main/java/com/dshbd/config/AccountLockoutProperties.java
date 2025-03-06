package com.dshbd.config;

import com.dshbd.service.AccountLockoutSettings;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Properties specific to account lockout.
 */
@Configuration
@ConfigurationProperties(prefix = "application.security.account-lockout", ignoreUnknownFields = false)
public class AccountLockoutProperties implements AccountLockoutSettings {

    private int maxFailedAttempts = 3;
    private int lockDurationMinutes = 15;

    @Override
    public int getMaxFailedAttempts() {
        return maxFailedAttempts;
    }

    public void setMaxFailedAttempts(int maxFailedAttempts) {
        this.maxFailedAttempts = maxFailedAttempts;
    }

    @Override
    public int getLockDurationMinutes() {
        return lockDurationMinutes;
    }

    public void setLockDurationMinutes(int lockDurationMinutes) {
        this.lockDurationMinutes = lockDurationMinutes;
    }
}
