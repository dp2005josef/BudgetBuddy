import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'email', 'roles', 'isActive', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<User>([]);
  isLoading = true;
  error = false;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = false;

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error = true;
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar usuários', 'Fechar', { duration: 5000 });
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

  navigateToEdit(id: string): void {
    this.router.navigate(['/users', id, 'edit']);
  }

  confirmDelete(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar exclusão',
        message: `Tem certeza que deseja excluir o usuário "${user.name}"?`,
        confirmButtonText: 'Excluir',
        cancelButtonText: 'Cancelar',
        dangerAction: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteUser(user.id);
      }
    });
  }

  deleteUser(id: string): void {
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.loadUsers();
        this.snackBar.open('Usuário excluído com sucesso', 'Fechar', { duration: 5000 });
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.snackBar.open('Erro ao excluir usuário', 'Fechar', { duration: 5000 });
      }
    });
  }

  formatRoles(roles: string[]): string {
    if (!roles || roles.length === 0) {
      return 'Sem perfil';
    }
    
    return roles.map(role => {
      switch (role.toLowerCase()) {
        case 'admin':
          return 'Administrador';
        case 'user':
          return 'Usuário';
        case 'manager':
          return 'Gerente';
        default:
          return role;
      }
    }).join(', ');
  }
}