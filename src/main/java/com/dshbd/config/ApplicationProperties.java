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
        private final Authentication authentication = new Authentication();

        public AccountLockout getAccountLockout() {
            return accountLockout;
        }

        public RateLimit getRateLimit() {
            return rateLimit;
        }

        public Authentication getAuthentication() {
            return authentication;
        }

        public static class Authentication {

            private final Jwt jwt = new Jwt();

            public Jwt getJwt() {
                return jwt;
            }

            public static class Jwt {

                private String base64Secret;
                private long tokenValidityInSeconds = 86400; // 24 hours
                private long tokenValidityInSecondsForRememberMe = 2592000; // 30 days

                public String getBase64Secret() {
                    return base64Secret;
                }

                public void setBase64Secret(String base64Secret) {
                    this.base64Secret = base64Secret;
                }

                public long getTokenValidityInSeconds() {
                    return tokenValidityInSeconds;
                }

                public void setTokenValidityInSeconds(long tokenValidityInSeconds) {
                    this.tokenValidityInSeconds = tokenValidityInSeconds;
                }

                public long getTokenValidityInSecondsForRememberMe() {
                    return tokenValidityInSecondsForRememberMe;
                }

                public void setTokenValidityInSecondsForRememberMe(long tokenValidityInSecondsForRememberMe) {
                    this.tokenValidityInSecondsForRememberMe = tokenValidityInSecondsForRememberMe;
                }
            }
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
