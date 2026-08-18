import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private authService = inject(AuthService);
  private adminKey = 'isAdmin';

  private adminToggleSubject = new BehaviorSubject<boolean>(
    this.isAdminToggleOn()
  );

  // Edit UI is only ever shown when the user is actually authenticated.
  // The toggle just lets a logged-in user switch between edit and preview mode.
  isAdminMode$ = combineLatest([
    this.authService.isLoggedIn$,
    this.adminToggleSubject,
  ]).pipe(map(([isLoggedIn, toggle]) => isLoggedIn && toggle));

  setAdminMode(enabled: boolean) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.adminKey, JSON.stringify(enabled));
    }
    this.adminToggleSubject.next(enabled);
  }

  toggleAdminMode() {
    if (typeof window !== 'undefined') {
      const newValue = !this.adminToggleSubject.value;
      this.adminToggleSubject.next(newValue);
      localStorage.setItem(this.adminKey, JSON.stringify(newValue));
    }
  }

  private isAdminToggleOn(): boolean {
    if (
      typeof window !== 'undefined' &&
      localStorage.getItem(this.adminKey) !== null
    ) {
      return JSON.parse(localStorage.getItem(this.adminKey) || 'false');
    }
    return false;
  }
}
