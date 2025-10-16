import { Component, EventEmitter, Output, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Clocking } from '../../../../shared/models/clocking.model';
import { EmployeeSelectorComponent } from '../../../../shared/components/employee-selector/employee-selector.component';

@Component({
  selector: 'app-clocking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, EmployeeSelectorComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4 p-4">
      @if (showEmployeeSelector) {
        <app-employee-selector (employeeSelected)="onEmployeeSelected($event)"></app-employee-selector>
      }
      <div class="flex flex-col sm:flex-row items-start sm:items-end gap-4">
        <div class="flex-grow w-full">
          <label for="description" class="block text-sm font-medium text-text-color mb-2">Descripción *</label>
          <input pInputText id="description" formControlName="description" placeholder="¿En qué estás trabajando?" class="w-full" />
        </div>
        <p-button type="submit" label="Iniciar Fichaje" icon="pi pi-play" [disabled]="form.invalid || (showEmployeeSelector && !selectedUserId)"></p-button>
      </div>
    </form>
  `,
})
export class ClockingFormComponent {
  @Input() showEmployeeSelector = false;
  @Output() addClocking = new EventEmitter<Partial<Clocking> & { userId?: string }>();

  private fb = inject(FormBuilder);
  selectedUserId: string | null = null;

  form = this.fb.group({
    description: ['', Validators.required],
  });

  onEmployeeSelected(userId: string | null): void {
    this.selectedUserId = userId;
  }

  onSubmit(): void {
    if (this.form.valid) {
      const clockingData: Partial<Clocking> & { userId?: string } = {
        description: this.form.value.description!
      };

      if (this.showEmployeeSelector && this.selectedUserId) {
        clockingData.userId = this.selectedUserId;
      }

      this.addClocking.emit(clockingData);
      this.form.reset();
      this.selectedUserId = null;
    }
  }
}
