import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';

import { CardComponent } from '../../shared/components/card/card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { MonthlyClosureService } from './monthly-closure.service';
import { AuthService } from '../../core/auth/auth.service';
import { Role } from '../../shared/models/roles.enum';
import { LucideAngularModule } from 'lucide-angular';
import { MonthlyClosureStatus } from '../../shared/models/monthly-closure.model';

@Component({
  selector: 'app-monthly-closure',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    TagModule,
    DatePicker,
    DialogModule,
    TextareaModule,
    CardComponent,
    SpinnerComponent,
    BadgeComponent,
    LucideAngularModule
  ],
  template: `
    <div class="p-4 sm:p-6 lg:p-8">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-text-color">Cierre de Mes</h1>
        <p class="text-text-color-secondary mt-1">Gestiona los cierres mensuales y controla las horas trabajadas.</p>
      </header>

      <app-card>
        <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-end mb-6">
          <div class="flex-1 w-full lg:w-auto">
            <label for="selectedMonth" class="block font-medium text-sm mb-2 text-text-color">Mes a gestionar</label>
            <p-date-picker
              [(ngModel)]="selectedDate"
              view="month"
              dateFormat="mm/yy"
              [readonlyInput]="true"
              inputId="selectedMonth"
              styleClass="w-full"
              (ngModelChange)="onDateChange()">
            </p-date-picker>
          </div>

          <div class="flex gap-2 flex-wrap">
            <p-button
              label="Ver Preview"
              icon="pi pi-eye"
              [outlined]="true"
              (onClick)="generatePreview()"
              [disabled]="closureService.loading()">
            </p-button>
            <p-button
              label="Cerrar Mes"
              icon="pi pi-lock"
              severity="success"
              (onClick)="showCloseDialog()"
              [disabled]="!canCloseMon() || closureService.loading()">
            </p-button>
          </div>
        </div>

        @if (monthStatus()) {
          <div class="mb-6 p-4 rounded-lg border"
               [ngClass]="{
                 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800': monthStatus() === 'closed',
                 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800': monthStatus() === 'reviewing',
                 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800': monthStatus() === 'open'
               }">
            <div class="flex items-center gap-3">
              <lucide-icon
                [name]="getStatusIcon(monthStatus()!)"
                [size]="24"
                [ngClass]="{
                  'text-green-600 dark:text-green-400': monthStatus() === 'closed',
                  'text-yellow-600 dark:text-yellow-400': monthStatus() === 'reviewing',
                  'text-blue-600 dark:text-blue-400': monthStatus() === 'open'
                }">
              </lucide-icon>
              <div>
                <p class="font-medium text-text-color">{{ getStatusLabel(monthStatus()!) }}</p>
                <p class="text-sm text-text-color-secondary">{{ getStatusDescription(monthStatus()!) }}</p>
              </div>
            </div>
          </div>
        }

        @if (closureService.preview(); as preview) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="p-4 bg-surface-100 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-text-color-secondary mb-1">Total Empleados</p>
                  <p class="text-2xl font-bold text-text-color">{{ preview.totalEmployees }}</p>
                </div>
                <lucide-icon name="users" [size]="32" class="text-primary-500 opacity-50"></lucide-icon>
              </div>
            </div>

            <div class="p-4 bg-surface-100 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-text-color-secondary mb-1">Horas Totales</p>
                  <p class="text-2xl font-bold text-text-color">{{ preview.totalHours | number:'1.2-2' }}h</p>
                </div>
                <lucide-icon name="clock" [size]="32" class="text-blue-500 opacity-50"></lucide-icon>
              </div>
            </div>

            <div class="p-4 bg-surface-100 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-text-color-secondary mb-1">Empleados Excedidos</p>
                  <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ preview.employeesExceeded }}</p>
                </div>
                <lucide-icon name="alert-triangle" [size]="32" class="text-red-500 opacity-50"></lucide-icon>
              </div>
            </div>

            <div class="p-4 bg-surface-100 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-text-color-secondary mb-1">Horas Excedidas</p>
                  <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ preview.totalExceededHours | number:'1.2-2' }}h</p>
                </div>
                <lucide-icon name="trending-up" [size]="32" class="text-red-500 opacity-50"></lucide-icon>
              </div>
            </div>
          </div>

          @if (preview.hasInProgressClockings) {
            <div class="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div class="flex items-start gap-3">
                <lucide-icon name="alert-circle" [size]="20" class="text-amber-600 dark:text-amber-400 mt-0.5"></lucide-icon>
                <div class="text-sm text-amber-800 dark:text-amber-200">
                  <p class="font-medium mb-1">Fichajes en progreso detectados</p>
                  <p>Hay {{ preview.inProgressClockingsCount }} fichaje(s) sin finalizar. Se recomienda finalizar todos los fichajes antes de cerrar el mes.</p>
                </div>
              </div>
            </div>
          }

          <p-table
            [value]="preview.details"
            [rows]="10"
            [paginator]="true"
            responsiveLayout="scroll"
            styleClass="p-datatable-gridlines">
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="userName">Empleado <p-sortIcon field="userName"></p-sortIcon></th>
                <th pSortableColumn="totalClockings" class="text-center">Fichajes <p-sortIcon field="totalClockings"></p-sortIcon></th>
                <th pSortableColumn="totalMonthlyHours" class="text-right">Horas Totales <p-sortIcon field="totalMonthlyHours"></p-sortIcon></th>
                <th class="text-right">Límite</th>
                <th pSortableColumn="exceededHours" class="text-right">Excedidas <p-sortIcon field="exceededHours"></p-sortIcon></th>
                <th class="text-center">Estado</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-detail>
              <tr>
                <td>
                  <div>
                    <p class="font-medium text-text-color">{{ detail.userName }}</p>
                    <p class="text-sm text-text-color-secondary">{{ detail.userEmail }}</p>
                  </div>
                </td>
                <td class="text-center">{{ detail.totalClockings }}</td>
                <td class="text-right font-medium">{{ detail.totalMonthlyHours | number:'1.2-2' }}h</td>
                <td class="text-right text-text-color-secondary">{{ detail.allowedHours | number:'1.2-2' }}h</td>
                <td class="text-right font-bold" [class.text-red-600]="detail.exceededHours > 0" [class.dark:text-red-400]="detail.exceededHours > 0">
                  {{ detail.exceededHours | number:'1.2-2' }}h
                </td>
                <td class="text-center">
                  <app-badge
                    [label]="detail.status === 'exceeded' ? 'Excedido' : 'Normal'"
                    [severity]="detail.status === 'exceeded' ? 'danger' : 'success'">
                  </app-badge>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="6" class="text-center p-8">
                  <div class="text-text-color-secondary">
                    <lucide-icon name="inbox" [size]="48" class="mx-auto mb-4"></lucide-icon>
                    <p>No hay datos para este mes</p>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        }
      </app-card>

      <div class="mt-8">
        <app-card>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-text-color">Histórico de Cierres</h2>
            <p-button
              icon="pi pi-refresh"
              [text]="true"
              (onClick)="loadClosures()"
              [loading]="closureService.loading()">
            </p-button>
          </div>

          @if (closureService.loading()) {
            <div class="flex justify-center p-16">
              <app-spinner></app-spinner>
            </div>
          } @else {
            <p-table
              [value]="closureService.closures()"
              [rows]="10"
              [paginator]="true"
              responsiveLayout="scroll"
              styleClass="p-datatable-gridlines">
              <ng-template pTemplate="header">
                <tr>
                  <th pSortableColumn="year">Período <p-sortIcon field="year"></p-sortIcon></th>
                  <th pSortableColumn="status">Estado <p-sortIcon field="status"></p-sortIcon></th>
                  <th class="text-right">Empleados</th>
                  <th class="text-right">Horas Excedidas</th>
                  <th>Cerrado Por</th>
                  <th pSortableColumn="closedAt">Fecha Cierre <p-sortIcon field="closedAt"></p-sortIcon></th>
                  <th class="text-center">Acciones</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-closure>
                <tr>
                  <td>
                    <span class="font-medium">{{ getMonthName(closure.month) }} {{ closure.year }}</span>
                  </td>
                  <td>
                    <p-tag
                      [value]="getStatusLabel(closure.status)"
                      [severity]="getTagSeverity(closure.status)">
                    </p-tag>
                  </td>
                  <td class="text-right">
                    {{ closure.totalEmployees }}
                    @if (closure.employeesExceeded > 0) {
                      <span class="text-red-600 dark:text-red-400 ml-1">({{ closure.employeesExceeded }} excedidos)</span>
                    }
                  </td>
                  <td class="text-right font-medium text-red-600 dark:text-red-400">
                    {{ closure.totalExceededHours | number:'1.2-2' }}h
                  </td>
                  <td>{{ closure.closedBy || '-' }}</td>
                  <td>{{ closure.closedAt ? (closure.closedAt | date:'dd/MM/yyyy HH:mm') : '-' }}</td>
                  <td class="text-center">
                    <div class="flex justify-center gap-2">
                      <p-button
                        icon="pi pi-eye"
                        [text]="true"
                        [rounded]="true"
                        severity="info"
                        pTooltip="Ver detalle"
                        (onClick)="viewDetail(closure.id)">
                      </p-button>
                      <p-button
                        icon="pi pi-download"
                        [text]="true"
                        [rounded]="true"
                        severity="help"
                        pTooltip="Exportar"
                        (onClick)="exportClosure(closure.id)">
                      </p-button>
                      @if (isAdmin() && closure.status === 'closed') {
                        <p-button
                          icon="pi pi-lock-open"
                          [text]="true"
                          [rounded]="true"
                          severity="warn"
                          pTooltip="Reabrir mes"
                          (onClick)="reopenMonth(closure)">
                        </p-button>
                      }
                    </div>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="7" class="text-center p-8">
                    <div class="text-text-color-secondary">
                      <lucide-icon name="calendar-off" [size]="48" class="mx-auto mb-4"></lucide-icon>
                      <p>No hay cierres registrados</p>
                    </div>
                  </td>
                </tr>
              </ng-template>
            </p-table>
          }
        </app-card>
      </div>
    </div>

    <p-dialog
      [(visible)]="showCloseConfirm"
      header="Confirmar Cierre de Mes"
      [modal]="true"
      [style]="{ width: '500px' }">
      <div class="space-y-4">
        <div class="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div class="flex items-start gap-2">
            <lucide-icon name="alert-triangle" [size]="20" class="text-amber-600 dark:text-amber-400 mt-0.5"></lucide-icon>
            <div class="text-sm text-amber-800 dark:text-amber-200">
              <p class="font-medium mb-1">Acción irreversible</p>
              <p>Una vez cerrado, el mes no podrá modificarse sin intervención de un administrador.</p>
            </div>
          </div>
        </div>

        <div>
          <label for="closeNotes" class="block font-medium text-sm mb-2 text-text-color">Notas del cierre (opcional)</label>
          <textarea
            id="closeNotes"
            pTextarea
            [(ngModel)]="closeNotes"
            rows="4"
            placeholder="Añade observaciones sobre este cierre mensual..."
            class="w-full">
          </textarea>
        </div>

        <div class="flex items-start gap-2 p-3 bg-surface-100 dark:bg-surface-800 rounded">
          <input
            type="checkbox"
            id="confirmCheck"
            [(ngModel)]="confirmChecked"
            class="mt-1">
          <label for="confirmCheck" class="text-sm text-text-color">
            He revisado los datos y confirmo que deseo cerrar el mes de <strong>{{ getMonthName(selectedDate.getMonth() + 1) }} {{ selectedDate.getFullYear() }}</strong>
          </label>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <p-button
          label="Cancelar"
          [text]="true"
          (onClick)="showCloseConfirm = false">
        </p-button>
        <p-button
          label="Cerrar Mes"
          severity="success"
          [disabled]="!confirmChecked"
          [loading]="closureService.loading()"
          (onClick)="confirmClose()">
        </p-button>
      </ng-template>
    </p-dialog>
  `,
})
export default class MonthlyClosureComponent implements OnInit {
  public closureService = inject(MonthlyClosureService);
  private authService = inject(AuthService);
  private router = inject(Router);

  selectedDate = new Date();
  monthStatus = signal<MonthlyClosureStatus | null>(null);
  showCloseConfirm = false;
  confirmChecked = false;
  closeNotes = '';

  ngOnInit(): void {
    this.loadClosures();
    this.checkMonthStatus();
  }

  async loadClosures(): Promise<void> {
    await this.closureService.loadClosures();
  }

  async checkMonthStatus(): Promise<void> {
    const month = this.selectedDate.getMonth() + 1;
    const year = this.selectedDate.getFullYear();
    const status = await this.closureService.checkMonthStatus(month, year);
    this.monthStatus.set(status);
  }

  onDateChange(): void {
    this.checkMonthStatus();
  }

  async generatePreview(): Promise<void> {
    const month = this.selectedDate.getMonth() + 1;
    const year = this.selectedDate.getFullYear();
    await this.closureService.generatePreview(month, year);
  }

  showCloseDialog(): void {
    this.showCloseConfirm = true;
    this.confirmChecked = false;
    this.closeNotes = '';
  }

  async confirmClose(): Promise<void> {
    const month = this.selectedDate.getMonth() + 1;
    const year = this.selectedDate.getFullYear();
    const currentUser = this.authService.currentUser();
    const closedBy = currentUser?.name || 'Unknown';

    const success = await this.closureService.closeMon(month, year, closedBy, this.closeNotes);
    if (success) {
      this.showCloseConfirm = false;
      this.checkMonthStatus();
    }
  }

  canCloseMon(): boolean {
    const preview = this.closureService.preview();
    const status = this.monthStatus();
    return preview !== null && status !== 'closed';
  }

  isAdmin(): boolean {
    return this.authService.hasRole([Role.SYSTEM_ADMIN]);
  }

  async reopenMonth(closure: any): Promise<void> {
    const currentUser = this.authService.currentUser();
    const reopenedBy = currentUser?.name || 'Unknown';
    const success = await this.closureService.reopenMonth(closure.id, reopenedBy);
    if (success) {
      this.checkMonthStatus();
    }
  }

  viewDetail(closureId: string): void {
    this.router.navigate(['/monthly-closure', closureId]);
  }

  exportClosure(closureId: string): void {
    console.log('Export closure:', closureId);
  }

  getMonthName(month: number): string {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[month - 1];
  }

  getStatusLabel(status: MonthlyClosureStatus): string {
    const labels = {
      'open': 'Abierto',
      'reviewing': 'En Revisión',
      'closed': 'Cerrado'
    };
    return labels[status];
  }

  getStatusDescription(status: MonthlyClosureStatus): string {
    const descriptions = {
      'open': 'Este mes está disponible para fichajes y modificaciones',
      'reviewing': 'Este mes está en proceso de revisión',
      'closed': 'Este mes ha sido cerrado y no permite modificaciones'
    };
    return descriptions[status];
  }

  getStatusIcon(status: MonthlyClosureStatus): string {
    const icons = {
      'open': 'lock-open',
      'reviewing': 'eye',
      'closed': 'lock'
    };
    return icons[status];
  }

  getTagSeverity(status: MonthlyClosureStatus): 'success' | 'warn' | 'secondary' {
    const severities = {
      'open': 'secondary' as const,
      'reviewing': 'warn' as const,
      'closed': 'success' as const
    };
    return severities[status];
  }
}
