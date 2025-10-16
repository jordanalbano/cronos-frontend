import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';

import { Clocking } from '../../../../shared/models/clocking.model';
import { Role } from '../../../../shared/models/roles.enum';
import { FormatDurationPipe } from '../../../../shared/pipes/format-duration.pipe';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-clockings-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    FormatDurationPipe,
    InputTextModule,
    LucideAngularModule
  ],
  providers: [ConfirmationService],
  template: `
    <p-confirmDialog [style]="{width: '450px'}"></p-confirmDialog>
    <p-table #dt [value]="clockings" [rows]="10" [paginator]="true" [globalFilterFields]="['userName','description']"
             [tableStyle]="{'min-width': '75rem'}"
             responsiveLayout="scroll"
             [rowsPerPageOptions]="[10,25,50]"
             currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} fichajes"
             styleClass="p-datatable-gridlines">
      <ng-template pTemplate="caption">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 class="text-xl font-semibold text-text-color">Historial de Fichajes</h2>
          <span class="p-input-icon-left w-full sm:w-auto">
              <i class="pi pi-search"></i>
              <input pInputText type="text" (input)="dt.filterGlobal($any($event.target).value, 'contains')" placeholder="Buscar..." class="w-full" />
          </span>
        </div>
      </ng-template>
      <ng-template pTemplate="header">
        <tr>
          <th pSortableColumn="userName">Usuario <p-sortIcon field="userName"></p-sortIcon></th>
          <th pSortableColumn="startTime">Inicio <p-sortIcon field="startTime"></p-sortIcon></th>
          <th pSortableColumn="endTime">Fin <p-sortIcon field="endTime"></p-sortIcon></th>
          <th>Duración</th>
          <th pSortableColumn="status">Estado <p-sortIcon field="status"></p-sortIcon></th>
          <th>Acciones</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-clocking let-i="rowIndex">
        <tr>
          <td>{{ clocking.userName }}</td>
          <td>{{ clocking.startTime | date:'short' }}</td>
          <td>{{ clocking.endTime ? (clocking.endTime | date:'short') : '-' }}</td>
          <td>{{ clocking | formatDuration }}</td>
          <td>
            <p-tag [value]="clocking.status" [severity]="getSeverity(clocking.status)"></p-tag>
          </td>
          <td>
            <div class="flex gap-2">
              @if (canManage() && clocking.status === 'in-progress') {
                <button pButton pRipple icon="pi pi-stop-circle" class="p-button-rounded p-button-success"
                        pTooltip="Finalizar fichaje" (click)="onEnd(clocking.id)"></button>
              }
              @if (canManage()) {
                <button pButton pRipple icon="pi pi-trash" class="p-button-rounded p-button-danger"
                        pTooltip="Eliminar fichaje" (click)="onDelete(clocking.id)"></button>
              }
            </div>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr>
            <td colspan="6" class="text-center p-8">
              <div class="text-text-color-secondary">
                <lucide-icon name="clipboard-x" size="48" class="mx-auto mb-4"></lucide-icon>
                <p>No se encontraron fichajes.</p>
                <p class="text-sm mt-2">Registra tu primer fichaje para empezar.</p>
              </div>
            </td>
        </tr>
      </ng-template>
    </p-table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClockingsListComponent {
  @Input({ required: true }) clockings: Clocking[] = [];
  @Input({ required: true }) userRoles: Role[] = [];
  @Output() endClocking = new EventEmitter<string>();
  @Output() deleteClocking = new EventEmitter<string>();

  constructor(private confirmationService: ConfirmationService) {}

  canManage = computed(() =>
    this.userRoles.includes(Role.SYSTEM_ADMIN) ||
    this.userRoles.includes(Role.RRHH) ||
    this.userRoles.includes(Role.CLOCKING_ADMIN)
  );

  trackById(index: number, item: Clocking): string {
    return item.id;
  }

  getSeverity(status: 'in-progress' | 'completed'): 'info' | 'success' {
    return status === 'in-progress' ? 'info' : 'success';
  }

  onEnd(id: string): void {
    this.endClocking.emit(id);
  }

  onDelete(id: string): void {
    this.confirmationService.confirm({
        message: '¿Estás seguro de que quieres eliminar este fichaje?',
        header: 'Confirmación de eliminación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, eliminar',
        rejectLabel: 'No',
        accept: () => {
            this.deleteClocking.emit(id);
        }
    });
  }
}
