import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private adminKey = 'isAdmin';
  private isAdminSubject = new BehaviorSubject<boolean>(this.isAdminMode());
  isAdminMode$ = this.isAdminSubject.asObservable();

  setAdminMode(enabled: boolean) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.adminKey, JSON.stringify(enabled));
    }
  }

  toggleAdminMode() {
    this.isAdminSubject.next(!this.isAdminSubject.value);
  }

  isAdminMode(): boolean {
    if (
      typeof window !== 'undefined' &&
      localStorage.getItem(this.adminKey) !== null
    ) {
      return JSON.parse(localStorage.getItem(this.adminKey) || 'false');
    }
    return false;
  }
}
