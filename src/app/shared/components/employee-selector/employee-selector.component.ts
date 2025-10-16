import { Component, OnInit, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { UsersService } from '../../../features/users/users.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-employee-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, Select],
  template: `
    <div class="w-full">
      <label class="block text-sm font-medium text-text-color mb-2">
        Seleccionar Empleado *
      </label>
      <p-select
        [options]="employees"
        [(ngModel)]="selectedEmployee"
        (onChange)="onEmployeeChange()"
        optionLabel="name"
        [filter]="true"
        placeholder="Buscar empleado..."
        [showClear]="true"
        styleClass="w-full"
      >
        <ng-template pTemplate="selectedItem" let-employee>
          <div *ngIf="employee" class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span class="text-primary-600 font-medium text-sm">
                {{ getInitials(employee.name) }}
              </span>
            </div>
            <div>
              <div class="font-medium">{{ employee.name }}</div>
              <div class="text-xs text-text-color-secondary">{{ employee.email }}</div>
            </div>
          </div>
        </ng-template>
        <ng-template pTemplate="item" let-employee>
          <div class="flex items-center gap-2 py-2">
            <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span class="text-primary-600 font-medium text-sm">
                {{ getInitials(employee.name) }}
              </span>
            </div>
            <div>
              <div class="font-medium">{{ employee.name }}</div>
              <div class="text-xs text-text-color-secondary">{{ employee.email }}</div>
            </div>
          </div>
        </ng-template>
      </p-select>
    </div>
  `,
})
export class EmployeeSelectorComponent implements OnInit {
  private usersService = inject(UsersService);

  employeeSelected = output<string | null>();

  employees: User[] = [];
  selectedEmployee: User | null = null;

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.usersService.loadUsers();
    this.employees = this.usersService.users;
  }

  onEmployeeChange(): void {
    this.employeeSelected.emit(this.selectedEmployee?.id || null);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
