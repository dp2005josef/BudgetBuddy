import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/client.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.scss']
})
export class ClientDetailComponent implements OnInit {
  client: Client | null = null;
  isLoading = true;
  error = false;
  isExecuting = false;

  daysOfWeek = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadClient(id);
    } else {
      this.router.navigate(['/clients']);
    }
  }

  loadClient(id: string): void {
    this.isLoading = true;
    this.error = false;

    this.clientService.getClient(id).subscribe({
      next: (client) => {
        this.client = client;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading client:', error);
        this.error = true;
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar detalhes do cliente', 'Fechar', { duration: 5000 });
      }
    });
  }

  editClient(): void {
    if (this.client) {
      this.router.navigate(['/clients', this.client.id, 'edit']);
    }
  }

  confirmDelete(): void {
    if (!this.client) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar exclusão',
        message: `Tem certeza que deseja excluir o cliente "${this.client.clientName}"?`,
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',
        dangerAction: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteClient();
      }
    });
  }

  deleteClient(): void {
    if (!this.client) return;

    this.clientService.deleteClient(this.client.id).subscribe({
      next: () => {
        this.snackBar.open('Cliente excluído com sucesso', 'Fechar', { duration: 5000 });
        this.router.navigate(['/clients']);
      },
      error: (error) => {
        console.error('Error deleting client:', error);
        this.snackBar.open('Erro ao excluir cliente', 'Fechar', { duration: 5000 });
      }
    });
  }

  confirmExecute(): void {
    if (!this.client) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar execução',
        message: `Deseja executar manualmente o ETL para o cliente "${this.client.clientName}"?`,
        confirmButtonText: 'Executar',
        cancelButtonText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.executeETL();
      }
    });
  }

  executeETL(): void {
    if (!this.client) return;

    this.isExecuting = true;
    
    this.clientService.forceExecute(this.client.id).subscribe({
      next: (updatedClient) => {
        this.client = updatedClient;
        this.isExecuting = false;
        this.snackBar.open('Execução iniciada com sucesso', 'Fechar', { duration: 5000 });
      },
      error: (error) => {
        console.error('Error executing ETL:', error);
        this.isExecuting = false;
        this.snackBar.open('Erro ao iniciar execução', 'Fechar', { duration: 5000 });
      }
    });
  }

  formatDaysOfWeek(days: number[]): string {
    if (!days || days.length === 0) {
      return 'Nenhum dia selecionado';
    }

    return days.map(day => {
      const dayObj = this.daysOfWeek.find(d => d.value === day);
      return dayObj ? dayObj.label : '';
    }).filter(label => label).join(', ');
  }

  getLastExecutionClass(): string {
    if (!this.client) return '';

    if (!this.client.lastExecutionTime) {
      return 'status-pending';
    }
    
    const now = new Date();
    const lastExecution = new Date(this.client.lastExecutionTime);
    const daysDifference = Math.floor((now.getTime() - lastExecution.getTime()) / (1000 * 3600 * 24));
    
    if (daysDifference > 1) {
      return 'status-inactive';
    }
    
    return 'status-active';
  }
}