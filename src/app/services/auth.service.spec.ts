import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

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
  });

  it('saveToken stores the token in localStorage', () => {
    service.saveToken('abc123');
    expect(localStorage.getItem('token')).toBe('abc123');
    expect(service.getToken()).toBe('abc123');
  });

  it('logout clears the token and sets isLoggedIn to false', () => {
    service.saveToken('abc123');
    service.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
  });

  it('login posts credentials, saves the token and flips isLoggedIn to true', () => {
    service
      .login({ email: 'a@b.com', password: 'secret' })
      .subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'new-token' });

    expect(service.getToken()).toBe('new-token');
    expect(service.isLoggedIn()).toBe(true);
  });
});
