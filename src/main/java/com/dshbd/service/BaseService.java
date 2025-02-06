package com.dshbd.service;

public abstract class BaseService<T1, T2> {

    private final UserService userService;

    public BaseService(UserService userService) {
        this.userService = userService;
    }

    protected Long getUserId() {
        return userService.getUserWithAuthorities().orElseThrow(() -> new IllegalStateException("User could not be found")).getId();
    }
}
