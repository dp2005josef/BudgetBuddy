import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { ClientService } from '../../core/services/client.service';
import { AuditService } from '../../core/services/audit.service';
import { Client } from '../../core/models/client.model';
import { AuditLog } from '../../core/models/audit.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
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
  ) { }

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
      logs: this.auditService.getRecentLogs({ pageSize: 5, pageIndex: 0 }).pipe(
        catchError(error => {
          console.error('Error loading audit logs:', error);
          return of({ items: [], pageIndex: 0, pageSize: 5, totalItemCount: 0 });
        })
      )
    }).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (data) => {
        this.clients = data.clients;
        this.recentLogs = data.logs.items;
      },
      error: (error) => {
        console.error('Dashboard load error:', error);
        this.dashboardError = true;
        this.snackBar.open('Erro ao carregar os dados do dashboard', 'Fechar', { duration: 5000 });
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
      return 'status-inactive';
    }
    
    if (!client.lastExecutionTime) {
      return 'status-pending';
    }
    
    const now = new Date();
    const lastExecution = new Date(client.lastExecutionTime);
    const daysDifference = Math.floor((now.getTime() - lastExecution.getTime()) / (1000 * 3600 * 24));
    
    if (daysDifference > 1) {
      return 'status-inactive';
    }
    
    return 'status-active';
  }

  getLevelClass(level: string): string {
    switch (level.toLowerCase()) {
      case 'error':
        return 'text-danger';
      case 'warning':
        return 'text-warning';
      case 'information':
        return 'text-info';
      default:
        return '';
    }
  }
}