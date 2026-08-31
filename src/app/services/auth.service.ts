import { Injectable, afterNextRender, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl;

  // Starts false to match SSR (no localStorage server-side); upgraded to
  // the real value after the first render so hydration doesn't mismatch
  // and tear down @if(isLoggedIn()) UI.
  readonly isLoggedIn = signal<boolean>(false);

  constructor() {
    afterNextRender(() => {
      this.isLoggedIn.set(this.hasToken());
    });
  }

  login(credentials: { email: string; password: string }) {
    return this.http
      .post<{ token: string }>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((res) => {
          this.saveToken(res.token);
          this.isLoggedIn.set(true);
        })
      );
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    this.isLoggedIn.set(false);
  }

  saveToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }
}
