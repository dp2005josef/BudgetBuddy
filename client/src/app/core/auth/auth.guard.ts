import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.isAuthenticated$.pipe(
      take(1),
      map(isAuthenticated => {
        // If authenticated, allow access
        if (isAuthenticated) {
          // Check for admin requirement
          const requiresAdmin = route.data['requiresAdmin'];
          if (requiresAdmin) {
            const user = this.authService.getCurrentUser();
            const isAdmin = user && (user.roles.includes('Admin') || user.roles.includes('Administrator'));
            
            if (isAdmin) {
              return true;
            } else {
              // Redirect to dashboard if admin is required but user is not admin
              return this.router.createUrlTree(['/dashboard']);
            }
          }
          return true;
        }
        
        // If not authenticated, redirect to login with return URL
        return this.router.createUrlTree(['/login'], { 
          queryParams: { returnUrl: state.url }
        });
      })
    );
  }
}