# Security Recommendations

This document provides recommendations for implementing the missing security features identified in the security checklist.

## 1. CSRF Protection ✅ IMPLEMENTED

**Current Status**: CSRF protection has been implemented in `SecurityConfiguration.java` using `CookieCsrfTokenRepository`.

**Implementation Details**:

1. Enabled CSRF protection in the `SecurityConfiguration.java` file:

```java
.csrf(csrf -> csrf
    .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
    .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
    .ignoringRequestMatchers(
        mvc.pattern("/api/authenticate"),
        mvc.pattern("/api/register"),
        mvc.pattern("/api/activate"),
        mvc.pattern("/api/account/reset-password/init"),
        mvc.pattern("/api/account/reset-password/finish"),
        mvc.pattern("/management/health"),
        mvc.pattern("/management/health/**"),
        mvc.pattern("/management/info"),
        mvc.pattern("/management/prometheus")
    )
)
```

2. Created a CSRF service in the frontend to handle CSRF tokens:

```typescript
@Injectable({ providedIn: 'root' })
export class CsrfService {
  getCsrfToken(): string {
    return (
      document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1] || ''
    );
  }

  addCsrfToken(headers?: HttpHeaders): HttpHeaders {
    const token = this.getCsrfToken();
    if (!token) {
      return headers || new HttpHeaders();
    }

    const newHeaders = headers || new HttpHeaders();
    return newHeaders.set('X-XSRF-TOKEN', token);
  }
}
```

3. Created a CSRF interceptor to automatically add CSRF tokens to HTTP requests:

```typescript
@Injectable()
export class CsrfInterceptor implements HttpInterceptor {
  constructor(private csrfService: CsrfService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip for requests that don't need CSRF protection
    if (this.shouldSkip(request)) {
      return next.handle(request);
    }

    // Clone the request and add the CSRF token
    const token = this.csrfService.getCsrfToken();
    if (token) {
      request = request.clone({
        setHeaders: {
          'X-XSRF-TOKEN': token,
        },
      });
    }

    return next.handle(request);
  }

  private shouldSkip(request: HttpRequest<any>): boolean {
    // Skip for GET, HEAD, OPTIONS, TRACE requests as they are safe
    const safeMethod = /^(GET|HEAD|OPTIONS|TRACE)$/i.test(request.method);
    if (safeMethod) {
      return true;
    }

    // Skip for authentication endpoints
    const skipUrls = [
      '/api/authenticate',
      '/api/register',
      '/api/activate',
      '/api/account/reset-password/init',
      '/api/account/reset-password/finish',
    ];

    return skipUrls.some(url => request.url.includes(url));
  }
}
```

4. Registered the CSRF interceptor in the application:

```typescript
export const httpInterceptorProviders = [
  // Other interceptors...
  {
    provide: HTTP_INTERCEPTORS,
    useClass: CsrfInterceptor,
    multi: true,
  },
];
```

## 2. Account Lockout ✅ IMPLEMENTED

**Current Status**: Account lockout has been implemented with configurable settings for different environments.

**Implementation Details**:

1. Added fields to the `User` entity to track failed login attempts and account lockout:

```java
@Column(name = "failed_attempts")
private Integer failedAttempts = 0;

@Column(name = "account_locked_until")
private Instant accountLockedUntil;

public boolean isAccountLocked() {
  return accountLockedUntil != null && accountLockedUntil.isAfter(Instant.now());
}

```

2. Created a Liquibase migration to add the new columns to the database:

```xml
<changeSet id="20240501000000-1" author="jhipster">
    <addColumn tableName="jhi_user">
        <column name="failed_attempts" type="integer" defaultValue="0">
            <constraints nullable="false"/>
        </column>
        <column name="account_locked_until" type="timestamp"/>
    </addColumn>
</changeSet>
```

3. Created a configuration class for account lockout properties:

```java
@Configuration
@ConfigurationProperties(prefix = "application.security.account-lockout", ignoreUnknownFields = false)
public class AccountLockoutProperties {

  private int maxFailedAttempts = 3;
  private int lockDurationMinutes = 15;
  // Getters and setters
}

```

4. Configured different settings for development and production environments:

```yaml
# application.yml (default)
application:
  security:
    account-lockout:
      max-failed-attempts: 3
      lock-duration-minutes: 15

# application-dev.yml
application:
  security:
    account-lockout:
      max-failed-attempts: 2
      lock-duration-minutes: 1
```

5. Created an authentication service to handle account lockout:

```java
@Service
@Transactional
public class AuthenticationService {

  private final UserRepository userRepository;
  private final AccountLockoutProperties accountLockoutProperties;

  // Constructor

  public void processFailedLogin(String username) {
    userRepository
      .findOneByLogin(username.toLowerCase())
      .ifPresent(user -> {
        int failedAttempts = user.getFailedAttempts() != null ? user.getFailedAttempts() + 1 : 1;
        user.setFailedAttempts(failedAttempts);

        if (failedAttempts >= accountLockoutProperties.getMaxFailedAttempts()) {
          Instant lockUntil = Instant.now().plus(accountLockoutProperties.getLockDurationMinutes(), ChronoUnit.MINUTES);
          user.setAccountLockedUntil(lockUntil);
          log.warn("User account locked: {} until {}", username, lockUntil);
        }

        userRepository.save(user);
      });
  }

  public void resetFailedAttempts(String username) {
    // Reset failed attempts after successful login
  }

  public boolean isAccountLocked(String username) {
    // Check if account is locked
  }
}

```

6. Updated the authentication controller to use the authentication service:

```java
@PostMapping("/authenticate")
public ResponseEntity<JWTToken> authorize(@Valid @RequestBody LoginVM loginVM) {
  // Check if account is locked
  if (authenticationService.isAccountLocked(loginVM.getUsername())) {
    throw new AccountLockedException("Account is locked due to too many failed login attempts");
  }

  try {
    // Authenticate user
    Authentication authentication = authenticationManagerBuilder.getObject().authenticate(authenticationToken);

    // Reset failed attempts on successful login
    authenticationService.resetFailedAttempts(loginVM.getUsername());
    // Generate and return JWT token
  } catch (BadCredentialsException e) {
    // Increment failed attempts
    authenticationService.processFailedLogin(loginVM.getUsername());
    throw e;
  }
}

```

## 3. Rate Limiting

**Current Status**: No evidence of rate limiting implementation.

**Recommendation**:

1. Add the `bucket4j` dependency to `pom.xml`:

```xml
<dependency>
    <groupId>com.github.vladimir-bukhtoyarov</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>7.6.0</version>
</dependency>
<dependency>
    <groupId>com.github.vladimir-bukhtoyarov</groupId>
    <artifactId>bucket4j-jcache</artifactId>
    <version>7.6.0</version>
</dependency>
```

2. Create a rate limiting configuration:

```java
@Configuration
public class RateLimitingConfiguration {

  @Bean
  public CacheManager cacheManager() {
    CachingProvider provider = Caching.getCachingProvider();
    CacheManager cacheManager = provider.getCacheManager();

    MutableConfiguration<String, GridBucketState> configuration = new MutableConfiguration<String, GridBucketState>()
      .setTypes(String.class, GridBucketState.class)
      .setExpiryPolicyFactory(CreatedExpiryPolicy.factoryOf(Duration.ONE_HOUR));

    cacheManager.createCache("rate-limit-cache", configuration);
    return cacheManager;
  }

  @Bean
  public ProxyManager<String> proxyManager(CacheManager cacheManager) {
    return new JCacheProxyManager<>(cacheManager.getCache("rate-limit-cache"));
  }
}

```

3. Create a rate limiting filter:

```java
@Component
public class RateLimitingFilter extends OncePerRequestFilter {

  private final ProxyManager<String> proxyManager;

  public RateLimitingFilter(ProxyManager<String> proxyManager) {
    this.proxyManager = proxyManager;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
    throws ServletException, IOException {
    String clientIp = request.getRemoteAddr();
    Bucket bucket = proxyManager
      .builder()
      .build(clientIp, key -> {
        // Allow 20 requests per minute
        return Bucket4j.builder().addLimit(Bandwidth.classic(20, Refill.intervally(20, Duration.ofMinutes(1)))).build();
      });

    ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
    if (probe.isConsumed()) {
      response.addHeader("X-Rate-Limit-Remaining", String.valueOf(probe.getRemainingTokens()));
      filterChain.doFilter(request, response);
    } else {
      response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
      response.addHeader(
        "X-Rate-Limit-Retry-After-Seconds",
        String.valueOf(TimeUnit.NANOSECONDS.toSeconds(probe.getNanosToWaitForRefill()))
      );
      response.getWriter().write("Too many requests");
    }
  }
}

```

4. Register the filter in the security configuration:

```java
@Configuration
public class SecurityConfiguration {

  private final RateLimitingFilter rateLimitingFilter;

  public SecurityConfiguration(RateLimitingFilter rateLimitingFilter) {
    this.rateLimitingFilter = rateLimitingFilter;
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class); // Existing configuration...

    return http.build();
  }
}

```

## 4. Sensitive Data Encryption

**Current Status**: No evidence of encryption for sensitive data at rest.

**Recommendation**:

1. Add the Jasypt dependency for encryption:

```xml
<dependency>
    <groupId>com.github.ulisesbocchio</groupId>
    <artifactId>jasypt-spring-boot-starter</artifactId>
    <version>3.0.5</version>
</dependency>
```

2. Configure Jasypt in `application.yml`:

```yaml
jasypt:
  encryptor:
    algorithm: PBEWithMD5AndDES
    iv-generator-classname: org.jasypt.iv.NoIvGenerator
    password: ${JASYPT_ENCRYPTOR_PASSWORD:defaultPassword}
```

3. Create a service for encrypting/decrypting sensitive data:

```java
@Service
public class EncryptionService {

  private final StringEncryptor encryptor;

  public EncryptionService(StringEncryptor encryptor) {
    this.encryptor = encryptor;
  }

  public String encrypt(String data) {
    if (data == null) {
      return null;
    }
    return encryptor.encrypt(data);
  }

  public String decrypt(String encryptedData) {
    if (encryptedData == null) {
      return null;
    }
    return encryptor.decrypt(encryptedData);
  }
}

```

4. Use converters for JPA entities with sensitive data:

```java
@Entity
public class SensitiveEntity {

  @Column(name = "sensitive_data")
  @Convert(converter = EncryptedStringConverter.class)
  private String sensitiveData;
  // Getters and setters...
}

@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String> {

  @Autowired
  private EncryptionService encryptionService;

  @Override
  public String convertToDatabaseColumn(String attribute) {
    return encryptionService.encrypt(attribute);
  }

  @Override
  public String convertToEntityAttribute(String dbData) {
    return encryptionService.decrypt(dbData);
  }
}

```

## 5. Security Testing

**Current Status**: Security testing needs to be conducted.

**Recommendation**:

1. Set up OWASP ZAP for automated security scanning:

   - Download and install OWASP ZAP
   - Configure it to scan your application
   - Run regular scans and address findings

2. Implement dependency vulnerability scanning:

```xml
<plugin>
    <groupId>org.owasp</groupId>
    <artifactId>dependency-check-maven</artifactId>
    <version>8.4.0</version>
    <executions>
        <execution>
            <goals>
                <goal>check</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

3. Conduct manual penetration testing:

   - Test authentication and authorization
   - Test for injection vulnerabilities
   - Test for XSS vulnerabilities
   - Test for CSRF vulnerabilities
   - Test for business logic vulnerabilities

4. Implement security unit tests:

```java
@SpringBootTest
public class SecurityTests {

  @Autowired
  private MockMvc mockMvc;

  @Test
  public void testUnauthorizedAccess() throws Exception {
    mockMvc.perform(get("/api/admin/users")).andExpect(status().isUnauthorized());
  }

  @Test
  @WithMockUser(roles = "USER")
  public void testForbiddenAccess() throws Exception {
    mockMvc.perform(get("/api/admin/users")).andExpect(status().isForbidden());
  }

  @Test
  @WithMockUser(roles = "ADMIN")
  public void testAuthorizedAccess() throws Exception {
    mockMvc.perform(get("/api/admin/users")).andExpect(status().isOk());
  }
}

```

## Implementation Priority

1. **High Priority (Implement Before Beta)**

   - ~~CSRF Protection~~ ✅ IMPLEMENTED
   - ~~Account Lockout~~ ✅ IMPLEMENTED
   - Rate Limiting

2. **Medium Priority (Implement During Beta)**

   - Sensitive Data Encryption
   - Security Testing Infrastructure

3. **Low Priority (Implement Before Production)**
   - Advanced Security Testing
   - Security Monitoring and Alerting
