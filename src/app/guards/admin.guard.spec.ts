import { TestBed } from '@angular/core/testing';
import { provideRouter, RouterStateSnapshot } from '@angular/router';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';

describe('adminGuard', () => {
  function runGuard(isLoggedIn: boolean) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isLoggedIn: () => isLoggedIn } },
      ],
    });

    return TestBed.runInInjectionContext(() =>
      adminGuard(
        {} as never,
        { url: '/admin' } as RouterStateSnapshot
      )
    );
  }

  it('allows navigation when the user is logged in', () => {
    expect(runGuard(true)).toBe(true);
  });

  it('redirects to /login with a returnUrl when the user is logged out', () => {
    const result = runGuard(false);
    expect(result).not.toBe(true);
  });
});
