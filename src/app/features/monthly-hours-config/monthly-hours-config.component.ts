import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MonthlyHoursConfigService } from './monthly-hours-config.service';
import { AuthService } from '../../core/auth/auth.service';

import { CardComponent } from '../../shared/components/card/card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-monthly-hours-config',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    SpinnerComponent,
    InputNumberModule,
    ButtonModule,
    LucideAngularModule
  ],
  template: `
    <div class="p-4 sm:p-6 lg:p-8">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-text-color">Configuración de Horas Mensuales</h1>
        <p class="text-text-color-secondary mt-1">Define las horas mensuales permitidas para salir de todos los empleados.</p>
      </header>

      @if (configService.loading() && !configService.config()) {
        <div class="flex justify-center p-16">
          <app-spinner></app-spinner>
        </div>
      } @else {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <app-card>
            <h2 class="text-xl font-semibold mb-4 text-text-color">Configuración Actual</h2>

            @if (configService.config(); as config) {
              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 bg-surface-100 dark:bg-surface-800 rounded-lg">
                  <div class="flex items-center gap-3">
                    <div class="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                      <lucide-icon name="clock" [size]="24" class="text-primary-600 dark:text-primary-400"></lucide-icon>
                    </div>
                    <div>
                      <p class="text-sm text-text-color-secondary">Horas mensuales configuradas</p>
                      <p class="text-3xl font-bold text-text-color">{{ config.monthlyHours }}h</p>
                    </div>
                  </div>
                </div>

                <div class="p-4 bg-surface-50 dark:bg-surface-900 rounded-lg border border-surface-200 dark:border-surface-700">
                  <div class="flex items-start gap-2">
                    <lucide-icon name="info" [size]="16" class="text-primary-600 dark:text-primary-400 mt-0.5"></lucide-icon>
                    <div class="text-sm text-text-color-secondary">
                      <p class="font-medium text-text-color mb-1">Última actualización</p>
                      <p>{{ config.updatedAt | date:'medium' }}</p>
                      <p class="mt-1">Por: <span class="font-medium text-text-color">{{ config.updatedBy }}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            }
          </app-card>

          <app-card>
            <h2 class="text-xl font-semibold mb-4 text-text-color">Modificar Configuración</h2>

            <form [formGroup]="configForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <div class="field">
                <label for="monthlyHours" class="block font-medium text-text-color mb-2">
                  Horas mensuales para salir
                </label>
                <p-inputNumber
                  id="monthlyHours"
                  formControlName="monthlyHours"
                  [min]="1"
                  [max]="744"
                  [showButtons]="true"
                  [step]="1"
                  suffix=" horas"
                  styleClass="w-full"
                  inputStyleClass="w-full">
                </p-inputNumber>
                <small class="block mt-2 text-text-color-secondary">
                  Define el número de horas que cada empleado puede salir al mes. Este valor se aplicará a todos los empleados.
                </small>
                @if (configForm.get('monthlyHours')?.invalid && configForm.get('monthlyHours')?.touched) {
                  <small class="block mt-2 text-red-500">
                    El valor debe estar entre 1 y 744 horas.
                  </small>
                }
              </div>

              <div class="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div class="flex items-start gap-2">
                  <lucide-icon name="alert-triangle" [size]="16" class="text-amber-600 dark:text-amber-400 mt-0.5"></lucide-icon>
                  <div class="text-sm text-amber-800 dark:text-amber-200">
                    <p class="font-medium mb-1">Advertencia</p>
                    <p>Este cambio afectará el cálculo de horas extra para todos los empleados inmediatamente.</p>
                  </div>
                </div>
              </div>

              <div class="flex justify-end gap-2">
                <p-button
                  label="Cancelar"
                  styleClass="p-button-text"
                  (onClick)="onCancel()"
                  [disabled]="configService.loading()">
                </p-button>
                <p-button
                  type="submit"
                  label="Guardar Cambios"
                  icon="pi pi-check"
                  [disabled]="configForm.invalid || configForm.pristine || configService.loading()"
                  [loading]="configService.loading()">
                </p-button>
              </div>
            </form>
          </app-card>
        </div>

        <div class="mt-6">
          <app-card>
            <h3 class="text-lg font-semibold mb-3 text-text-color flex items-center gap-2">
              <lucide-icon name="help-circle" [size]="20"></lucide-icon>
              ¿Cómo funciona?
            </h3>
            <div class="space-y-2 text-sm text-text-color-secondary">
              <p>• Las horas mensuales representan el límite estándar de trabajo esperado por mes para cada empleado.</p>
              <p>• Si un empleado trabaja más de estas horas, se calcularán como horas extra.</p>
              <p>• Este valor es global y se aplica a todos los empleados del sistema.</p>
              <p>• Solo los administradores (SYSTEM_ADMIN y RRHH) pueden modificar esta configuración.</p>
            </div>
          </app-card>
        </div>
      }
    </div>
  `,
})
export default class MonthlyHoursConfigComponent implements OnInit {
  public configService = inject(MonthlyHoursConfigService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private fb = inject(FormBuilder);

  configForm = this.fb.group({
    monthlyHours: [160, [Validators.required, Validators.min(1), Validators.max(744)]]
  });

  ngOnInit(): void {
    this.configService.loadConfig();

    const config = this.configService.config();
    if (config) {
      this.configForm.patchValue({
        monthlyHours: config.monthlyHours
      });
    }
  }

  onSubmit(): void {
    if (this.configForm.valid) {
      const monthlyHours = this.configForm.value.monthlyHours!;
      const currentUser = this.authService.currentUser();
      const updatedBy = currentUser?.name || 'Unknown';

      this.configService.updateConfig(monthlyHours, updatedBy);

      this.messageService.add({
        severity: 'success',
        summary: 'Configuración actualizada',
        detail: `Las horas mensuales se han actualizado a ${monthlyHours}h`
      });

      this.configForm.markAsPristine();
    }
  }

  onCancel(): void {
    const config = this.configService.config();
    if (config) {
      this.configForm.patchValue({
        monthlyHours: config.monthlyHours
      });
      this.configForm.markAsPristine();
    }
  }
}
