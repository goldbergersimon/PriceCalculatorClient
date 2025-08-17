import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  catchError,
  finalize,
  map,
  Observable,
  ReplaySubject,
  tap,
  throwError,
} from 'rxjs';
import { DeviceService } from './device.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private deviceService = inject(DeviceService);
  private apiUrl = 'https://localhost:7292/api/login';

  logedIn = signal(false);
  private isRefreshing: boolean = false;
  isLoggedOut: boolean = false;
  private refreshTokenSubject = new ReplaySubject<string>(1);

  login(
    credentials: { username: string; password: string },
    rememberMe: boolean
  ): Observable<{ accessToken: string; refreshToken: string }> {
    const deviceId = this.deviceService.getDeviceId();
    return this.http
      .post<{ accessToken: string; refreshToken: string }>(
        `${this.apiUrl}/login`,
        { ...credentials, deviceId }
      )
      .pipe(
        tap((res) => {
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem('accessToken', res.accessToken);
          storage.setItem('refreshToken', res.refreshToken);
          this.logedIn.set(true);
        })
      );
  }

  refreshToken(): Observable<string> {
    const accessToken = this.getToken();
    const refreshToken =
      localStorage.getItem('refreshToken') ||
      sessionStorage.getItem('refreshToken');
    const deviceId = this.deviceService.getDeviceId();

    if (!accessToken || !refreshToken || this.isLoggedOut) {
      this.logout();
      return throwError(() => new Error('No valid tokens found'));
    }

    if (this.isRefreshing) {
      return this.refreshTokenSubject.asObservable(); // ✅ also an Observable
    }

    this.isRefreshing = true;

    return this.http
      .post<{ accessToken: string; refreshToken: string }>(
        `${this.apiUrl}/refresh`,
        { accessToken, refreshToken, deviceId } // include deviceId in the request
      )
      .pipe(
        tap((res) => {
          const storage = localStorage.getItem('accessToken')
            ? localStorage
            : sessionStorage;
          storage.setItem('accessToken', res.accessToken);
          storage.setItem('refreshToken', res.refreshToken);
          this.logedIn.set(true);
          this.refreshTokenSubject.next(res.accessToken);
          this.refreshTokenSubject.complete();
        }),
        catchError((err) => {
          this.logout();
          this.refreshTokenSubject.error(err);
          return throwError(() => err);
        }),
        finalize(() => {
          this.isRefreshing = false;
          this.refreshTokenSubject = new ReplaySubject<string>(1); // reset subject
        }),
        map((res) => res.accessToken) // ✅ make sure final output is a string
      );
  }
  logout() {
    this.isLoggedOut = true;
    this.logedIn.set(false);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return (
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken')
    );
  }

  isLogedIn(): boolean {
    return this.getToken() !== null;
  }
}
