import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

/**
 * Service for handling CSRF tokens.
 */
@Injectable({ providedIn: 'root' })
export class CsrfService {
  constructor(private http: HttpClient) {}

  /**
   * Get the CSRF token from cookies
   * @returns The CSRF token or empty string if not found
   */
  getCsrfToken(): string {
    return (
      document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1] ?? ''
    );
  }

  /**
   * Add CSRF token to headers
   * @param headers Existing headers or null
   * @returns HttpHeaders with CSRF token
   */
  addCsrfToken(headers?: HttpHeaders): HttpHeaders {
    const token = this.getCsrfToken();
    if (!token) {
      return headers ?? new HttpHeaders();
    }

    const newHeaders = headers ?? new HttpHeaders();
    return newHeaders.set('X-XSRF-TOKEN', token);
  }
}
