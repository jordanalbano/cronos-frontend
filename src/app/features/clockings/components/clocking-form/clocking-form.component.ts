import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Clocking } from '../../../../shared/models/clocking.model';

@Component({
  selector: 'app-clocking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4">
      <div class="flex-grow w-full">
        <label for="description" class="sr-only">Descripción</label>
        <input pInputText id="description" formControlName="description" placeholder="¿En qué estás trabajando?" class="w-full" />
      </div>
      <p-button type="submit" label="Iniciar Fichaje" icon="pi pi-play" [disabled]="form.invalid"></p-button>
    </form>
  `,
})
export class ClockingFormComponent {
  @Output() addClocking = new EventEmitter<Partial<Clocking>>();
  private fb = inject(FormBuilder);

  form = this.fb.group({
    description: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.valid) {
      this.addClocking.emit({ description: this.form.value.description! });
      this.form.reset();
    }
  }
}
