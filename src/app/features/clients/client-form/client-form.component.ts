import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientService } from '@core/services/client.service';
import { Client, CreateClientRequest, UpdateClientRequest } from '@core/models/client.model';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html'
})
export class ClientFormComponent implements OnInit {
  clientForm!: FormGroup;
  isLoading = false;
  isLoadingClient = false;
  isEditMode = false;
  clientId = '';
  daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.initForm();
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.clientId = id;
        this.isEditMode = true;
        this.loadClientData(id);
      }
    });
  }
  
  initForm(): void {
    this.clientForm = this.fb.group({
      clientName: ['', [Validators.required]],
      dataWarehouseConnectionString: ['', [Validators.required]],
      isActive: [true],
      schedule: this.fb.group({
        executionTimes: this.fb.array([this.createExecutionTimeControl()]),
        daysOfWeek: [[], [Validators.required]],
        isEnabled: [true]
      }),
      databases: this.fb.array([this.createDatabaseControl()])
    });
  }
  
  createExecutionTimeControl(): FormGroup {
    return this.fb.group({
      time: ['', [Validators.required, Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]]
    });
  }
  
  createDatabaseControl(): FormGroup {
    return this.fb.group({
      connectionString: ['', [Validators.required]],
      databaseName: ['', [Validators.required]],
      description: [''],
      isMandatory: [false]
    });
  }
  
  get executionTimesArray(): FormArray {
    return this.clientForm.get('schedule')?.get('executionTimes') as FormArray;
  }
  
  get databasesArray(): FormArray {
    return this.clientForm.get('databases') as FormArray;
  }
  
  addExecutionTime(): void {
    this.executionTimesArray.push(this.createExecutionTimeControl());
  }
  
  removeExecutionTime(index: number): void {
    if (this.executionTimesArray.length > 1) {
      this.executionTimesArray.removeAt(index);
    }
  }
  
  addDatabase(): void {
    this.databasesArray.push(this.createDatabaseControl());
  }
  
  removeDatabase(index: number): void {
    if (this.databasesArray.length > 1) {
      this.databasesArray.removeAt(index);
    }
  }
  
  loadClientData(id: string): void {
    this.isLoadingClient = true;
    
    this.clientService.getClient(id).subscribe({
      next: (client) => {
        this.populateForm(client);
        this.isLoadingClient = false;
      },
      error: (error) => {
        console.error('Error loading client', error);
        this.isLoadingClient = false;
        this.snackBar.open('Failed to load client data', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/clients']);
      }
    });
  }
  
  populateForm(client: Client): void {
    // Clear existing execution times and create new ones
    while (this.executionTimesArray.length) {
      this.executionTimesArray.removeAt(0);
    }
    
    client.schedule.executionTimes.forEach(time => {
      this.executionTimesArray.push(this.fb.group({
        time: [time, [Validators.required, Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]]
      }));
    });
    
    // If no execution times, add an empty one
    if (client.schedule.executionTimes.length === 0) {
      this.executionTimesArray.push(this.createExecutionTimeControl());
    }
    
    // Clear existing databases and create new ones
    while (this.databasesArray.length) {
      this.databasesArray.removeAt(0);
    }
    
    client.databases.forEach(db => {
      this.databasesArray.push(this.fb.group({
        connectionString: [db.connectionString, [Validators.required]],
        databaseName: [db.databaseName, [Validators.required]],
        description: [db.description],
        isMandatory: [db.isMandatory]
      }));
    });
    
    // If no databases, add an empty one
    if (client.databases.length === 0) {
      this.databasesArray.push(this.createDatabaseControl());
    }
    
    // Update the form with client data
    this.clientForm.patchValue({
      clientName: client.clientName,
      dataWarehouseConnectionString: client.dataWarehouseConnectionString,
      isActive: client.isActive,
      schedule: {
        daysOfWeek: client.schedule.daysOfWeek,
        isEnabled: client.schedule.isEnabled
      }
    });
  }
  
  onSubmit(): void {
    if (this.clientForm.invalid) {
      // Mark all controls as touched to show validation errors
      this.markFormGroupTouched(this.clientForm);
      this.snackBar.open('Please fix the validation errors before submitting', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }
    
    this.isLoading = true;
    
    // Transform form data to match API schema
    const formValue = this.clientForm.value;
    
    // Extract times from the execution times array
    const executionTimes = formValue.schedule.executionTimes.map((item: { time: string }) => item.time);
    
    const clientData = {
      clientName: formValue.clientName,
      dataWarehouseConnectionString: formValue.dataWarehouseConnectionString,
      isActive: formValue.isActive,
      schedule: {
        executionTimes: executionTimes,
        daysOfWeek: formValue.schedule.daysOfWeek,
        isEnabled: formValue.schedule.isEnabled
      },
      databases: formValue.databases
    };
    
    if (this.isEditMode) {
      this.updateClient(clientData);
    } else {
      this.createClient(clientData);
    }
  }
  
  createClient(data: CreateClientRequest): void {
    this.clientService.createClient(data).subscribe({
      next: (client) => {
        this.isLoading = false;
        this.snackBar.open('Client created successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/clients', client.id]);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating client', error);
        this.snackBar.open('Failed to create client', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  updateClient(data: UpdateClientRequest): void {
    this.clientService.updateClient(this.clientId, data).subscribe({
      next: (client) => {
        this.isLoading = false;
        this.snackBar.open('Client updated successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/clients', client.id]);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error updating client', error);
        this.snackBar.open('Failed to update client', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        for (let i = 0; i < control.length; i++) {
          if (control.at(i) instanceof FormGroup) {
            this.markFormGroupTouched(control.at(i) as FormGroup);
          }
        }
      }
    });
  }
  
  cancel(): void {
    if (this.isEditMode) {
      this.router.navigate(['/clients', this.clientId]);
    } else {
      this.router.navigate(['/clients']);
    }
  }
}
