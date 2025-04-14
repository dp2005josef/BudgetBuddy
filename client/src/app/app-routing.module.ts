import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './core/auth/auth.guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoginComponent } from './features/auth/login/login.component';
import { ChangePasswordComponent } from './features/auth/change-password/change-password.component';
import { ClientListComponent } from './features/clients/client-list/client-list.component';
import { ClientDetailComponent } from './features/clients/client-detail/client-detail.component';
import { ClientFormComponent } from './features/clients/client-form/client-form.component';
import { UserListComponent } from './features/users/user-list/user-list.component';
import { UserFormComponent } from './features/users/user-form/user-form.component';
import { AuditLogsComponent } from './features/audit/audit-logs/audit-logs.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'change-password', 
    component: ChangePasswordComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'clients', 
    component: ClientListComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'clients/new', 
    component: ClientFormComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'clients/:id', 
    component: ClientDetailComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'clients/:id/edit', 
    component: ClientFormComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'users', 
    component: UserListComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'users/new', 
    component: UserFormComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'users/:id/edit', 
    component: UserFormComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'audit-logs', 
    component: AuditLogsComponent, 
    canActivate: [AuthGuard] 
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }