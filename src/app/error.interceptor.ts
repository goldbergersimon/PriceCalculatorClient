import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoginService } from './login.service';
import { catchError, switchMap, take, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const loginService = inject(LoginService);

  return next(req).pipe(
    catchError((error) => {
      const isUnauthorized = error.status === 401;
      const isAuthReqest =
        req.url.includes('/login') || req.url.includes('/reresh');
      if (isUnauthorized && !isAuthReqest) {
        return loginService.refreshToken().pipe(
          take(1),
          switchMap((newToken: string) => {
            const authReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
            });
            return next(authReq);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
