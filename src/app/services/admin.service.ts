import { Injectable, effect, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private adminKey = 'isAdmin';

  readonly isAdmin = signal<boolean>(this.readAdminMode());

  constructor() {
    effect(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.adminKey, JSON.stringify(this.isAdmin()));
      }
    });
  }

  setAdminMode(enabled: boolean): void {
    this.isAdmin.set(enabled);
  }

  toggleAdminMode(): void {
    this.isAdmin.update((current) => !current);
  }

  private readAdminMode(): boolean {
    if (
      typeof window !== 'undefined' &&
      localStorage.getItem(this.adminKey) !== null
    ) {
      return JSON.parse(localStorage.getItem(this.adminKey) || 'false');
    }
    return false;
  }
}
