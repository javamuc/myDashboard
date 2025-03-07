import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { CsrfInterceptor } from './csrf.interceptor';
import { CsrfService } from '../auth/csrf.service';
import { csrfInterceptor } from './csrf.interceptor';

describe('CsrfInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let csrfService: CsrfService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CsrfService, provideHttpClient(withInterceptors([csrfInterceptor])), provideHttpClientTesting()],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    csrfService = TestBed.inject(CsrfService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should not add X-XSRF-TOKEN header for GET requests', () => {
    // Arrange
    jest.spyOn(csrfService, 'getCsrfToken').mockReturnValue('test-token');

    // Act
    httpClient.get('/api/test').subscribe();

    // Assert
    const req = httpTestingController.expectOne('/api/test');
    expect(req.request.headers.has('X-XSRF-TOKEN')).toBe(false);
  });

  it('should add X-XSRF-TOKEN header for POST requests', () => {
    // Arrange
    jest.spyOn(csrfService, 'getCsrfToken').mockReturnValue('test-token');

    // Act
    httpClient.post('/api/test', {}).subscribe();

    // Assert
    const req = httpTestingController.expectOne('/api/test');
    expect(req.request.headers.get('X-XSRF-TOKEN')).toBe('test-token');
  });

  it('should not add X-XSRF-TOKEN header for authentication requests', () => {
    // Arrange
    jest.spyOn(csrfService, 'getCsrfToken').mockReturnValue('test-token');

    // Act
    httpClient.post('/api/authenticate', {}).subscribe();

    // Assert
    const req = httpTestingController.expectOne('/api/authenticate');
    expect(req.request.headers.has('X-XSRF-TOKEN')).toBe(false);
  });

  it('should not add X-XSRF-TOKEN header when token is not available', () => {
    // Arrange
    jest.spyOn(csrfService, 'getCsrfToken').mockReturnValue('');

    // Act
    httpClient.post('/api/test', {}).subscribe();

    // Assert
    const req = httpTestingController.expectOne('/api/test');
    expect(req.request.headers.has('X-XSRF-TOKEN')).toBe(false);
  });
});
