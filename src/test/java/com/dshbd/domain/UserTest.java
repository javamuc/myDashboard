package com.dshbd.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import org.junit.jupiter.api.Test;

class UserTest {

    @Test
    void isAccountLockedShouldReturnTrueWhenAccountLockedUntilIsInFuture() {
        // Arrange
        User user = new User();
        user.setAccountLockedUntil(Instant.now().plusSeconds(60)); // Locked for 1 minute

        // Act & Assert
        assertThat(user.isAccountLocked()).isTrue();
    }

    @Test
    void isAccountLockedShouldReturnFalseWhenAccountLockedUntilIsNull() {
        // Arrange
        User user = new User();
        user.setAccountLockedUntil(null);

        // Act & Assert
        assertThat(user.isAccountLocked()).isFalse();
    }

    @Test
    void isAccountLockedShouldReturnFalseWhenAccountLockedUntilIsInPast() {
        // Arrange
        User user = new User();
        user.setAccountLockedUntil(Instant.now().minusSeconds(60)); // Expired 1 minute ago

        // Act & Assert
        assertThat(user.isAccountLocked()).isFalse();
    }
}
