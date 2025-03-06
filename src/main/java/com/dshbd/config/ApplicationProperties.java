package com.dshbd.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Properties specific to My Dashboard.
 * <p>
 * Properties are configured in the {@code application.yml} file.
 * See {@link tech.jhipster.config.JHipsterProperties} for a good example.
 */
@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
public class ApplicationProperties {

    private final Liquibase liquibase = new Liquibase();
    private final Security security = new Security();

    // jhipster-needle-application-properties-property

    public Liquibase getLiquibase() {
        return liquibase;
    }

    public Security getSecurity() {
        return security;
    }

    // jhipster-needle-application-properties-property-getter

    public static class Liquibase {

        private Boolean asyncStart = true;

        public Boolean getAsyncStart() {
            return asyncStart;
        }

        public void setAsyncStart(Boolean asyncStart) {
            this.asyncStart = asyncStart;
        }
    }

    public static class Security {

        private final AccountLockout accountLockout = new AccountLockout();
        private final RateLimit rateLimit = new RateLimit();

        public AccountLockout getAccountLockout() {
            return accountLockout;
        }

        public RateLimit getRateLimit() {
            return rateLimit;
        }

        public static class AccountLockout {

            private int maxFailedAttempts = 3;
            private int lockDurationMinutes = 15;

            public int getMaxFailedAttempts() {
                return maxFailedAttempts;
            }

            public void setMaxFailedAttempts(int maxFailedAttempts) {
                this.maxFailedAttempts = maxFailedAttempts;
            }

            public int getLockDurationMinutes() {
                return lockDurationMinutes;
            }

            public void setLockDurationMinutes(int lockDurationMinutes) {
                this.lockDurationMinutes = lockDurationMinutes;
            }
        }

        public static class RateLimit {

            private boolean enabled = true;
            private int capacity = 20;
            private int refillDurationMinutes = 1;

            public boolean isEnabled() {
                return enabled;
            }

            public void setEnabled(boolean enabled) {
                this.enabled = enabled;
            }

            public int getCapacity() {
                return capacity;
            }

            public void setCapacity(int capacity) {
                this.capacity = capacity;
            }

            public int getRefillDurationMinutes() {
                return refillDurationMinutes;
            }

            public void setRefillDurationMinutes(int refillDurationMinutes) {
                this.refillDurationMinutes = refillDurationMinutes;
            }
        }
    }
    // jhipster-needle-application-properties-property-class
}
