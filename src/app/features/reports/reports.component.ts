import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// App Components & Services
import { CardComponent } from '../../shared/components/card/card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { ReportsService } from './reports.service';
import { UsersService } from '../users/users.service';
import { AuthService } from '../../core/auth/auth.service';
import { Role } from '../../shared/models/roles.enum';
import { User } from '../../shared/models/user.model';
import { MonthlyReportItem } from '../../shared/models/report.model';
import { LucideAngularModule } from 'lucide-angular';

// PDF/CSV Export
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {DatePicker} from "primeng/datepicker";
import {Select} from "primeng/select";


@Component({
  selector: 'app-reports',
  standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DatePipe,
        TableModule,
        ButtonModule,
        TooltipModule,
        CardComponent,
        SpinnerComponent,
        LucideAngularModule,
        DatePicker,
        Select
    ],
  providers: [DatePipe],
  template: `
    <div class="p-4 sm:p-6 lg:p-8">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-text-color">Reportes Mensuales</h1>
        <p class="text-text-color-secondary mt-1">Analiza y exporta los datos de fichajes.</p>
      </header>

      <app-card>
        <form [formGroup]="filterForm" class="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <!-- Month/Year Filter -->
          <div class="flex flex-col">
            <label for="date" class="font-medium text-sm mb-2">Mes y Año</label>
            <p-date-picker formControlName="date" view="month" dateFormat="mm/yy" [readonlyInput]="true" inputId="date"></p-date-picker>
          </div>

          <!-- User Filter -->
          @if (canFilterByUser()) {
            <div class="flex flex-col md:col-span-2">
              <label for="userId" class="font-medium text-sm mb-2">Empleado</label>
              @if(usersService.loading) {
                <div class="h-10 flex items-center"><app-spinner></app-spinner></div>
              } @else {
                <p-select formControlName="userId" [options]="users" optionLabel="name" optionValue="id"
                            placeholder="Todos los empleados" [showClear]="true" inputId="userId"></p-select>
              }
            </div>
          }

          <!-- Action Button -->
          <div class="flex items-end">
             <!-- This space is for alignment -->
          </div>
        </form>
      </app-card>

      <div class="mt-8">
        @if (reportsService.loading) {
          <div class="flex justify-center p-16"><app-spinner></app-spinner></div>
        } @else {
          <p-table #dt [value]="reports" [rows]="10" [paginator]="true" [globalFilterFields]="['userName']"
                   [tableStyle]="{'min-width': '60rem'}" responsiveLayout="scroll" styleClass="p-datatable-gridlines"
                   currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros">
            <ng-template pTemplate="caption">
              <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 class="text-xl font-semibold">Reporte de {{ filterForm.value.date | date:'MMMM yyyy' }}</h3>
                <div class="flex gap-2">
                  <button pButton label="Exportar CSV" icon="pi pi-file" class="p-button-text" (click)="exportCsv()"></button>
                  <button pButton label="Exportar PDF" icon="pi pi-file-pdf" class="p-button-text p-button-danger" (click)="exportPdf()"></button>
                </div>
              </div>
            </ng-template>
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="userName">Empleado <p-sortIcon field="userName"></p-sortIcon></th>
                <th pSortableColumn="date">Fecha <p-sortIcon field="date"></p-sortIcon></th>
                <th pSortableColumn="totalHours" class="text-right">Horas Totales <p-sortIcon field="totalHours"></p-sortIcon></th>
                <th pSortableColumn="exceededHours" class="text-right">Horas Excedidas <p-sortIcon field="exceededHours"></p-sortIcon></th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-item>
              <tr>
                <td>{{ item.userName }}</td>
                <td>{{ item.date | date:'dd/MM/yyyy' }}</td>
                <td class="text-right">{{ item.totalHours.toFixed(2) }}h</td>
                <td class="text-right font-medium" [class.text-red-500]="item.exceededHours > 0">
                  {{ item.exceededHours.toFixed(2) }}h
                </td>
              </tr>
            </ng-template>
             <ng-template pTemplate="summary">
                <div class="flex flex-col sm:flex-row justify-end items-center gap-6 p-2 font-bold">
                    <div class="text-right">
                        <span>Total Horas Excedidas: </span>
                        <span class="text-red-500 text-lg">{{ totalExceededHours() | number:'1.2-2' }}h</span>
                    </div>
                    <div class="text-right">
                        <span>Total Horas Mes: </span>
                        <span class="text-primary text-lg">{{ totalHours() | number:'1.2-2' }}h</span>
                    </div>
                </div>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="4" class="text-center p-8">
                  <div class="text-text-color-secondary">
                    <lucide-icon name="file-text" size="48" class="mx-auto mb-4"></lucide-icon>
                    <p>No hay datos para los filtros seleccionados.</p>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        }
      </div>
    </div>
  `,
})
export default class ReportsComponent {
  public reportsService = inject(ReportsService);
  public usersService = inject(UsersService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private datePipe = inject(DatePipe);
  private messageService = inject(MessageService);

  filterForm = this.fb.group({
    date: [new Date()],
    userId: [''],
  });

  users = this.usersService.users;
  reports = this.reportsService.reports;
  currentUser = this.authService.currentUser;

  canFilterByUser = computed(() => this.authService.hasRole([Role.SYSTEM_ADMIN, Role.RRHH]));

  totalHours = computed(() => this.reports.reduce((acc, item) => acc + item.totalHours, 0));
  totalExceededHours = computed(() => this.reports.reduce((acc, item) => acc + item.exceededHours, 0));

  constructor() {
    // Initial data load
    this.usersService.loadUsers();

    // Effect to react to filter changes
    effect(() => {
      const filters = this.filterForm.value;
      const date = filters.date || new Date();
      const month = date.getMonth();
      const year = date.getFullYear();
      let userId = this.canFilterByUser() ? filters.userId : this.currentUser()?.id;
      
      this.reportsService.loadReports({ month, year, userId: userId || undefined });
    });

    // Set initial user for non-admins
    if (!this.canFilterByUser()) {
      this.filterForm.controls.userId.disable();
    }
  }

  exportCsv() {
    const data = this.reports;
    if (data.length === 0) {
      this.messageService.add({severity:'warn', summary: 'Advertencia', detail: 'No hay datos para exportar.'});
      return;
    }

    const headers = ['Empleado', 'Fecha', 'Horas Totales', 'Horas Excedidas'];
    const csvArray = [
      headers.join(','),
      ...data.map((item:any) => [
        `"${item.userName}"`,
        this.datePipe.transform(item.date, 'dd/MM/yyyy'),
        item.totalHours.toFixed(2),
        item.exceededHours.toFixed(2)
      ].join(','))
    ];

    const blob = new Blob([csvArray.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'reporte_chronos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.messageService.add({severity:'success', summary: 'Éxito', detail: 'Reporte CSV descargado.'});
  }

  exportPdf() {
    const data = this.reports;
     if (data.length === 0) {
      this.messageService.add({severity:'warn', summary: 'Advertencia', detail: 'No hay datos para exportar.'});
      return;
    }

    const doc = new jsPDF();
    const headers = [['Empleado', 'Fecha', 'Horas Totales', 'Horas Excedidas']];
    const body = data.map((item:any) => [
      item.userName,
      this.datePipe.transform(item.date, 'dd/MM/yyyy'),
      `${item.totalHours.toFixed(2)}h`,
      `${item.exceededHours.toFixed(2)}h`
    ]);

    doc.text(`Reporte de Fichajes - ${this.datePipe.transform(this.filterForm.value.date, 'MMMM yyyy')}`, 14, 15);

    autoTable(doc, {
      head: headers,
      body: body,
      startY: 20,
      theme: 'grid',
      headStyles: { fillColor: [102, 126, 234] } // --primary-color
    });

    doc.save('reporte_chronos.pdf');
    this.messageService.add({severity:'success', summary: 'Éxito', detail: 'Reporte PDF descargado.'});
  }
}
