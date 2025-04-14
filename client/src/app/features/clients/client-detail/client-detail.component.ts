import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientService } from '@core/services/client.service';
import { Client } from '@core/models/client.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html'
})
export class ClientDetailComponent implements OnInit {
  client: Client | null = null;
  isLoading = true;
  error = false;
  isExecuting = false;
  
  daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadClient(id);
      }
    });
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
        console.error('Error loading client', error);
        this.isLoading = false;
        this.error = true;
        this.snackBar.open('Failed to load client details', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
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
      width: '400px',
      data: {
        title: 'Delete Client',
        message: `Are you sure you want to delete ${this.client.clientName}? This action cannot be undone.`,
        confirmButtonText: 'Delete',
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
        this.snackBar.open('Client deleted successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/clients']);
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
  
  confirmExecute(): void {
    if (!this.client) return;
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Force Execute ETL',
        message: `Are you sure you want to force execute ETL for ${this.client.clientName}?`,
        confirmButtonText: 'Execute',
        cancelButtonText: 'Cancel'
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
        this.snackBar.open('ETL execution triggered successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error executing ETL', error);
        this.isExecuting = false;
        this.snackBar.open('Failed to execute ETL', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  formatDaysOfWeek(days: number[]): string {
    if (!days || days.length === 0) return 'None';
    
    if (days.length === 7) return 'Every day';
    
    return days
      .sort((a, b) => a - b)
      .map(day => this.daysOfWeek[day])
      .join(', ');
  }
  
  getLastExecutionClass(): string {
    if (!this.client?.lastExecutionTime) {
      return 'no-execution';
    }
    
    const lastExecution = new Date(this.client.lastExecutionTime);
    const now = new Date();
    const diffHours = (now.getTime() - lastExecution.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return 'recent-execution';
    } else if (diffHours < 72) {
      return 'old-execution';
    } else {
      return 'very-old-execution';
    }
  }
}
