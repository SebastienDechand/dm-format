import { Injectable, afterNextRender, effect, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private adminKey = 'isAdmin';

  // Always starts false so the client's first paint matches the
  // server-rendered HTML (SSR never has localStorage). Reading the real
  // persisted value synchronously here would mismatch the SSR output
  // whenever admin mode is on, and Angular hydration would tear down and
  // rebuild every @if(isAdmin()) block instead of reusing the server DOM -
  // visible as a flash on every admin-editable page. Upgrading to the
  // real value after the first render keeps that first paint honest.
  readonly isAdmin = signal<boolean>(false);

  constructor() {
    afterNextRender(() => {
      const stored = localStorage.getItem(this.adminKey);
      if (stored !== null) {
        this.isAdmin.set(JSON.parse(stored));
      }
    });

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
}
