import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoginService } from './login.service';

export const loginInterceptor: HttpInterceptorFn = (req, next) => {
  const loginService = inject(LoginService);

  if (req.url.includes('/login') || req.url.includes('/reresh')) {
    return next(req);
  }

  const token = loginService.getToken();

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;
  return next(authReq);
};
