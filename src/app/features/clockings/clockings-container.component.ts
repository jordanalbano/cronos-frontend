import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClockingsService } from './clockings.service';
import { AuthService } from '../../core/auth/auth.service';
import { ClockingFormComponent } from './components/clocking-form/clocking-form.component';
import { ClockingsListComponent } from './components/clockings-list/clockings-list.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { Clocking } from '../../shared/models/clocking.model';
import { Role } from '../../shared/models/roles.enum';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';

@Component({
  selector: 'app-clockings-container',
  standalone: true,
  imports: [
    CommonModule,
    ClockingFormComponent,
    ClockingsListComponent,
    CardComponent,
    SpinnerComponent,
    KpiCardComponent
  ],
  template: `
    <div class="p-4 sm:p-6 lg:p-8">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-text-color">Gestión de Fichajes</h1>
        <p class="text-text-color-secondary mt-1">Registra tus entradas/salidas y consulta tu historial.</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <app-kpi-card title="Horas este mes" [value]="monthlyHours()" iconName="clock" change="+5%"></app-kpi-card>
        <app-kpi-card title="Horas extra" [value]="extraHours()" iconName="alert-triangle" change="+1h"></app-kpi-card>
        <app-kpi-card title="Fichajes en curso" [value]="inProgressCount()" iconName="users" change=""></app-kpi-card>
      </div>

      <app-card>
        <app-clocking-form [showEmployeeSelector]="isFichador()" (addClocking)="onAddClocking($event)"></app-clocking-form>
      </app-card>

      <div class="mt-8">
        @if (clockingsService.loading) {
          <div class="flex justify-center p-16">
            <app-spinner></app-spinner>
          </div>
        } @else if (clockingsService.error) {
          <div class="text-center text-red-500 p-8">
            <p>Error al cargar los fichajes:</p>
            <p class="text-sm">{{ clockingsService.error }}</p>
          </div>
        } @else {
          <app-clockings-list
            [clockings]="clockingsService.clockings"
            [userRoles]="userRoles()"
            (endClocking)="onEndClocking($event)"
            (deleteClocking)="onDeleteClocking($event)">
          </app-clockings-list>
        }
      </div>
    </div>
  `,
})
export default class ClockingsContainerComponent implements OnInit {
  public clockingsService = inject(ClockingsService);
  private authService = inject(AuthService);

  public userRoles = computed(() => this.authService.currentUser()?.roles || []);
  public isFichador = computed(() => this.userRoles().includes(Role.FICHADOR));

  public monthlyHours = computed(() => {
    const totalMs = this.clockingsService.clockings
      .filter(c => c.status === 'completed' && c.endTime)
      .reduce((acc, c) => {
        const start = new Date(c.startTime).getTime();
        const end = new Date(c.endTime!).getTime();
        return acc + (end - start);
      }, 0);
    const hours = totalMs / (1000 * 60 * 60);
    return `${hours.toFixed(1)}h`;
  });

  public extraHours = computed(() => {
     // Mock logic, max 4h/month
     const totalMs = this.clockingsService.clockings
     .filter(c => c.status === 'completed' && c.endTime)
     .reduce((acc, c) => acc + (new Date(c.endTime!).getTime() - new Date(c.startTime).getTime()), 0);
     const totalHours = totalMs / (1000 * 60 * 60);
     const exceeded = Math.max(0, totalHours - 160); // Assuming 160h/month
     return `${exceeded.toFixed(1)}h`;
  });

  public inProgressCount = computed(() => {
    return this.clockingsService.clockings.filter((c:any) => c.status === 'in-progress').length.toString();
  });

  ngOnInit(): void {
    this.clockingsService.loadClockings();
  }

  onAddClocking(clocking: Partial<Clocking> & { userId?: string }): void {
    this.clockingsService.addClocking(clocking);
  }

  onEndClocking(id: string): void {
    this.clockingsService.endClocking(id);
  }

  onDeleteClocking(id: string): void {
    this.clockingsService.deleteClocking(id);
  }
}
