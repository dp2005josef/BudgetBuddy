import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientService } from '../../../core/services/client.service';
import { Client, CreateClientRequest, UpdateClientRequest } from '../../../core/models/client.model';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.scss']
})
export class ClientFormComponent implements OnInit {
  clientForm!: FormGroup;
  clientId: string | null = null;
  isEdit = false;
  isLoading = false;
  isSaving = false;
  error = false;
  weekDays = [
    { value: 0, name: 'Domingo' },
    { value: 1, name: 'Segunda-feira' },
    { value: 2, name: 'Terça-feira' },
    { value: 3, name: 'Quarta-feira' },
    { value: 4, name: 'Quinta-feira' },
    { value: 5, name: 'Sexta-feira' },
    { value: 6, name: 'Sábado' }
  ];
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.createForm();
    
    this.clientId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.clientId;
    
    if (this.isEdit && this.clientId) {
      this.loadClient(this.clientId);
    }
  }
  
  createForm(): void {
    this.clientForm = this.fb.group({
      clientName: ['', [Validators.required, Validators.maxLength(100)]],
      dataWarehouseConnectionString: ['', [Validators.required]],
      isActive: [true],
      schedule: this.fb.group({
        executionTimes: this.fb.array([]),
        daysOfWeek: [[], [Validators.required]],
        isEnabled: [true]
      }),
      databases: this.fb.array([])
    });
    
    // Adiciona um horário vazio por padrão
    this.addExecutionTime();
    
    // Adiciona um banco de dados vazio por padrão
    this.addDatabase();
  }
  
  loadClient(id: string): void {
    this.isLoading = true;
    this.error = false;
    
    this.clientService.getClient(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (client) => {
          this.updateForm(client);
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
  
  updateForm(client: Client): void {
    // Limpa os arrays existentes
    this.executionTimesArray.clear();
    this.databasesArray.clear();
    
    // Preenche o formulário com dados do cliente
    this.clientForm.patchValue({
      clientName: client.clientName,
      dataWarehouseConnectionString: client.dataWarehouseConnectionString,
      isActive: client.isActive,
      schedule: {
        daysOfWeek: client.schedule.daysOfWeek,
        isEnabled: client.schedule.isEnabled
      }
    });
    
    // Adiciona os horários de execução
    client.schedule.executionTimes.forEach(time => {
      this.executionTimesArray.push(this.fb.control(time, [Validators.required]));
    });
    
    // Adiciona os bancos de dados
    client.databases.forEach(db => {
      this.databasesArray.push(this.fb.group({
        id: [db.id],
        connectionString: [db.connectionString, [Validators.required]],
        databaseName: [db.databaseName, [Validators.required, Validators.maxLength(100)]],
        description: [db.description, [Validators.required]],
        isMandatory: [db.isMandatory]
      }));
    });
    
    // Se não houver horários, adiciona um em branco
    if (this.executionTimesArray.length === 0) {
      this.addExecutionTime();
    }
    
    // Se não houver bancos, adiciona um em branco
    if (this.databasesArray.length === 0) {
      this.addDatabase();
    }
  }
  
  get executionTimesArray(): FormArray {
    return this.clientForm.get('schedule')?.get('executionTimes') as FormArray;
  }
  
  get databasesArray(): FormArray {
    return this.clientForm.get('databases') as FormArray;
  }
  
  addExecutionTime(): void {
    this.executionTimesArray.push(this.fb.control('', [Validators.required]));
  }
  
  removeExecutionTime(index: number): void {
    if (this.executionTimesArray.length > 1) {
      this.executionTimesArray.removeAt(index);
    }
  }
  
  addDatabase(): void {
    this.databasesArray.push(this.fb.group({
      connectionString: ['', [Validators.required]],
      databaseName: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required]],
      isMandatory: [false]
    }));
  }
  
  removeDatabase(index: number): void {
    if (this.databasesArray.length > 1) {
      this.databasesArray.removeAt(index);
    }
  }
  
  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.markFormGroupTouched(this.clientForm);
      this.snackBar.open('Por favor, corrija os erros no formulário antes de continuar', 'Fechar', {
        duration: 5000,
        panelClass: 'error-snackbar'
      });
      return;
    }
    
    this.isSaving = true;
    
    const formValue = this.clientForm.value;
    
    if (this.isEdit && this.clientId) {
      const updateRequest: UpdateClientRequest = {
        clientName: formValue.clientName,
        dataWarehouseConnectionString: formValue.dataWarehouseConnectionString,
        isActive: formValue.isActive,
        schedule: {
          executionTimes: formValue.schedule.executionTimes,
          daysOfWeek: formValue.schedule.daysOfWeek,
          isEnabled: formValue.schedule.isEnabled
        },
        databases: formValue.databases
      };
      
      this.clientService.updateClient(this.clientId, updateRequest)
        .pipe(
          finalize(() => {
            this.isSaving = false;
          })
        )
        .subscribe({
          next: () => {
            this.snackBar.open('Cliente atualizado com sucesso', 'Fechar', {
              duration: 3000
            });
            this.router.navigate(['/clients', this.clientId]);
          },
          error: () => {
            this.snackBar.open('Erro ao atualizar cliente', 'Fechar', {
              duration: 5000,
              panelClass: 'error-snackbar'
            });
          }
        });
    } else {
      const createRequest: CreateClientRequest = {
        clientName: formValue.clientName,
        dataWarehouseConnectionString: formValue.dataWarehouseConnectionString,
        isActive: formValue.isActive,
        schedule: {
          executionTimes: formValue.schedule.executionTimes,
          daysOfWeek: formValue.schedule.daysOfWeek,
          isEnabled: formValue.schedule.isEnabled
        },
        databases: formValue.databases
      };
      
      this.clientService.createClient(createRequest)
        .pipe(
          finalize(() => {
            this.isSaving = false;
          })
        )
        .subscribe({
          next: (client) => {
            this.snackBar.open('Cliente criado com sucesso', 'Fechar', {
              duration: 3000
            });
            this.router.navigate(['/clients', client.id]);
          },
          error: () => {
            this.snackBar.open('Erro ao criar cliente', 'Fechar', {
              duration: 5000,
              panelClass: 'error-snackbar'
            });
          }
        });
    }
  }
  
  navigateBack(): void {
    if (this.isEdit && this.clientId) {
      this.router.navigate(['/clients', this.clientId]);
    } else {
      this.router.navigate(['/clients']);
    }
  }
  
  // Método para marcar todos os controles de um FormGroup como touched
  private markFormGroupTouched(formGroup: FormGroup): void {
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