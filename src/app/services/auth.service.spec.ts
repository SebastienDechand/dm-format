import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment.prod';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('has no token and is logged out by default', () => {
    expect(service.getToken()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('saveToken stores the token in localStorage', () => {
    service.saveToken('abc123');
    expect(localStorage.getItem('token')).toBe('abc123');
    expect(service.getToken()).toBe('abc123');
  });

  it('logout clears the token and pushes false on isLoggedIn$', () => {
    service.saveToken('abc123');

    let latest: boolean | undefined;
    service.isLoggedIn$.subscribe((v) => (latest = v));

    service.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(latest).toBe(false);
  });

  it('login posts credentials, saves the token and pushes true on isLoggedIn$', () => {
    let latest: boolean | undefined;
    service.isLoggedIn$.subscribe((v) => (latest = v));

    service.login({ email: 'a@b.com', password: 'secret' }).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'new-token' });

    expect(service.getToken()).toBe('new-token');
    expect(latest).toBe(true);
  });
});
