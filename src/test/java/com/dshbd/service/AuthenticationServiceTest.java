package com.dshbd.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.dshbd.domain.User;
import com.dshbd.repository.UserRepository;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AccountLockoutProperties accountLockup;

    private AuthenticationService authenticationService;

    private User testUser;

    @BeforeEach
    void setUp() {
        authenticationService = new AuthenticationServiceImpl(userRepository, accountLockup);

        testUser = new User();
        testUser.setId(1L);
        testUser.setLogin("test-user");
        testUser.setFailedAttempts(0);
        testUser.setAccountLockedUntil(null);
    }

    @Test
    void shouldIncrementFailedAttemptsOnProcessFailedLogin() {
        // Arrange
        when(userRepository.findOneByLogin(anyString())).thenReturn(Optional.of(testUser));
        when(accountLockup.getMaxFailedAttempts()).thenReturn(3);

        // Act
        authenticationService.recordFailedLoginAttempt("test-user");

        // Assert
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getFailedAttempts()).isEqualTo(1);
        assertThat(savedUser.getAccountLockedUntil()).isNull();
    }

    @Test
    void shouldLockAccountWhenMaxFailedAttemptsReached() {
        // Arrange
        testUser.setFailedAttempts(2); // One attempt away from being locked
        when(accountLockup.getMaxFailedAttempts()).thenReturn(3);
        when(accountLockup.getLockDurationMinutes()).thenReturn(1);
        when(userRepository.findOneByLogin(anyString())).thenReturn(Optional.of(testUser));

        // Act
        authenticationService.recordFailedLoginAttempt("test-user");

        // Assert
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getFailedAttempts()).isEqualTo(3);
        assertThat(savedUser.getAccountLockedUntil()).isNotNull();
        assertThat(savedUser.isAccountLocked()).isTrue();
    }

    @Test
    void shouldResetFailedAttemptsOnSuccessfulLogin() {
        // Arrange
        testUser.setFailedAttempts(2);

        when(userRepository.findOneByLogin(anyString())).thenReturn(Optional.of(testUser));

        // Act
        authenticationService.resetFailedLoginAttempts("test-user");

        // Assert
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getFailedAttempts()).isEqualTo(0);
        assertThat(savedUser.getAccountLockedUntil()).isNull();
    }

    @Test
    void shouldReturnTrueWhenAccountIsLocked() {
        // Arrange
        testUser.setAccountLockedUntil(Instant.now().plusSeconds(60)); // Locked for 1 minute

        when(userRepository.findOneByLogin(anyString())).thenReturn(Optional.of(testUser));

        // Act
        boolean isLocked = authenticationService.isAccountLocked("test-user");

        // Assert
        assertThat(isLocked).isTrue();
    }

    @Test
    void shouldReturnFalseWhenAccountIsNotLocked() {
        // Arrange
        testUser.setAccountLockedUntil(null);

        when(userRepository.findOneByLogin(anyString())).thenReturn(Optional.of(testUser));

        // Act
        boolean isLocked = authenticationService.isAccountLocked("test-user");

        // Assert
        assertThat(isLocked).isFalse();
    }

    @Test
    void shouldReturnFalseWhenAccountLockHasExpired() {
        // Arrange
        testUser.setAccountLockedUntil(Instant.now().minusSeconds(60)); // Expired 1 minute ago

        when(userRepository.findOneByLogin(anyString())).thenReturn(Optional.of(testUser));

        // Act
        boolean isLocked = authenticationService.isAccountLocked("test-user");

        // Assert
        assertThat(isLocked).isFalse();

        // Verify that the lock was cleared and failed attempts reset
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getFailedAttempts()).isEqualTo(0);
        assertThat(savedUser.getAccountLockedUntil()).isNull();
    }

    @Test
    void shouldReturnFalseWhenUserDoesNotExist() {
        // Arrange
        when(userRepository.findOneByLogin(anyString())).thenReturn(Optional.empty());

        // Act
        boolean isLocked = authenticationService.isAccountLocked("non-existent-user");

        // Assert
        assertThat(isLocked).isFalse();
    }

    @Test
    void shouldNotSaveUserWhenUserDoesNotExist() {
        // Arrange
        when(userRepository.findOneByLogin(anyString())).thenReturn(Optional.empty());

        // Act
        authenticationService.recordFailedLoginAttempt("non-existent-user");

        // Assert
        verify(userRepository, never()).save(any(User.class));
    }
}
