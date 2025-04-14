import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

interface AuthResponse {
  token: string;
  expiresAt: string;
  email: string;
  name: string;
  id: string;
  roles: string[];
}

export interface ChangePasswordRequest {
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
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => this.handleAuthResponse(response)),
        catchError(error => {
          console.error('Login error:', error);
          this.snackBar.open(
            error.status === 401 
              ? 'Email ou senha inválidos' 
              : 'Erro ao realizar login. Tente novamente.',
            'Fechar',
            { duration: 5000, panelClass: 'error-snackbar' }
          );
          throw error;
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
    return this.http.post(`${this.apiUrl}/change-password`, data)
      .pipe(
        tap(() => {
          this.snackBar.open('Senha alterada com sucesso', 'Fechar', { duration: 3000 });
        }),
        catchError(error => {
          console.error('Change password error:', error);
          this.snackBar.open(
            error.error?.message || 'Erro ao alterar senha. Tente novamente.',
            'Fechar',
            { duration: 5000, panelClass: 'error-snackbar' }
          );
          throw error;
        })
      );
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
      const expiryDate = new Date(expiresAt);
      const now = new Date();
      
      if (expiryDate > now) {
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
      roles: response.roles || []
    };
    
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.authSubject.next(true);
    this.userSubject.next(user);
  }
}