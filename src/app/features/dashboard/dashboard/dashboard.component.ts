import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ClientService } from '../../../core/services/client.service';
import { AuditService } from '../../../core/services/audit.service';
import { Client } from '../../../core/models/client.model';
import { AuditLog } from '../../../core/models/audit.model';

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
  
  // Estatísticas do dashboard
  totalClients = 0;
  activeClients = 0;
  recentExecutions = 0;
  failedExecutions = 0;
  
  // Colunas da tabela de clientes
  displayedColumns: string[] = ['clientName', 'lastExecutionTime', 'status', 'actions'];
  
  // Colunas da tabela de logs
  logColumns: string[] = ['timeStamp', 'level', 'message'];

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
      clients: this.clientService.getClients(),
      logs: this.auditService.getRecentLogs({ pageSize: 5, pageIndex: 0 })
    }).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: ({ clients, logs }) => {
        this.clients = clients;
        this.recentLogs = logs.items;
        
        // Calcular estatísticas
        this.totalClients = clients.length;
        this.activeClients = clients.filter(c => c.isActive).length;
        
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        this.recentExecutions = clients.filter(c => 
          c.lastExecutionTime && new Date(c.lastExecutionTime) >= oneDayAgo
        ).length;
        
        this.failedExecutions = this.recentLogs.filter(log => 
          log.level === 'Error' && log.message.includes('ETL execution failed')
        ).length;
      },
      error: () => {
        this.dashboardError = true;
        this.snackBar.open('Erro ao carregar dados do dashboard', 'Fechar', {
          duration: 5000,
          panelClass: 'error-snackbar'
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

  executeClient(clientId: string, event: Event): void {
    event.stopPropagation();
    
    this.clientService.forceExecute(clientId).subscribe({
      next: () => {
        this.snackBar.open('Execução do cliente iniciada com sucesso', 'Fechar', {
          duration: 3000
        });
        // Recarregar dados após um curto delay
        setTimeout(() => this.loadDashboardData(), 1000);
      },
      error: () => {
        this.snackBar.open('Erro ao iniciar execução do cliente', 'Fechar', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }

  getClientStatusClass(client: Client): string {
    if (!client.isActive) {
      return 'status-inactive';
    }
    
    if (!client.lastExecutionTime) {
      return 'status-pending';
    }
    
    const lastExecution = new Date(client.lastExecutionTime);
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    if (lastExecution >= oneDayAgo) {
      return 'status-success';
    }
    
    return 'status-warning';
  }

  getLevelClass(level: string): string {
    switch (level.toLowerCase()) {
      case 'error':
        return 'level-error';
      case 'warning':
        return 'level-warning';
      case 'information':
        return 'level-info';
      default:
        return '';
    }
  }
  
  refresh(): void {
    this.loadDashboardData();
  }
}