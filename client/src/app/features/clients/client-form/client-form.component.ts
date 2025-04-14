import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ClientService } from '../../../core/services/client.service';
import { 
  Client, 
  CreateClientRequest, 
  UpdateClientRequest 
} from '../../../core/models/client.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss']
})
export class ClientFormComponent implements OnInit {
  clientForm!: FormGroup;
  isEditing = false;
  clientId: string | null = null;
  isLoading = false;
  isSaving = false;
  
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
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.initForm();
    
    this.clientId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.clientId;
    
    if (this.isEditing && this.clientId) {
      this.loadClient(this.clientId);
    }
  }

  initForm(): void {
    this.clientForm = this.fb.group({
      clientName: ['', [Validators.required, Validators.maxLength(100)]],
      dataWarehouseConnectionString: ['', Validators.required],
      isActive: [true],
      schedule: this.fb.group({
        executionTimes: this.fb.array([]),
        daysOfWeek: [[], Validators.required],
        isEnabled: [true]
      }),
      databases: this.fb.array([])
    });
  }

  loadClient(id: string): void {
    this.isLoading = true;
    
    this.clientService.getClient(id).subscribe({
      next: (client) => {
        this.populateForm(client);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading client:', error);
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar dados do cliente', 'Fechar', { duration: 5000 });
        this.router.navigate(['/clients']);
      }
    });
  }

  populateForm(client: Client): void {
    // Reset form first
    this.clientForm.reset();
    
    // Clear execution times array
    while (this.executionTimes.length) {
      this.executionTimes.removeAt(0);
    }
    
    // Add execution times
    for (const time of client.schedule.executionTimes) {
      this.addExecutionTime(time);
    }
    
    // Clear databases array
    while (this.databases.length) {
      this.databases.removeAt(0);
    }
    
    // Add databases
    for (const db of client.databases) {
      this.addDatabase(db);
    }
    
    // Set form values
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

  // Schedule Form Array Methods
  get executionTimes(): FormArray {
    return this.clientForm.get('schedule')?.get('executionTimes') as FormArray;
  }
  
  addExecutionTime(time: string = ''): void {
    this.executionTimes.push(this.fb.control(time, [Validators.required, Validators.pattern('^([01]?[0-9]|2[0-3]):[0-5][0-9]$')]));
  }
  
  removeExecutionTime(index: number): void {
    this.executionTimes.removeAt(index);
  }

  // Databases Form Array Methods
  get databases(): FormArray {
    return this.clientForm.get('databases') as FormArray;
  }
  
  createDatabaseFormGroup(db: any = null): FormGroup {
    return this.fb.group({
      id: [db?.id || null],
      connectionString: [db?.connectionString || '', Validators.required],
      databaseName: [db?.databaseName || '', Validators.required],
      description: [db?.description || '', Validators.required],
      isMandatory: [db?.isMandatory || false]
    });
  }
  
  addDatabase(db: any = null): void {
    this.databases.push(this.createDatabaseFormGroup(db));
  }
  
  removeDatabase(index: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar remoção',
        message: 'Tem certeza que deseja remover este banco de dados?',
        confirmButtonText: 'Remover',
        cancelButtonText: 'Cancelar',
        dangerAction: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.databases.removeAt(index);
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.markFormGroupTouched(this.clientForm);
      this.snackBar.open('Por favor, corrija os erros no formulário antes de prosseguir.', 'Fechar', { duration: 5000 });
      return;
    }
    
    this.isSaving = true;
    
    const formData = this.clientForm.value;
    
    if (this.isEditing && this.clientId) {
      const updateRequest: UpdateClientRequest = {
        clientName: formData.clientName,
        dataWarehouseConnectionString: formData.dataWarehouseConnectionString,
        isActive: formData.isActive,
        schedule: {
          executionTimes: formData.schedule.executionTimes,
          daysOfWeek: formData.schedule.daysOfWeek,
          isEnabled: formData.schedule.isEnabled
        },
        databases: formData.databases
      };
      
      this.clientService.updateClient(this.clientId, updateRequest).subscribe({
        next: (client) => {
          this.isSaving = false;
          this.snackBar.open('Cliente atualizado com sucesso', 'Fechar', { duration: 5000 });
          this.router.navigate(['/clients', client.id]);
        },
        error: (error) => {
          console.error('Error updating client:', error);
          this.isSaving = false;
          this.snackBar.open('Erro ao atualizar cliente', 'Fechar', { duration: 5000 });
        }
      });
    } else {
      const createRequest: CreateClientRequest = {
        clientName: formData.clientName,
        dataWarehouseConnectionString: formData.dataWarehouseConnectionString,
        isActive: formData.isActive,
        schedule: {
          executionTimes: formData.schedule.executionTimes,
          daysOfWeek: formData.schedule.daysOfWeek,
          isEnabled: formData.schedule.isEnabled
        },
        databases: formData.databases
      };
      
      this.clientService.createClient(createRequest).subscribe({
        next: (client) => {
          this.isSaving = false;
          this.snackBar.open('Cliente criado com sucesso', 'Fechar', { duration: 5000 });
          this.router.navigate(['/clients', client.id]);
        },
        error: (error) => {
          console.error('Error creating client:', error);
          this.isSaving = false;
          this.snackBar.open('Erro ao criar cliente', 'Fechar', { duration: 5000 });
        }
      });
    }
  }
  
  confirmCancel(): void {
    if (this.clientForm.dirty) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Descartar alterações',
          message: 'Você tem alterações não salvas. Deseja descartar estas alterações?',
          confirmButtonText: 'Descartar',
          cancelButtonText: 'Continuar editando'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.cancelForm();
        }
      });
    } else {
      this.cancelForm();
    }
  }
  
  cancelForm(): void {
    if (this.isEditing && this.clientId) {
      this.router.navigate(['/clients', this.clientId]);
    } else {
      this.router.navigate(['/clients']);
    }
  }
  
  // Helper method to mark all controls in a form group as touched
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      }
    });
  }
}