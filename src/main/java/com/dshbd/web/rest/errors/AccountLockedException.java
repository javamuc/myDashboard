package com.dshbd.web.rest.errors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class AccountLockedException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public AccountLockedException(String message) {
        super(message);
    }
}
