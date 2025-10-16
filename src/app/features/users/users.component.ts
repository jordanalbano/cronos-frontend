import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from './users.service';
import { User } from '../../shared/models/user.model';
import { Role } from '../../shared/models/roles.enum';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

// Components
import { CardComponent } from '../../shared/components/card/card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { UserFormComponent } from './components/user-form/user-form.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    TooltipModule,
    TagModule,
    ConfirmDialogModule,
    CardComponent,
    SpinnerComponent,
    UserFormComponent,
    LucideAngularModule
  ],
  providers: [ConfirmationService],
  template: `
    <p-confirmDialog [style]="{width: '450px'}"></p-confirmDialog>
    <div class="p-4 sm:p-6 lg:p-8">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-text-color">Gestión de Usuarios</h1>
        <p class="text-text-color-secondary mt-1">Crea, edita y gestiona los usuarios y sus roles.</p>
      </header>

      <app-card>
        @if (usersService.loading && !usersService.users.length) {
          <div class="flex justify-center p-16"><app-spinner></app-spinner></div>
        } @else {
          <p-table #dt [value]="usersService.users" [rows]="10" [paginator]="true" [globalFilterFields]="['name','email']"
                   [tableStyle]="{'min-width': '60rem'}" responsiveLayout="scroll" styleClass="p-datatable-gridlines"
                   currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios">
            <ng-template pTemplate="caption">
              <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 class="text-xl font-semibold">Usuarios del Sistema</h3>
                <button pButton label="Nuevo Usuario" icon="pi pi-plus" class="p-button-success" (click)="openNew()"></button>
              </div>
            </ng-template>
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="name">Nombre <p-sortIcon field="name"></p-sortIcon></th>
                <th pSortableColumn="email">Email <p-sortIcon field="email"></p-sortIcon></th>
                <th>Roles</th>
                <th>Acciones</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-user>
              <tr>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <div class="flex flex-wrap gap-1">
                    @for(role of user.roles; track role) {
                      <p-tag [value]="role" [severity]="getRoleSeverity(role)"></p-tag>
                    }
                  </div>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button pButton pRipple icon="pi pi-pencil" class="p-button-rounded p-button-info"
                            pTooltip="Editar usuario" (click)="editUser(user)"></button>
                    <button pButton pRipple icon="pi pi-trash" class="p-button-rounded p-button-danger"
                            pTooltip="Eliminar usuario" (click)="deleteUser(user)"></button>
                  </div>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="4" class="text-center p-8">
                  <div class="text-text-color-secondary">
                    <lucide-icon name="user-plus" size="48" class="mx-auto mb-4"></lucide-icon>
                    <p>No se encontraron usuarios.</p>
                    <p class="text-sm mt-2">¡Crea el primero usando el botón "Nuevo Usuario"!</p>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        }
      </app-card>
    </div>

    <p-dialog [(visible)]="displayDialog" [header]="dialogHeader()" [modal]="true" [style]="{width: '450px'}" [draggable]="false" [resizable]="false">
        <app-user-form [user]="selectedUser()" (save)="saveUser($event)" (cancel)="displayDialog.set(false)"></app-user-form>
    </p-dialog>
  `,
})
export default class UsersManagementComponent implements OnInit {
  public usersService = inject(UsersService);
  private confirmationService = inject(ConfirmationService);

  displayDialog = signal(false);
  selectedUser = signal<User | null>(null);
  dialogHeader = signal('Nuevo Usuario');

  ngOnInit(): void {
    this.usersService.loadUsers();
  }

  openNew(): void {
    this.selectedUser.set(null);
    this.dialogHeader.set('Nuevo Usuario');
    this.displayDialog.set(true);
  }

  editUser(user: User): void {
    this.selectedUser.set({ ...user });
    this.dialogHeader.set('Editar Usuario');
    this.displayDialog.set(true);
  }

  deleteUser(user: User): void {
    this.confirmationService.confirm({
        message: `¿Estás seguro de que quieres eliminar a <strong>${user.name}</strong>?`,
        header: 'Confirmación de eliminación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, eliminar',
        rejectLabel: 'No',
        accept: () => {
            this.usersService.deleteUser(user.id);
        }
    });
  }

  saveUser(userPayload: User | Omit<User, 'id'>): void {
    if ('id' in userPayload) {
      this.usersService.updateUser(userPayload as User);
    } else {
      this.usersService.addUser(userPayload);
    }
    this.displayDialog.set(false);
  }

  getRoleSeverity(role: Role): "danger" | "info" | "success" | "secondary" | "warn" | "contrast" | null | undefined {
    switch (role) {
      case Role.SYSTEM_ADMIN: return 'danger';
      case Role.RRHH: return 'info';
      case Role.CLOCKING_ADMIN: return 'warn';
      case Role.EMPLOYEE: return 'success';
      default: return 'secondary';
    }
  }
}
