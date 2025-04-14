import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { environment } from '@environments/environment';

interface AuthResponse {
  token: string;
  expiresAt: string;
  email: string;
  name: string;
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
  
  private authSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.authSubject.asObservable();
  
  private userSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.userSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}
  
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/api/Auth/login`, { email, password })
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(error => {
          return throwError(() => new Error('Login failed. Please check your credentials and try again.'));
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
    return this.http.post(`${environment.apiUrl}/api/User/change-password`, data);
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      return JSON.parse(userStr) as User;
    }
    return null;
  }
  
  checkAuthStatus(): void {
    const token = this.getToken();
    const expiresAtStr = localStorage.getItem(this.expiresAtKey);
    
    if (token && expiresAtStr) {
      const expiresAt = new Date(expiresAtStr);
      
      if (new Date() < expiresAt) {
        const user = this.getCurrentUser();
        this.userSubject.next(user);
        this.authSubject.next(true);
      } else {
        this.logout();
      }
    }
  }
  
  private handleAuthResponse(response: AuthResponse): void {
    const expiresAt = new Date(response.expiresAt);
    
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.expiresAtKey, response.expiresAt);
    
    const user: User = {
      id: '',  // JWT doesn't provide ID directly
      email: response.email,
      name: response.name,
      roles: [],  // JWT might contain roles but we need to decode it
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    localStorage.setItem(this.userKey, JSON.stringify(user));
    
    this.userSubject.next(user);
    this.authSubject.next(true);
    
    this.router.navigate(['/']);
  }
}
