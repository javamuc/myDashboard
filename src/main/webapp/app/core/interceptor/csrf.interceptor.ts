import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CsrfService } from '../auth/csrf.service';

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
