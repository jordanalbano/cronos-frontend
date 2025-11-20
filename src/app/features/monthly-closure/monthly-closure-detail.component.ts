import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';

import { CardComponent } from '../../shared/components/card/card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { MonthlyClosureService } from './monthly-closure.service';
import { AuthService } from '../../core/auth/auth.service';
import { Role } from '../../shared/models/roles.enum';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-monthly-closure-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    TagModule,
    DialogModule,
    TextareaModule,
    CardComponent,
    SpinnerComponent,
    BadgeComponent,
    LucideAngularModule
  ],
  template: `
    <div class="p-4 sm:p-6 lg:p-8">
      @if (closureService.loading()) {
        <div class="flex justify-center p-16">
          <app-spinner></app-spinner>
        </div>
      } @else if (closureService.currentClosure(); as closure) {
        <div class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-4">
              <p-button
                icon="pi pi-arrow-left"
                [text]="true"
                (onClick)="goBack()">
              </p-button>
              <div>
                <h1 class="text-3xl font-bold text-text-color">
                  Cierre de {{ getMonthName(closure.month) }} {{ closure.year }}
                </h1>
                <p class="text-text-color-secondary mt-1">
                  Cerrado el {{ closure.closedAt | date:'dd/MM/yyyy HH:mm' }} por {{ closure.closedBy }}
                </p>
              </div>
            </div>
            <p-tag
              [value]="getStatusLabel(closure.status)"
              [severity]="getTagSeverity(closure.status)">
            </p-tag>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <app-card>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-text-color-secondary mb-1">Total Empleados</p>
                <p class="text-2xl font-bold text-text-color">{{ closure.totalEmployees }}</p>
              </div>
              <lucide-icon name="users" [size]="32" class="text-primary-500 opacity-50"></lucide-icon>
            </div>
          </app-card>

          <app-card>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-text-color-secondary mb-1">Horas Totales</p>
                <p class="text-2xl font-bold text-text-color">{{ closure.totalHours | number:'1.2-2' }}h</p>
              </div>
              <lucide-icon name="clock" [size]="32" class="text-blue-500 opacity-50"></lucide-icon>
            </div>
          </app-card>

          <app-card>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-text-color-secondary mb-1">Empleados Excedidos</p>
                <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ closure.employeesExceeded }}</p>
              </div>
              <lucide-icon name="alert-triangle" [size]="32" class="text-red-500 opacity-50"></lucide-icon>
            </div>
          </app-card>

          <app-card>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-text-color-secondary mb-1">Horas Excedidas</p>
                <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ closure.totalExceededHours | number:'1.2-2' }}h</p>
              </div>
              <lucide-icon name="trending-up" [size]="32" class="text-red-500 opacity-50"></lucide-icon>
            </div>
          </app-card>
        </div>

        @if (closure.notes) {
          <app-card class="mb-6">
            <div class="flex items-start gap-3">
              <lucide-icon name="sticky-note" [size]="20" class="text-primary-600 dark:text-primary-400 mt-1"></lucide-icon>
              <div class="flex-1">
                <p class="font-medium text-text-color mb-2">Notas del Cierre</p>
                <p class="text-text-color-secondary">{{ closure.notes }}</p>
              </div>
            </div>
          </app-card>
        }

        <app-card>
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-text-color">Detalle por Empleado</h2>
            <div class="flex gap-2">
              <p-button
                label="Exportar PDF"
                icon="pi pi-file-pdf"
                severity="danger"
                [outlined]="true"
                (onClick)="exportPdf()">
              </p-button>
              <p-button
                label="Exportar Excel"
                icon="pi pi-file-excel"
                severity="success"
                [outlined]="true"
                (onClick)="exportExcel()">
              </p-button>
            </div>
          </div>

          <p-table
            [value]="closure.details"
            [rows]="10"
            [paginator]="true"
            [globalFilterFields]="['userName', 'userEmail']"
            responsiveLayout="scroll"
            styleClass="p-datatable-gridlines"
            sortField="exceededHours"
            [sortOrder]="-1">
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="userName">Empleado <p-sortIcon field="userName"></p-sortIcon></th>
                <th pSortableColumn="totalClockings" class="text-center">Fichajes <p-sortIcon field="totalClockings"></p-sortIcon></th>
                <th pSortableColumn="totalMonthlyHours" class="text-right">Horas Totales <p-sortIcon field="totalMonthlyHours"></p-sortIcon></th>
                <th class="text-right">Límite</th>
                <th pSortableColumn="exceededHours" class="text-right">Excedidas <p-sortIcon field="exceededHours"></p-sortIcon></th>
                <th class="text-center">Estado</th>
                <th class="text-center">Acciones</th>
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
                <td class="text-center">
                  @if (canEditNotes()) {
                    <p-button
                      icon="pi pi-comment"
                      [text]="true"
                      [rounded]="true"
                      pTooltip="Añadir nota"
                      (onClick)="showNotesDialog(detail)">
                    </p-button>
                  }
                  @if (detail.notes) {
                    <lucide-icon
                      name="message-square"
                      [size]="16"
                      class="text-primary-600 dark:text-primary-400 ml-2 cursor-pointer"
                      pTooltip="{{ detail.notes }}">
                    </lucide-icon>
                  }
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="7" class="text-center p-8">
                  <div class="text-text-color-secondary">
                    <lucide-icon name="inbox" [size]="48" class="mx-auto mb-4"></lucide-icon>
                    <p>No hay detalles disponibles</p>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </app-card>
      } @else {
        <app-card>
          <div class="text-center p-8">
            <lucide-icon name="alert-circle" [size]="48" class="mx-auto mb-4 text-text-color-secondary"></lucide-icon>
            <p class="text-text-color-secondary">No se encontró el cierre mensual</p>
            <p-button
              label="Volver"
              [text]="true"
              (onClick)="goBack()"
              class="mt-4">
            </p-button>
          </div>
        </app-card>
      }
    </div>

    <p-dialog
      [(visible)]="showNotes"
      header="Notas del Empleado"
      [modal]="true"
      [style]="{ width: '500px' }">
      @if (selectedDetail) {
        <div class="space-y-4">
          <div>
            <p class="font-medium text-text-color mb-2">{{ selectedDetail.userName }}</p>
            <p class="text-sm text-text-color-secondary">{{ selectedDetail.userEmail }}</p>
          </div>

          <div>
            <label for="detailNotes" class="block font-medium text-sm mb-2 text-text-color">Notas</label>
            <textarea
              id="detailNotes"
              pTextarea
              [(ngModel)]="detailNotes"
              rows="4"
              placeholder="Añade observaciones sobre este empleado..."
              class="w-full">
            </textarea>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <p-button
            label="Cancelar"
            [text]="true"
            (onClick)="showNotes = false">
          </p-button>
          <p-button
            label="Guardar"
            (onClick)="saveDetailNotes()">
          </p-button>
        </ng-template>
      }
    </p-dialog>
  `,
})
export default class MonthlyClosureDetailComponent implements OnInit {
  public closureService = inject(MonthlyClosureService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  showNotes = false;
  selectedDetail: any = null;
  detailNotes = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.closureService.loadClosureWithDetails(id);
    }
  }

  goBack(): void {
    this.router.navigate(['/monthly-closure']);
  }

  canEditNotes(): boolean {
    return this.authService.hasRole([Role.RRHH, Role.SYSTEM_ADMIN]);
  }

  showNotesDialog(detail: any): void {
    this.selectedDetail = detail;
    this.detailNotes = detail.notes || '';
    this.showNotes = true;
  }

  async saveDetailNotes(): Promise<void> {
    if (this.selectedDetail) {
      await this.closureService.updateDetailNotes(this.selectedDetail.id, this.detailNotes);
      this.showNotes = false;

      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.closureService.loadClosureWithDetails(id);
      }
    }
  }

  exportPdf(): void {
    console.log('Export PDF');
  }

  exportExcel(): void {
    console.log('Export Excel');
  }

  getMonthName(month: number): string {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[month - 1];
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'open': 'Abierto',
      'reviewing': 'En Revisión',
      'closed': 'Cerrado'
    };
    return labels[status] || status;
  }

  getTagSeverity(status: string): 'success' | 'warn' | 'secondary' {
    const severities: Record<string, 'success' | 'warn' | 'secondary'> = {
      'open': 'secondary',
      'reviewing': 'warn',
      'closed': 'success'
    };
    return severities[status] || 'secondary';
  }
}
