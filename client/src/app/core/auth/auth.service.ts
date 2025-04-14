import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ChangePasswordRequest, User } from '../models/user.model';

interface AuthResponse {
  token: string;
  expiresAt: string;
  email: string;
  name: string;
  id: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'user_data';
  private expiresAtKey = 'expires_at';
  private apiUrl = `${environment.apiUrl}/api/Auth`;

  // Observable for authentication state
  private authSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.authSubject.asObservable();

  // Observable for current user
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
        tap(response => this.handleAuthResponse(response))
      );
  }

  logout(): void {
    // Clear local storage
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.expiresAtKey);
    
    // Update subjects
    this.authSubject.next(false);
    this.userSubject.next(null);
    
    // Navigate to login
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
      // Check if token is not expired
      const expirationDate = new Date(expiresAt);
      const now = new Date();
      
      if (expirationDate > now) {
        this.authSubject.next(true);
        this.userSubject.next(user);
      } else {
        // Token expired, logout
        this.logout();
      }
    } else {
      this.authSubject.next(false);
      this.userSubject.next(null);
    }
  }

  private handleAuthResponse(response: AuthResponse): void {
    // Save token and expiration
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.expiresAtKey, response.expiresAt);
    
    // Create and save user object
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
    
    // Update subjects
    this.authSubject.next(true);
    this.userSubject.next(user);
  }
}