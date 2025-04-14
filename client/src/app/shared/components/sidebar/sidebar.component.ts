import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  active: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', active: false },
    { label: 'Clients', icon: 'business', route: '/clients', active: false },
    { label: 'Users', icon: 'people', route: '/users', active: false },
    { label: 'Audit Logs', icon: 'receipt_long', route: '/audit-logs', active: false }
  ];
  
  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;
        this.updateActiveState(url);
      });
    
    // Initial active state
    this.updateActiveState(this.router.url);
  }
  
  private updateActiveState(url: string): void {
    this.navItems.forEach(item => {
      // Check if url starts with the route path
      item.active = url === item.route || 
                    (url.startsWith(item.route) && item.route !== '/dashboard');
    });
  }
}
