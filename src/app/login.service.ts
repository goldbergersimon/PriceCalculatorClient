import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { first, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7292/api/login';
  logedIn = signal(false);

  login(
    credentials: { username: string; password: string },
    rememberMe: boolean
  ): Observable<{ accessToken: string; refreshToken: string }> {
    return this.http
      .post<{ accessToken: string; refreshToken: string }>(
        `${this.apiUrl}/login`,
        credentials
      )
      .pipe(
        tap((res) => {
          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem('accessToken', res.accessToken);
          storage.setItem('refreshToken', res.refreshToken);
        }),
        first()
      );
  }

  refreshtoken(): Observable<{ accessToken: string; refreshToken: string }> {
    const accessToken =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');
    const refreshToken =
      localStorage.getItem('refreshToken') ||
      sessionStorage.getItem('refreshToken');

    return this.http.post<{ accessToken: string; refreshToken: string }>(
      `${this.apiUrl}/refresh`,
      { accessToken: accessToken, refreshToken: refreshToken }
    );
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('refreshToken');
  }

  getToken(): string | null {
    return (
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken')
    );
  }

  isLogedIn(): boolean {
    if (
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken')
    ) {
      return true;
    }
    return false;
  }
}
