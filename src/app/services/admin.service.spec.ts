import { TestBed } from '@angular/core/testing';
import { AdminService } from './admin.service';
import { AuthService } from './auth.service';
import { BehaviorSubject } from 'rxjs';

describe('AdminService', () => {
  let isLoggedInSubject: BehaviorSubject<boolean>;

  function setup() {
    isLoggedInSubject = new BehaviorSubject<boolean>(false);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: { isLoggedIn$: isLoggedInSubject.asObservable() },
        },
      ],
    });
    return TestBed.inject(AdminService);
  }

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('isAdminMode$ is false when the admin toggle is on but the user is logged out', () => {
    const service = setup();
    service.setAdminMode(true);

    let latest: boolean | undefined;
    service.isAdminMode$.subscribe((v) => (latest = v));

    expect(latest).toBe(false);
  });

  it('isAdminMode$ is false when logged in but the toggle is off', () => {
    const service = setup();
    isLoggedInSubject.next(true);

    let latest: boolean | undefined;
    service.isAdminMode$.subscribe((v) => (latest = v));

    expect(latest).toBe(false);
  });

  it('isAdminMode$ is true only when logged in AND the toggle is on', () => {
    const service = setup();
    isLoggedInSubject.next(true);
    service.setAdminMode(true);

    let latest: boolean | undefined;
    service.isAdminMode$.subscribe((v) => (latest = v));

    expect(latest).toBe(true);
  });

  it('toggleAdminMode flips the current toggle state', () => {
    const service = setup();
    isLoggedInSubject.next(true);

    let latest: boolean | undefined;
    service.isAdminMode$.subscribe((v) => (latest = v));
    expect(latest).toBe(false);

    service.toggleAdminMode();
    expect(latest).toBe(true);

    service.toggleAdminMode();
    expect(latest).toBe(false);
  });
});
