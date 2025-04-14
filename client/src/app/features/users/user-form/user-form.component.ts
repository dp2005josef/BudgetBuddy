import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from '../../../core/services/user.service';
import { CreateUserRequest, UpdateUserRequest, User } from '../../../core/models/user.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isEditing = false;
  userId: string | null = null;
  isLoading = false;
  isSaving = false;
  hidePassword = true;
  hideConfirmPassword = true;
  
  availableRoles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'manager', label: 'Gerente' },
    { value: 'user', label: 'Usuário' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.initForm();
    
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!this.userId;
    
    if (this.isEditing && this.userId) {
      this.loadUser(this.userId);
    }
  }

  initForm(): void {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', this.isEditing ? [] : [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', this.isEditing ? [] : [Validators.required]],
      roles: [[], [Validators.required]],
      isActive: [true]
    }, { 
      validators: this.passwordMatchValidator 
    });

    // Make password fields optional when editing
    if (this.isEditing) {
      this.userForm.get('password')?.setValidators([]);
      this.userForm.get('confirmPassword')?.setValidators([]);
      this.userForm.get('password')?.updateValueAndValidity();
      this.userForm.get('confirmPassword')?.updateValueAndValidity();
    }
  }

  passwordMatchValidator(group: FormGroup): {[key: string]: any} | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    
    return null;
  }

  loadUser(id: string): void {
    this.isLoading = true;
    
    this.userService.getUser(id).subscribe({
      next: (user) => {
        this.populateForm(user);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar dados do usuário', 'Fechar', { duration: 5000 });
        this.router.navigate(['/users']);
      }
    });
  }

  populateForm(user: User): void {
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      roles: user.roles,
      isActive: user.isActive
    });
    
    // Disable email field when editing
    this.userForm.get('email')?.disable();
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      this.snackBar.open('Por favor, corrija os erros no formulário antes de prosseguir.', 'Fechar', { duration: 5000 });
      return;
    }
    
    this.isSaving = true;
    
    if (this.isEditing && this.userId) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  createUser(): void {
    const formData = this.userForm.value;
    
    const createRequest: CreateUserRequest = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      roles: formData.roles
    };
    
    this.userService.createUser(createRequest).subscribe({
      next: () => {
        this.isSaving = false;
        this.snackBar.open('Usuário criado com sucesso', 'Fechar', { duration: 5000 });
        this.router.navigate(['/users']);
      },
      error: (error) => {
        console.error('Error creating user:', error);
        this.isSaving = false;
        this.snackBar.open('Erro ao criar usuário', 'Fechar', { duration: 5000 });
      }
    });
  }

  updateUser(): void {
    if (!this.userId) return;
    
    const formData = this.userForm.getRawValue(); // Get values from disabled fields too
    
    const updateRequest: UpdateUserRequest = {
      name: formData.name,
      roles: formData.roles,
      isActive: formData.isActive
    };
    
    // Only include password if provided
    if (formData.password) {
      updateRequest.password = formData.password;
    }
    
    this.userService.updateUser(this.userId, updateRequest).subscribe({
      next: () => {
        this.isSaving = false;
        this.snackBar.open('Usuário atualizado com sucesso', 'Fechar', { duration: 5000 });
        this.router.navigate(['/users']);
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.isSaving = false;
        this.snackBar.open('Erro ao atualizar usuário', 'Fechar', { duration: 5000 });
      }
    });
  }
  
  confirmCancel(): void {
    if (this.userForm.dirty) {
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
    this.router.navigate(['/users']);
  }
  
  // Helper method to mark all controls in a form group as touched
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}