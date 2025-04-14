import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

interface AuthResponse {
  token: string;
  expiresAt: string;
  email: string;
  name: string;
  id: string;
  roles: string[];
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'user_data';
  private expiresAtKey = 'expires_at';
  private apiUrl = `${environment.apiUrl}/api/Auth`;

  private authSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.authSubject.asObservable();

  private userSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.expiresAtKey);
    this.authSubject.next(false);
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  changePassword(data: ChangePasswordRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, data);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(this.userKey);
    return userJson ? JSON.parse(userJson) : null;
  }

  checkAuthStatus(): void {
    const token = this.getToken();
    const expiresAt = localStorage.getItem(this.expiresAtKey);
    const user = this.getCurrentUser();
    
    if (token && expiresAt && user) {
      const expirationDate = new Date(expiresAt);
      const now = new Date();
      
      if (expirationDate > now) {
        this.authSubject.next(true);
        this.userSubject.next(user);
      } else {
        this.logout();
      }
    } else {
      this.logout();
    }
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.expiresAtKey, response.expiresAt);
    
    const user: User = {
      id: response.id,
      email: response.email,
      name: response.name,
      roles: response.roles,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.authSubject.next(true);
    this.userSubject.next(user);
  }
}

function throwError(arg0: () => any): Observable<AuthResponse> {
  return of();
}