import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { CsrfService } from './csrf.service';

describe('CsrfService', () => {
  let service: CsrfService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CsrfService],
    });

    service = TestBed.inject(CsrfService);
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('getCsrfToken', () => {
    it('should return empty string when no XSRF-TOKEN cookie is present', () => {
      // Arrange
      document.cookie = ''; // Clear cookies

      // Act
      const token = service.getCsrfToken();

      // Assert
      expect(token).toBe('');
    });

    it('should return token value when XSRF-TOKEN cookie is present', () => {
      // Arrange
      document.cookie = 'XSRF-TOKEN=test-token; path=/';

      // Act
      const token = service.getCsrfToken();

      // Assert
      expect(token).toBe('test-token');

      // Cleanup
      document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    });
  });

  describe('addCsrfToken', () => {
    it('should return original headers when no token is present', () => {
      // Arrange
      document.cookie = ''; // Clear cookies
      const headers = new HttpHeaders().set('Content-Type', 'application/json');

      // Act
      const result = service.addCsrfToken(headers);

      // Assert
      expect(result.get('Content-Type')).toBe('application/json');
      expect(result.get('X-XSRF-TOKEN')).toBeNull();
    });

    it('should add X-XSRF-TOKEN header when token is present', () => {
      // Arrange
      document.cookie = 'XSRF-TOKEN=test-token; path=/';
      const headers = new HttpHeaders().set('Content-Type', 'application/json');

      // Act
      const result = service.addCsrfToken(headers);

      // Assert
      expect(result.get('Content-Type')).toBe('application/json');
      expect(result.get('X-XSRF-TOKEN')).toBe('test-token');

      // Cleanup
      document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    });

    it('should create new headers when none provided', () => {
      // Arrange
      document.cookie = 'XSRF-TOKEN=test-token; path=/';

      // Act
      const result = service.addCsrfToken();

      // Assert
      expect(result.get('X-XSRF-TOKEN')).toBe('test-token');

      // Cleanup
      document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    });
  });
});
