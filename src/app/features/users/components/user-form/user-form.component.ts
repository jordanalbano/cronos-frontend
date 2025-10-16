import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../../../shared/models/user.model';
import { Role } from '../../../../shared/models/roles.enum';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MultiSelectModule
  ],
  template: `
    <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="p-fluid">
      <div class="field mb-4">
        <label for="name" class="font-medium">Nombre</label>
        <input pInputText id="name" formControlName="name" class="mt-2" />
      </div>
      <div class="field mb-4">
        <label for="email" class="font-medium">Email</label>
        <input pInputText id="email" formControlName="email" class="mt-2" />
      </div>
      <div class="field mb-6">
        <label for="roles" class="font-medium">Roles</label>
        <p-multiSelect
          id="roles"
          [options]="availableRoles"
          formControlName="roles"
          placeholder="Seleccionar roles"
          optionLabel="label"
          optionValue="value"
          display="chip"
          class="mt-2">
        </p-multiSelect>
      </div>
      <div class="flex justify-end gap-2">
        <p-button label="Cancelar" styleClass="p-button-text" (click)="onCancel()"></p-button>
        <p-button type="submit" label="Guardar" [disabled]="userForm.invalid"></p-button>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFormComponent implements OnChanges {
  @Input() user: User | null = null;
  @Output() save = new EventEmitter<User | Omit<User, 'id'>>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);

  userForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    roles: [[] as Role[], Validators.required]
  });

  availableRoles = Object.values(Role).map(role => ({ label: role, value: role }));

  ngOnChanges(changes: SimpleChanges): void {
    this.userForm.reset({ name: '', email: '', roles: []});
    if (changes['user'] && this.user) {
      this.userForm.patchValue(this.user);
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formData = this.userForm.getRawValue();
      const payload = this.user ? { ...this.user, ...formData } : formData;
      this.save.emit(payload as User | Omit<User, 'id'>);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
