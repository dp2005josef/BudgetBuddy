import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { Client } from '../../../core/models/client.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['clientName', 'isActive', 'lastExecutionTime', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<Client>([]);
  isLoading = true;
  error = false;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private clientService: ClientService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;
    this.error = false;

    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.dataSource.data = clients;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.error = true;
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar clientes', 'Fechar', { duration: 5000 });
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  navigateToDetail(id: string): void {
    this.router.navigate(['/clients', id]);
  }

  navigateToEdit(id: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/clients', id, 'edit']);
  }

  confirmDelete(client: Client, event: Event): void {
    event.stopPropagation();
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar exclusão',
        message: `Tem certeza que deseja excluir o cliente "${client.clientName}"?`,
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',
        dangerAction: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteClient(client.id);
      }
    });
  }

  deleteClient(id: string): void {
    this.clientService.deleteClient(id).subscribe({
      next: () => {
        this.loadClients();
        this.snackBar.open('Cliente excluído com sucesso', 'Fechar', { duration: 5000 });
      },
      error: (error) => {
        console.error('Error deleting client:', error);
        this.snackBar.open('Erro ao excluir cliente', 'Fechar', { duration: 5000 });
      }
    });
  }

  forceExecute(client: Client, event: Event): void {
    event.stopPropagation();
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar execução',
        message: `Deseja executar manualmente o ETL para o cliente "${client.clientName}"?`,
        confirmButtonText: 'Executar',
        cancelButtonText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.executeETL(client.id);
      }
    });
  }

  executeETL(id: string): void {
    this.clientService.forceExecute(id).subscribe({
      next: () => {
        this.loadClients();
        this.snackBar.open('Execução iniciada com sucesso', 'Fechar', { duration: 5000 });
      },
      error: (error) => {
        console.error('Error executing ETL:', error);
        this.snackBar.open('Erro ao iniciar execução', 'Fechar', { duration: 5000 });
      }
    });
  }

  getLastExecutionStatus(client: Client): { status: string, color: string } {
    if (!client.isActive) {
      return { status: 'Inativo', color: 'warn' };
    }
    
    if (!client.lastExecutionTime) {
      return { status: 'Pendente', color: 'accent' };
    }
    
    const now = new Date();
    const lastExecution = new Date(client.lastExecutionTime);
    const daysDifference = Math.floor((now.getTime() - lastExecution.getTime()) / (1000 * 3600 * 24));
    
    if (daysDifference > 1) {
      return { status: 'Atrasado', color: 'warn' };
    }
    
    return { status: 'OK', color: 'primary' };
  }
}