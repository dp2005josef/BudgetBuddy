import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/client.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  isLoading = true;
  error = false;
  displayedColumns: string[] = ['clientName', 'lastExecutionTime', 'status', 'actions'];
  
  constructor(
    private clientService: ClientService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadClients();
  }
  
  loadClients(): void {
    this.isLoading = true;
    this.error = false;
    
    this.clientService.getClients()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (clients) => {
          this.clients = clients;
        },
        error: () => {
          this.error = true;
          this.snackBar.open('Erro ao carregar lista de clientes', 'Fechar', {
            duration: 5000,
            panelClass: 'error-snackbar'
          });
        }
      });
  }
  
  navigateToDetail(clientId: string): void {
    this.router.navigate(['/clients', clientId]);
  }
  
  navigateToEdit(event: Event, clientId: string): void {
    event.stopPropagation();
    this.router.navigate(['/clients', clientId, 'edit']);
  }
  
  navigateToNew(): void {
    this.router.navigate(['/clients/new']);
  }
  
  executeClient(event: Event, clientId: string): void {
    event.stopPropagation();
    
    this.clientService.forceExecute(clientId).subscribe({
      next: () => {
        this.snackBar.open('Execução do cliente iniciada com sucesso', 'Fechar', {
          duration: 3000
        });
        // Recarregar clientes após um breve delay para atualizar as informações
        setTimeout(() => this.loadClients(), 1000);
      },
      error: () => {
        this.snackBar.open('Erro ao iniciar execução do cliente', 'Fechar', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }
  
  deleteClient(event: Event, client: Client): void {
    event.stopPropagation();
    
    if (confirm(`Tem certeza que deseja excluir o cliente "${client.clientName}"?`)) {
      this.clientService.deleteClient(client.id).subscribe({
        next: () => {
          this.snackBar.open('Cliente excluído com sucesso', 'Fechar', {
            duration: 3000
          });
          this.loadClients();
        },
        error: () => {
          this.snackBar.open('Erro ao excluir cliente', 'Fechar', {
            duration: 5000,
            panelClass: 'error-snackbar'
          });
        }
      });
    }
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
  
  refresh(): void {
    this.loadClients();
  }
}