import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '@core/services/user.service';
import { User, CreateUserRequest, UpdateUserRequest } from '@core/models/user.model';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isLoading = false;
  isLoadingUser = false;
  isEditMode = false;
  userId = '';
  hidePassword = true;
  
  availableRoles = [
    'Admin',
    'User',
    'Operator'
  ];
  
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}
  
  ngOnInit(): void {
    this.initForm();
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && id !== 'new') {
        this.userId = id;
        this.isEditMode = true;
        this.loadUserData(id);
      }
    });
  }
  
  initForm(): void {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      roles: [[], [Validators.required]],
      isActive: [true]
    });
    
    // Email field should be disabled in edit mode
    if (this.isEditMode) {
      this.userForm.get('email')?.disable();
    }
  }
  
  loadUserData(id: string): void {
    this.isLoadingUser = true;
    
    this.userService.getUser(id).subscribe({
      next: (user) => {
        this.populateForm(user);
        this.isLoadingUser = false;
      },
      error: (error) => {
        console.error('Error loading user', error);
        this.isLoadingUser = false;
        this.snackBar.open('Failed to load user data', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.router.navigate(['/users']);
      }
    });
  }
  
  populateForm(user: User): void {
    this.userForm.patchValue({
      email: user.email,
      name: user.name,
      roles: user.roles,
      isActive: user.isActive
    });
    
    // Remove password validator in edit mode
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }
  
  onSubmit(): void {
    if (this.userForm.invalid) {
      // Mark all controls as touched to show validation errors
      this.markFormGroupTouched(this.userForm);
      this.snackBar.open('Please fix the validation errors before submitting', 'Close', {
        duration: 3000,
        panelClass: ['warning-snackbar']
      });
      return;
    }
    
    this.isLoading = true;
    
    if (this.isEditMode) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }
  
  createUser(): void {
    const formValue = this.userForm.value;
    
    const userData: CreateUserRequest = {
      email: formValue.email,
      name: formValue.name,
      password: formValue.password,
      roles: formValue.roles
    };
    
    this.userService.createUser(userData).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.snackBar.open('User created successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating user', error);
        this.snackBar.open('Failed to create user', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  updateUser(): void {
    const formValue = this.userForm.getRawValue(); // Get raw value to include disabled fields
    
    const userData: UpdateUserRequest = {
      name: formValue.name,
      password: formValue.password || '',
      roles: formValue.roles,
      isActive: formValue.isActive
    };
    
    this.userService.updateUser(this.userId, userData).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.snackBar.open('User updated successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error updating user', error);
        this.snackBar.open('Failed to update user', 'Close', {
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
      }
    });
  }
  
  cancel(): void {
    this.router.navigate(['/users']);
  }
}
