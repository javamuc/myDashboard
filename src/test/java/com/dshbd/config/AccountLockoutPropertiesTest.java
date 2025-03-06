package com.dshbd.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.dshbd.service.AccountLockoutSettings;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class AccountLockoutPropertiesTest {

    @Autowired
    private AccountLockoutSettings accountLockoutSettings;

    @Test
    void shouldLoadDefaultProperties() {
        // Default values from application.yml should be loaded
        assertThat(accountLockoutSettings.getMaxFailedAttempts()).isGreaterThan(0);
        assertThat(accountLockoutSettings.getLockDurationMinutes()).isGreaterThan(0);
    }

    @Test
    void shouldSetAndGetProperties() {
        // Arrange
        AccountLockoutProperties properties = new AccountLockoutProperties();

        // Act
        properties.setMaxFailedAttempts(5);
        properties.setLockDurationMinutes(10);

        // Assert
        assertThat(properties.getMaxFailedAttempts()).isEqualTo(5);
        assertThat(properties.getLockDurationMinutes()).isEqualTo(10);
    }
}
