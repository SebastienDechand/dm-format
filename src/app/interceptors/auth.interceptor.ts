import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

// ApiService (and most other services) never attached the JWT token to
// requests - only image-upload.service.ts did it manually. Every admin
// save across the site was silently sending an unauthenticated request
// and getting rejected by the backend's adminAuth middleware. Centralizing
// this here fixes every call site at once instead of patching each one.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const isApiRequest = req.url.startsWith(environment.apiUrl);
  const token = authService.getToken();

  const authReq =
    isApiRequest && token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      // A 401 from our own API means the token is missing/expired/invalid -
      // the local isLoggedIn state should reflect that reality immediately
      // rather than staying stuck showing an admin UI that can no longer
      // actually save anything.
      if (
        isApiRequest &&
        error instanceof HttpErrorResponse &&
        error.status === 401
      ) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
