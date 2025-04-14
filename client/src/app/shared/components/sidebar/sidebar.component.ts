import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';

interface MenuItem {
  name: string;
  route: string;
  icon: string;
  requiresAdmin?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  currentUser$: Observable<User | null>;
  menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      route: '/dashboard',
      icon: 'dashboard'
    },
    {
      name: 'Clientes',
      route: '/clients',
      icon: 'business'
    },
    {
      name: 'Usuários',
      route: '/users',
      icon: 'people',
      requiresAdmin: true
    },
    {
      name: 'Logs de Auditoria',
      route: '/audit',
      icon: 'assessment',
      requiresAdmin: true
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
  }

  checkAdminRole(user: User | null): boolean {
    if (!user) return false;
    return user.roles.includes('Admin') || user.roles.includes('Administrator');
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}