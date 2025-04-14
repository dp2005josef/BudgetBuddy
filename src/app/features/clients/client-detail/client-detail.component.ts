import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/client.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss']
})
export class ClientDetailComponent implements OnInit {
  clientId!: string;
  client: Client | null = null;
  isLoading = true;
  error = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.clientId) {
      this.router.navigate(['/clients']);
      return;
    }
    
    this.loadClient();
  }
  
  loadClient(): void {
    this.isLoading = true;
    this.error = false;
    
    this.clientService.getClient(this.clientId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (client) => {
          this.client = client;
        },
        error: () => {
          this.error = true;
          this.snackBar.open('Erro ao carregar os dados do cliente', 'Fechar', {
            duration: 5000,
            panelClass: 'error-snackbar'
          });
        }
      });
  }
  
  navigateToEdit(): void {
    this.router.navigate(['/clients', this.clientId, 'edit']);
  }
  
  navigateBack(): void {
    this.router.navigate(['/clients']);
  }
  
  executeClient(): void {
    this.clientService.forceExecute(this.clientId).subscribe({
      next: (updatedClient) => {
        this.client = updatedClient;
        this.snackBar.open('Execução do cliente iniciada com sucesso', 'Fechar', {
          duration: 3000
        });
      },
      error: () => {
        this.snackBar.open('Erro ao iniciar execução do cliente', 'Fechar', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }
  
  deleteClient(): void {
    if (!this.client) return;
    
    if (confirm(`Tem certeza que deseja excluir o cliente "${this.client.clientName}"?`)) {
      this.clientService.deleteClient(this.clientId).subscribe({
        next: () => {
          this.snackBar.open('Cliente excluído com sucesso', 'Fechar', {
            duration: 3000
          });
          this.router.navigate(['/clients']);
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
  
  getStatusText(client: Client): string {
    if (!client.isActive) {
      return 'Inativo';
    }
    
    if (!client.lastExecutionTime) {
      return 'Pendente';
    }
    
    const lastExecution = new Date(client.lastExecutionTime);
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    if (lastExecution >= oneDayAgo) {
      return 'Ativo';
    }
    
    return 'Atenção';
  }
  
  refresh(): void {
    this.loadClient();
  }
}