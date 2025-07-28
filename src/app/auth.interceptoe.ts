import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { LoginService } from './login.service';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const loginService = inject(LoginService);
  if (req.url.includes('/refresh')) {
    return next(req);
  }
  const token = loginService.getToken();

  let authReq: HttpRequest<any> = req;

  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return loginService.refreshtoken().pipe(
          switchMap((res) => {
            console.log('token', res.accessToken);
            const storage = localStorage.getItem('accessToken')
              ? localStorage
              : sessionStorage;

            storage.setItem('accessToken', res.accessToken);
            storage.setItem('refreshToken', res.refreshToken);

            const retryReq: HttpRequest<any> = req.clone({
              setHeaders: {
                Authorization: `Bearer ${res.accessToken}`,
              },
            });

            return next(retryReq);
          }),
          catchError(() => {
            loginService.logout();
            loginService.logedIn.set(false);
            return throwError(() => new Error('Session expired'));
          })
        );
      }
      return throwError(() => error);
    })
  );
};
