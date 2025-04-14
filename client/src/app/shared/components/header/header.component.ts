import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  currentUser$: Observable<User | null>;
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
  }
  
  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }
  
  onChangePassword(): void {
    this.router.navigate(['/change-password']);
  }

  onLogout(): void {
    this.authService.logout();
  }
}