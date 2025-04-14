import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClientService } from '@core/services/client.service';
import { AuditService } from '@core/services/audit.service';
import { Client } from '@core/models/client.model';
import { AuditLog } from '@core/models/audit.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  clients: Client[] = [];
  recentLogs: AuditLog[] = [];
  isLoading = true;
  dashboardError = false;

  constructor(
    private clientService: ClientService,
    private auditService: AuditService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.dashboardError = false;

    forkJoin({
      clients: this.clientService.getClients().pipe(
        catchError(error => {
          console.error('Error loading clients:', error);
          return of([]);
        })
      ),
      logs: this.auditService.getRecentLogs({ pageSize: 5, pageIndex: 1 }).pipe(
        catchError(error => {
          console.error('Error loading audit logs:', error);
          return of({ items: [], pageIndex: 1, pageSize: 5, totalItemCount: 0 });
        })
      )
    }).subscribe({
      next: (results) => {
        this.clients = results.clients;
        this.recentLogs = results.logs.items;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.dashboardError = true;
        this.snackBar.open('Failed to load dashboard data', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  navigateToClientDetail(clientId: string): void {
    this.router.navigate(['/clients', clientId]);
  }

  navigateToClientList(): void {
    this.router.navigate(['/clients']);
  }

  navigateToAuditLogs(): void {
    this.router.navigate(['/audit-logs']);
  }

  getClientStatusClass(client: Client): string {
    if (!client.isActive) {
      return 'inactive-status';
    }
    
    // Check if last execution was within the last 24 hours
    if (client.lastExecutionTime) {
      const lastExecution = new Date(client.lastExecutionTime);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastExecution > yesterday) {
        return 'success-status';
      }
    }
    
    return 'warning-status';
  }

  getLevelClass(level: string): string {
    switch (level.toLowerCase()) {
      case 'error':
        return 'error-level';
      case 'warning':
        return 'warning-level';
      case 'information':
        return 'info-level';
      default:
        return '';
    }
  }
}
