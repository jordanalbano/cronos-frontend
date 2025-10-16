import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ClockingsService } from '../clockings/clockings.service';
import { AuthService } from '../../core/auth/auth.service';

import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { ChartComponent } from './components/chart/chart.component';
import { RecentClockingsComponent } from './components/recent-clockings/recent-clockings.component';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { AlertsPanelComponent, Alert } from './components/alerts-panel/alerts-panel.component';
import { HeatmapCalendarComponent } from './components/heatmap-calendar/heatmap-calendar.component';
import { QuickActionsComponent } from '../../shared/components/quick-actions/quick-actions.component';
import { DonutChartComponent, DonutDataItem } from './components/donut-chart/donut-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    KpiCardComponent,
    SkeletonLoaderComponent,
    ChartComponent,
    RecentClockingsComponent,
    HeroSectionComponent,
    AlertsPanelComponent,
    HeatmapCalendarComponent,
    QuickActionsComponent,
    DonutChartComponent,
  ],
  template: `
    <div class="p-4 sm:p-6 lg:p-8 pb-24">
      @if(clockingsService.loading && !clockingsService.clockings.length) {
        <div class="space-y-6">
          <app-skeleton-loader variant="hero"></app-skeleton-loader>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @for(item of [1,2,3,4]; track item) {
              <app-skeleton-loader variant="card"></app-skeleton-loader>
            }
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <app-skeleton-loader variant="chart"></app-skeleton-loader>
            <app-skeleton-loader variant="list"></app-skeleton-loader>
          </div>
        </div>
      } @else {
        <div class="space-y-8">
          <!-- Hero Section -->
          <app-hero-section
            [title]="'Horas Trabajadas Hoy'"
            [value]="todayHours()"
            [description]="'Total de horas registradas por todos los empleados en el día de hoy'"
            [iconName]="'clock'"
            [comparison]="'+12%'">
          </app-hero-section>

          <!-- KPIs -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <app-kpi-card
              title="Fichajes este Mes"
              [value]="totalClockingsThisMonth()"
              iconName="calendar-check"
              change="+5%"
              variant="primary"
              [sparklineData]="sparklineMonthly()">
            </app-kpi-card>

            <app-kpi-card
              title="Duración Promedio"
              [value]="averageClockingTime()"
              iconName="timer"
              change="-2min"
              variant="success"
              [sparklineData]="sparklineAverage()">
            </app-kpi-card>

            <app-kpi-card
              title="Empleados > Horas"
              [value]="employeesWithExceedingHours()"
              iconName="user-x"
              change="+1"
              variant="warning"
              [sparklineData]="sparklineExceeding()">
            </app-kpi-card>

            <app-kpi-card
              title="Fichajes Activos"
              [value]="activeClockings()"
              iconName="play-circle"
              change="+3"
              variant="info"
              [sparklineData]="sparklineActive()">
            </app-kpi-card>
          </div>

          <!-- Main Content Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Chart -->
            <div class="lg:col-span-2 space-y-8">
              <div class="bg-surface-card rounded-xl shadow-md border border-surface-border p-6 hover-lift animate-fade-in-up">
                <h3 class="font-semibold text-text-color mb-4">Horas trabajadas por día</h3>
                <app-chart [data]="chartData" [options]="chartOptions"></app-chart>
              </div>

              <app-heatmap-calendar [data]="heatmapData()"></app-heatmap-calendar>

              <app-donut-chart
                [title]="'Distribución de Horas por Empleado'"
                [data]="employeeHoursDistribution()"
                [showTotal]="true">
              </app-donut-chart>
            </div>

            <!-- Sidebar -->
            <div class="space-y-8">
              <div class="bg-surface-card rounded-xl shadow-md border border-surface-border p-6 hover-lift animate-fade-in-up">
                <app-recent-clockings [clockings]="recentClockings()"></app-recent-clockings>
              </div>

              <app-alerts-panel [alerts]="alerts()"></app-alerts-panel>
            </div>
          </div>
        </div>
      }

      <app-quick-actions (actionClick)="handleQuickAction($event)"></app-quick-actions>
    </div>
  `,
})
export default class DashboardComponent implements OnInit {
  public clockingsService = inject(ClockingsService);
  private authService = inject(AuthService);
  private router = inject(Router);

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
    return this.clockingsService.clockings
      .sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 5);
  });

  todayHours = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayClockings = this.clockingsService.clockings.filter((c: any) => {
      const clockingDate = new Date(c.startTime);
      clockingDate.setHours(0, 0, 0, 0);
      return clockingDate.getTime() === today.getTime() && c.status === 'completed' && c.endTime;
    });

    const totalMs = todayClockings.reduce((acc: any, c: any) => {
      return acc + (new Date(c.endTime!).getTime() - new Date(c.startTime).getTime());
    }, 0);

    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  });

  sparklineMonthly = computed(() => [45, 52, 48, 65, 58, 62, 70]);
  sparklineAverage = computed(() => [120, 115, 118, 112, 110, 108, 105]);
  sparklineExceeding = computed(() => [2, 3, 2, 3, 4, 3, 5]);
  sparklineActive = computed(() => [8, 6, 9, 7, 10, 8, 12]);

  heatmapData = computed(() => {
    const data = [];
    const today = new Date();

    for (let i = 34; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const count = this.clockingsService.clockings.filter((c: any) => {
        const clockingDate = new Date(c.startTime);
        return clockingDate.toDateString() === date.toDateString();
      }).length;

      data.push({ date, value: count });
    }

    return data;
  });

  alerts = computed((): Alert[] => {
    const alerts: Alert[] = [];
    const hoursByUser = this.clockingsService.clockings.reduce((acc: any, clocking: any) => {
      if (clocking.status === 'completed' && clocking.endTime) {
        const duration = new Date(clocking.endTime).getTime() - new Date(clocking.startTime).getTime();
        if (!acc[clocking.userId]) {
          acc[clocking.userId] = { total: 0, name: clocking.userName };
        }
        acc[clocking.userId].total += duration;
      }
      return acc;
    }, {} as Record<string, { total: number; name: string }>);

    const monthlyHourLimitInMs = 160 * 60 * 60 * 1000;
    const warningThreshold = monthlyHourLimitInMs * 0.8;

    Object.entries(hoursByUser).forEach(([userId, data]: [string, any]) => {
      if (data.total > monthlyHourLimitInMs) {
        alerts.push({
          id: `exceed-${userId}`,
          type: 'danger',
          title: 'Límite de Horas Excedido',
          message: `${data.name} ha superado el límite mensual de 160 horas`,
          timestamp: new Date(),
          actionLabel: 'Ver Detalles'
        });
      } else if (data.total > warningThreshold) {
        alerts.push({
          id: `warning-${userId}`,
          type: 'warning',
          title: 'Cerca del Límite de Horas',
          message: `${data.name} está cerca del límite mensual (${Math.round((data.total / monthlyHourLimitInMs) * 100)}%)`,
          timestamp: new Date(),
          actionLabel: 'Ver Detalles'
        });
      }
    });

    if (alerts.length === 0) {
      alerts.push({
        id: 'info-1',
        type: 'info',
        title: 'Sistema Actualizado',
        message: 'Todos los fichajes están siendo procesados correctamente',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      });
    }

    return alerts;
  });

  employeeHoursDistribution = computed((): DonutDataItem[] => {
    const hoursByUser = this.clockingsService.clockings.reduce((acc: any, clocking: any) => {
      if (clocking.status === 'completed' && clocking.endTime) {
        const duration = new Date(clocking.endTime).getTime() - new Date(clocking.startTime).getTime();
        const hours = duration / (1000 * 60 * 60);
        if (!acc[clocking.userId]) {
          acc[clocking.userId] = { name: clocking.userName, hours: 0 };
        }
        acc[clocking.userId].hours += hours;
      }
      return acc;
    }, {} as Record<string, { name: string; hours: number }>);

    return Object.values(hoursByUser)
      .map((user: any) => ({
        label: user.name,
        value: Math.round(user.hours)
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  });

  constructor() {
    this.initializeChart();
  }

  ngOnInit(): void {
    if (this.clockingsService.clockings.length === 0) {
      this.clockingsService.loadClockings();
    }
  }

  handleQuickAction(action: string): void {
    switch (action) {
      case 'new-clocking':
        this.router.navigate(['/clockings']);
        break;
      case 'view-reports':
        this.router.navigate(['/reports']);
        break;
      case 'manage-users':
        this.router.navigate(['/users']);
        break;
      case 'settings':
        break;
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
