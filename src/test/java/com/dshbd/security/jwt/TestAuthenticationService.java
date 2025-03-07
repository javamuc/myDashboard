package com.dshbd.security.jwt;

import com.dshbd.service.AuthenticationService;

public class TestAuthenticationService implements AuthenticationService {

    @Override
    public boolean recordFailedLoginAttempt(String login) {
        return false;
    }

    @Override
    public boolean isAccountLocked(String login) {
        return false;
    }

    @Override
    public void resetFailedLoginAttempts(String login) {}
}
