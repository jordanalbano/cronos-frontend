import {Component, inject, signal, computed, effect} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {ReactiveFormsModule, FormBuilder} from '@angular/forms';

// App imports
import {EmployeeHistoryService} from './employee-history.service';
import {UsersService} from '../users/users.service';
import {CardComponent} from '../../shared/components/card/card.component';
import {SpinnerComponent} from '../../shared/components/spinner/spinner.component';
import {KpiCardComponent} from '../../shared/components/kpi-card/kpi-card.component';
import {FormatDurationPipe} from '../../shared/pipes/format-duration.pipe';

// PrimeNG imports
import {TableModule} from 'primeng/table';
import {TagModule} from 'primeng/tag';
import {Select} from "primeng/select";
import {LucideAngularModule} from "lucide-angular";

@Component({
    selector: 'app-employee-history',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        DatePipe,
        CardComponent,
        SpinnerComponent,
        KpiCardComponent,
        TableModule,
        TagModule,
        FormatDurationPipe,
        Select,
        LucideAngularModule
    ],
    providers: [DatePipe],
    template: `
        <div class="p-4 sm:p-6 lg:p-8">
            <header class="mb-8">
                <h1 class="text-3xl font-bold text-text-color">Historial de Empleado</h1>
                <p class="text-text-color-secondary mt-1">Consulta el detalle de fichajes y estadísticas por
                    empleado.</p>
            </header>

            <app-card>
                <div class="p-4">
                    <label for="employee" class="font-medium text-sm mb-2 block">Seleccionar Empleado</label>
                    @if (usersService.loading) {
                        <div class="h-10 flex items-center">
                            <app-spinner></app-spinner>
                        </div>
                    } @else {
                        <p-select [formControl]="selectedEmployeeControl" [options]="usersService.users"
                                    optionLabel="name" optionValue="id" placeholder="Selecciona un empleado"
                                    inputId="employee" class="w-full md:w-1/3"></p-select>
                    }
                </div>
            </app-card>

            @if (historyService.loading) {
                <div class="flex justify-center p-16">
                    <app-spinner></app-spinner>
                </div>
            }

            @if (selectedEmployeeControl.value && !historyService.loading) {
                <div class="mt-8 space-y-8">
                    <!-- KPIs -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <app-kpi-card title="Fichajes Totales" [value]="stats().totalClockings" iconName="clock"
                                      change=""></app-kpi-card>
                        <app-kpi-card title="Horas Totales" [value]="stats().totalHours" iconName="bar-chart-3"
                                      change=""></app-kpi-card>
                        <app-kpi-card title="Duración Promedio" [value]="stats().averageDuration" iconName="timer"
                                      change=""></app-kpi-card>
                        <app-kpi-card title="Última Actividad" [value]="stats().lastActivity" iconName="calendar-check"
                                      change=""></app-kpi-card>
                    </div>

                    <!-- Clockings Table -->
                    <app-card>
                        <p-table [value]="historyService.history" [rows]="10" [paginator]="true"
                                 responsiveLayout="scroll"
                                 styleClass="p-datatable-gridlines" [tableStyle]="{'min-width': '60rem'}">
                            <ng-template pTemplate="header">
                                <tr>
                                    <th pSortableColumn="startTime">Inicio
                                        <p-sortIcon field="startTime"></p-sortIcon>
                                    </th>
                                    <th pSortableColumn="endTime">Fin
                                        <p-sortIcon field="endTime"></p-sortIcon>
                                    </th>
                                    <th>Duración</th>
                                    <th>Descripción</th>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="body" let-clocking>
                                <tr>
                                    <td>{{ clocking.startTime | date:'dd/MM/yy, HH:mm' }}</td>
                                    <td>{{ clocking.endTime ? (clocking.endTime | date:'short') : '-' }}</td>
                                    <td>
                                        @if (clocking.status === 'completed') {
                                            <span class="font-mono">{{ clocking | formatDuration }}</span>
                                        } @else {
                                            <p-tag value="En curso" severity="info"></p-tag>
                                        }
                                    </td>
                                    <td>{{ clocking.description }}</td>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="emptymessage">
                                <tr>
                                    <td colspan="4" class="text-center p-8">Este empleado no tiene fichajes
                                        registrados.
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </app-card>
                </div>
            } @else if (!historyService.loading) {
                <div class="text-center p-16 text-text-color-secondary">
                    <lucide-icon name="users" size="48" class="mx-auto mb-4"></lucide-icon>
                    <p>Selecciona un empleado para ver su historial.</p>
                </div>
            }
        </div>
    `
})
export default class EmployeeHistoryComponent {
    public historyService = inject(EmployeeHistoryService);
    public usersService = inject(UsersService);
    private fb = inject(FormBuilder);
    private datePipe = inject(DatePipe);

    selectedEmployeeControl = this.fb.control<string | null>(null);

    stats = computed(() => {
        const history = this.historyService.history;
        if (history.length === 0) {
            return {totalClockings: '0', totalHours: '0h', averageDuration: '0m', lastActivity: '-'};
        }

        const completed = history.filter((c:any) => c.status === 'completed' && c.endTime);
        const totalMs = completed.reduce((acc: any, c: any) => acc + (new Date(c.endTime!).getTime() - new Date(c.startTime).getTime()), 0);
        const totalHours = totalMs / (1000 * 60 * 60);
        const avgMs = completed.length > 0 ? totalMs / completed.length : 0;
        const avgMinutes = avgMs / (1000 * 60);
        const lastActivity = this.datePipe.transform(history[0].startTime, 'mediumDate');

        return {
            totalClockings: history.length.toString(),
            totalHours: `${totalHours.toFixed(1)}h`,
            averageDuration: `${Math.round(avgMinutes)}m`,
            lastActivity: lastActivity || '-'
        };
    });

    constructor() {
        this.usersService.loadUsers();
        effect(() => {
            const selectedId = this.selectedEmployeeControl.value;
            if (selectedId) {
                this.historyService.loadHistory(selectedId);
            } else {
                this.historyService.clearHistory();
            }
        });
    }
}
