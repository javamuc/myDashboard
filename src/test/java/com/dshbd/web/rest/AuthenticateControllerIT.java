package com.dshbd.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.emptyString;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.dshbd.IntegrationTest;
import com.dshbd.domain.User;
import com.dshbd.repository.UserRepository;
import com.dshbd.service.AccountLockoutSettings;
import com.dshbd.web.rest.vm.LoginVM;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link AuthenticateController} REST controller.
 */
@AutoConfigureMockMvc
@IntegrationTest
class AuthenticateControllerIT {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AccountLockoutSettings accountLockoutSettings;

    private static final String TEST_USER_LOGIN = "test-account-lockout";
    private static final String TEST_USER_PASSWORD = "password";

    @BeforeEach
    void setup() {
        // Reset the user's failed attempts and lock status before each test
        userRepository
            .findOneByLogin(TEST_USER_LOGIN)
            .ifPresent(user -> {
                user.setFailedAttempts(0);
                user.setAccountLockedUntil(null);
                userRepository.save(user);
            });
    }

    @Test
    @Transactional
    void testAuthorize() throws Exception {
        User user = new User();
        user.setLogin("user-jwt-controller");
        user.setEmail("user-jwt-controller@example.com");
        user.setActivated(true);
        user.setPassword(passwordEncoder.encode("test"));

        userRepository.saveAndFlush(user);

        LoginVM login = new LoginVM();
        login.setUsername("user-jwt-controller");
        login.setPassword("test");
        mockMvc
            .perform(post("/api/authenticate").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsBytes(login)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id_token").isString())
            .andExpect(jsonPath("$.id_token").isNotEmpty())
            .andExpect(header().string("Authorization", not(nullValue())))
            .andExpect(header().string("Authorization", not(is(emptyString()))));
    }

    @Test
    @Transactional
    void testAuthorizeWithRememberMe() throws Exception {
        User user = new User();
        user.setLogin("user-jwt-controller-remember-me");
        user.setEmail("user-jwt-controller-remember-me@example.com");
        user.setActivated(true);
        user.setPassword(passwordEncoder.encode("test"));

        userRepository.saveAndFlush(user);

        LoginVM login = new LoginVM();
        login.setUsername("user-jwt-controller-remember-me");
        login.setPassword("test");
        login.setRememberMe(true);
        mockMvc
            .perform(post("/api/authenticate").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsBytes(login)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id_token").isString())
            .andExpect(jsonPath("$.id_token").isNotEmpty())
            .andExpect(header().string("Authorization", not(nullValue())))
            .andExpect(header().string("Authorization", not(is(emptyString()))));
    }

    @Test
    void testAuthorizeFails() throws Exception {
        LoginVM login = new LoginVM();
        login.setUsername("wrong-user");
        login.setPassword("wrong password");
        mockMvc
            .perform(post("/api/authenticate").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsBytes(login)))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.id_token").doesNotExist())
            .andExpect(header().doesNotExist("Authorization"));
    }

    @Test
    @Transactional
    void testAccountLockoutAfterMaxFailedAttempts() throws Exception {
        // Create a test user if it doesn't exist
        if (!userRepository.findOneByLogin(TEST_USER_LOGIN.toLowerCase()).isPresent()) {
            User user = new User();
            user.setLogin(TEST_USER_LOGIN);
            user.setPassword(passwordEncoder.encode(TEST_USER_PASSWORD));
            user.setActivated(true);
            user.setEmail(TEST_USER_LOGIN + "@example.com");
            userRepository.save(user);
        }

        LoginVM login = new LoginVM();
        login.setUsername(TEST_USER_LOGIN);
        login.setPassword("wrong-password");

        // Make failed login attempts up to the maximum allowed
        for (int i = 0; i < accountLockoutSettings.getMaxFailedAttempts(); i++) {
            mockMvc
                .perform(post("/api/authenticate").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsBytes(login)))
                .andExpect(status().isUnauthorized());

            // Check the failed attempts count after each attempt
            Optional<User> userOptional = userRepository.findOneByLogin(TEST_USER_LOGIN.toLowerCase());
            assertThat(userOptional).isPresent();
            User user = userOptional.get();
            assertThat(user.getFailedAttempts()).isEqualTo(i + 1);
        }

        // Verify the account is now locked
        Optional<User> userOptional = userRepository.findOneByLogin(TEST_USER_LOGIN.toLowerCase());
        assertThat(userOptional).isPresent();
        User user = userOptional.get();
        assertThat(user.isAccountLocked()).isTrue();

        // Try to login with correct credentials, should still be locked
        login.setPassword(TEST_USER_PASSWORD);
        mockMvc
            .perform(post("/api/authenticate").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsBytes(login)))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @Transactional
    void testSuccessfulLoginResetsFailedAttempts() throws Exception {
        // Create a test user if it doesn't exist
        if (!userRepository.findOneByLogin(TEST_USER_LOGIN.toLowerCase()).isPresent()) {
            User user = new User();
            user.setLogin(TEST_USER_LOGIN);
            user.setPassword(passwordEncoder.encode(TEST_USER_PASSWORD));
            user.setActivated(true);
            user.setEmail(TEST_USER_LOGIN + "@example.com");
            userRepository.save(user);
        }

        // Set some failed attempts
        User user = userRepository.findOneByLogin(TEST_USER_LOGIN.toLowerCase()).get();
        user.setFailedAttempts(1); // One failed attempt
        userRepository.save(user);

        // Login successfully
        LoginVM login = new LoginVM();
        login.setUsername(TEST_USER_LOGIN);
        login.setPassword(TEST_USER_PASSWORD);

        mockMvc
            .perform(post("/api/authenticate").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsBytes(login)))
            .andExpect(status().isOk());

        // Verify failed attempts are reset
        user = userRepository.findOneByLogin(TEST_USER_LOGIN.toLowerCase()).get();
        assertThat(user.getFailedAttempts()).isEqualTo(0);
        assertThat(user.getAccountLockedUntil()).isNull();
    }

    @Test
    @Transactional
    void testAccountUnlocksAfterLockDuration() throws Exception {
        // Create a test user if it doesn't exist
        if (!userRepository.findOneByLogin(TEST_USER_LOGIN.toLowerCase()).isPresent()) {
            User user = new User();
            user.setLogin(TEST_USER_LOGIN);
            user.setPassword(passwordEncoder.encode(TEST_USER_PASSWORD));
            user.setActivated(true);
            user.setEmail(TEST_USER_LOGIN + "@example.com");
            userRepository.save(user);
        }

        // Lock the account but set it to expire in the past
        User user = userRepository.findOneByLogin(TEST_USER_LOGIN.toLowerCase()).get();
        user.setFailedAttempts(accountLockoutSettings.getMaxFailedAttempts());
        user.setAccountLockedUntil(Instant.now().minusSeconds(60)); // Expired 1 minute ago
        userRepository.save(user);

        // Login should succeed because lock has expired
        LoginVM login = new LoginVM();
        login.setUsername(TEST_USER_LOGIN);
        login.setPassword(TEST_USER_PASSWORD);

        mockMvc
            .perform(post("/api/authenticate").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsBytes(login)))
            .andExpect(status().isOk());

        // Verify failed attempts are reset
        user = userRepository.findOneByLogin(TEST_USER_LOGIN.toLowerCase()).get();
        assertThat(user.getFailedAttempts()).isEqualTo(0);
        assertThat(user.getAccountLockedUntil()).isNull();
    }
}
