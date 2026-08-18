import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const isApiRequest = req.url.startsWith(environment.apiUrl);
  const token = isApiRequest ? authService.getToken() : null;

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (
        isApiRequest &&
        error instanceof HttpErrorResponse &&
        error.status === 401
      ) {
        authService.logout();
        toast.error('Session expirée, veuillez vous reconnecter.');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
