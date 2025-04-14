import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientService } from '../../core/services/client.service';
import { AuditService } from '../../core/services/audit.service';
import { Client } from '../../core/models/client.model';
import { AuditLog } from '../../core/models/audit.model';
import { forkJoin } from 'rxjs';

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
  clientExecuteInProgress = false;
  clientBeingExecuted: string | null = null;
  
  // Client statistics
  totalClients = 0;
  activeClients = 0;
  inactiveClients = 0;
  clientsWithErrors = 0;
  
  // Date filters
  today = new Date();
  
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
    
    // Get clients and recent logs
    forkJoin({
      clients: this.clientService.getClients(),
      recentLogs: this.auditService.getRecentLogs({ pageIndex: 0, pageSize: 5 })
    }).subscribe({
      next: (results) => {
        this.clients = results.clients;
        this.recentLogs = results.recentLogs.items;
        
        // Calculate statistics
        this.totalClients = this.clients.length;
        this.activeClients = this.clients.filter(c => c.isActive).length;
        this.inactiveClients = this.totalClients - this.activeClients;
        this.clientsWithErrors = this.clients.filter(c => {
          const lastDay = new Date();
          lastDay.setDate(lastDay.getDate() - 1);
          return c.lastExecutionTime && new Date(c.lastExecutionTime) < lastDay;
        }).length;
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
        this.dashboardError = true;
        this.snackBar.open('Erro ao carregar dados do dashboard.', 'Fechar', {
          duration: 5000
        });
      }
    });
  }
  
  executeClient(clientId: string): void {
    if (this.clientExecuteInProgress) return;
    
    this.clientExecuteInProgress = true;
    this.clientBeingExecuted = clientId;
    
    this.clientService.forceExecute(clientId).subscribe({
      next: (response) => {
        this.clientExecuteInProgress = false;
        this.clientBeingExecuted = null;
        this.snackBar.open('Execução iniciada com sucesso!', 'Fechar', {
          duration: 3000
        });
        // Reload data to show updated execution time
        this.loadDashboardData();
      },
      error: (error) => {
        this.clientExecuteInProgress = false;
        this.clientBeingExecuted = null;
        this.snackBar.open('Erro ao iniciar execução.', 'Fechar', {
          duration: 5000
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
    this.router.navigate(['/audit']);
  }
  
  getClientStatusClass(client: Client): string {
    if (!client.isActive) return 'status-inactive';
    
    if (!client.lastExecutionTime) return 'status-pending';
    
    const lastExecution = new Date(client.lastExecutionTime);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    if (lastExecution < oneDayAgo) {
      return 'status-error';
    }
    
    return 'status-success';
  }
  
  getLevelClass(level: string): string {
    switch (level.toLowerCase()) {
      case 'error': return 'level-error';
      case 'warning': return 'level-warning';
      case 'information': return 'level-info';
      default: return 'level-default';
    }
  }
  
  refresh(): void {
    this.loadDashboardData();
  }
}