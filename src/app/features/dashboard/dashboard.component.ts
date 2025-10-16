import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClockingsService } from '../clockings/clockings.service';
import { AuthService } from '../../core/auth/auth.service';

import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { GlassPanelComponent } from '../../shared/components/glass-panel/glass-panel.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { ChartComponent } from './components/chart/chart.component';
import { RecentClockingsComponent } from './components/recent-clockings/recent-clockings.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    KpiCardComponent,
    GlassPanelComponent,
    SpinnerComponent,
    CardComponent,
    ChartComponent,
  ],
  template: `
    <div class="p-4 sm:p-6 lg:p-8">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-text-color">Titulo</h1>
        <p class="text-text-color-secondary mt-1">Bienvenido</p>
      </header>

      @if(clockingsService.loading && !clockingsService.clockings.length) {
        <div class="flex justify-center p-16"><app-spinner></app-spinner></div>
      } @else {
        <div class="space-y-8">
          <!-- KPIs -->
          <app-glass-panel>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <app-kpi-card title="Fichajes este Mes" [value]="totalClockingsThisMonth()" iconName="calendar-check" change="+5%"></app-kpi-card>
              <!--<app-kpi-card title="Fichajes Activos" [value]="activeclockings" iconName="play-circle" change=""></app-kpi-card>-->
              <app-kpi-card title="Duración Promedio" [value]="averageClockingTime()" iconName="timer" change="-2min"></app-kpi-card>
              <app-kpi-card title="Empleados > Horas" [value]="employeesWithExceedingHours()" iconName="user-x" change="+1"></app-kpi-card>
            </div>
          </app-glass-panel>

          <!-- Chart and Recent Activity -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-2">
              <app-card>
                <h3 class="font-semibold text-text-color mb-4">Horas trabajadas por día</h3>
                <app-chart [data]="chartData" [options]="chartOptions"></app-chart>
              </app-card>
            </div>
            <div>
              <app-card>
                <!--<app-recent-clockings [clockings]="recentclockings"></app-recent-clockings>-->
              </app-card>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export default class DashboardComponent implements OnInit {
  public clockingsService = inject(ClockingsService);
  private authService = inject(AuthService);

  chartData: any;
  chartOptions: any;

  // --- Signals ---
  currentUserName = computed(() => this.authService.currentUser()?.name || 'Usuario');

  totalClockingsThisMonth = computed(() => {
    const clockings = this.clockingsService.clockings;
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return clockings.filter((c:any) => new Date(c.startTime) >= firstDayOfMonth).length.toString();
  });

  activeClockings = computed(() => {
    return this.clockingsService.clockings.filter((c:any) => c.status === 'in-progress').length.toString();
  });

  averageClockingTime = computed(() => {
    const completed = this.clockingsService.clockings.filter((c:any) => c.status === 'completed' && c.endTime);
    if (completed.length === 0) return '0m';

    const totalMs = completed.reduce((acc:any, c:any) => acc + (new Date(c.endTime!).getTime() - new Date(c.startTime).getTime()), 0);
    const avgMinutes = (totalMs / completed.length) / (1000 * 60);
    return `${Math.round(avgMinutes)}m`;
  });

  employeesWithExceedingHours = computed(() => {
    const hoursByUser = this.clockingsService.clockings.reduce((acc:any, clocking:any) => {
        if(clocking.status === 'completed' && clocking.endTime) {
            const duration = new Date(clocking.endTime).getTime() - new Date(clocking.startTime).getTime();
            acc[clocking.userId] = (acc[clocking.userId] || 0) + duration;
        }
        return acc;
    }, {} as Record<string, number>);

    const monthlyHourLimitInMs = 160 * 60 * 60 * 1000;
    return Object.values(hoursByUser).filter((totalMs:any) => totalMs > monthlyHourLimitInMs).length.toString();
  });

  recentClockings = computed(() => {
    return this.clockingsService.clockings.slice(0, 5);
  });

  constructor() {
    this.initializeChart();
  }

  ngOnInit(): void {
    if (this.clockingsService.clockings.length === 0) {
      this.clockingsService.loadClockings();
    }
  }

  private initializeChart(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartData = {
        labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
        datasets: [
            {
                label: 'Horas Trabajadas',
                backgroundColor: documentStyle.getPropertyValue('--primary-color'),
                borderColor: documentStyle.getPropertyValue('--primary-color'),
                data: [65, 59, 80, 81, 56, 55, 40] // Mock data
            }
        ]
    };

    this.chartOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                ticks: { color: textColorSecondary },
                grid: { color: surfaceBorder, drawBorder: false }
            },
            y: {
                ticks: { color: textColorSecondary },
                grid: { color: surfaceBorder, drawBorder: false }
            }
        }
    };
  }
}
