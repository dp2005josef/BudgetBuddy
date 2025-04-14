import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ClientService } from '@core/services/client.service';
import { Client } from '@core/models/client.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html'
})
export class ClientListComponent implements OnInit {
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
  ) {}

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
        console.error('Error loading clients', error);
        this.isLoading = false;
        this.error = true;
        this.snackBar.open('Failed to load clients', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
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
      width: '400px',
      data: {
        title: 'Delete Client',
        message: `Are you sure you want to delete ${client.clientName}? This action cannot be undone.`,
        confirmButtonText: 'Delete',
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
        this.snackBar.open('Client deleted successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadClients();
      },
      error: (error) => {
        console.error('Error deleting client', error);
        this.snackBar.open('Failed to delete client', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  forceExecute(client: Client, event: Event): void {
    event.stopPropagation();
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Force Execute ETL',
        message: `Are you sure you want to force execute ETL for ${client.clientName}?`,
        confirmButtonText: 'Execute',
        cancelButtonText: 'Cancel'
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
      next: (response) => {
        this.snackBar.open('ETL execution triggered successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Update the client in the data source
        const index = this.dataSource.data.findIndex(c => c.id === id);
        if (index !== -1) {
          const updatedData = [...this.dataSource.data];
          updatedData[index] = response;
          this.dataSource.data = updatedData;
        }
      },
      error: (error) => {
        console.error('Error executing ETL', error);
        this.snackBar.open('Failed to execute ETL', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  getLastExecutionStatus(client: Client): { status: string, color: string } {
    if (!client.lastExecutionTime) {
      return { status: 'Never executed', color: '#757575' };
    }
    
    const lastExecution = new Date(client.lastExecutionTime);
    const now = new Date();
    const diffHours = (now.getTime() - lastExecution.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return { status: 'Recent', color: '#4caf50' };
    } else if (diffHours < 48) {
      return { status: 'Yesterday', color: '#ff9800' };
    } else {
      return { status: 'Outdated', color: '#f44336' };
    }
  }
}
