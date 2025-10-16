import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Users, Clock, BarChart, AlertTriangle } from 'lucide-angular';

import { GlassPanelComponent } from '../../shared/components/glass-panel/glass-panel.component';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-design-system',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    GlassPanelComponent,
    KpiCardComponent,
    CardComponent,
    BadgeComponent,
    SpinnerComponent
  ],
  template: `
    <div class="p-4 sm:p-6 lg:p-8">
      <h1 class="text-3xl font-bold text-text-color mb-6">Design System Showcase</h1>

      <!-- Glassmorphism KPI Section -->
      <h2 class="text-xl font-semibold text-text-color mb-4">KPIs con Glassmorphism</h2>
      <app-glass-panel>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <app-kpi-card title="Empleados Activos" value="142" iconName="users" change="+2"></app-kpi-card>
          <app-kpi-card title="Horas Registradas (Hoy)" value="678" iconName="clock" change="-5%"></app-kpi-card>
          <app-kpi-card title="Ausencias (Mes)" value="12" iconName="alert-triangle" change="+10%"></app-kpi-card>
          <app-kpi-card title="Reportes Generados" value="34" iconName="bar-chart" change="+3"></app-kpi-card>
        </div>
      </app-glass-panel>

      <!-- Components Section -->
      <div class="mt-10">
        <h2 class="text-xl font-semibold text-text-color mb-4">Componentes Base</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

          <!-- Color Palette -->
          <app-card>
            <h3 class="font-semibold mb-4 text-text-color">Paleta de Colores</h3>
            <div class="space-y-3">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-lg bg-primary"></div>
                <div>
                  <p class="font-medium">Primary</p>
                  <p class="text-sm text-text-color-secondary">#667eea</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-lg bg-surface-card border"></div>
                <div>
                  <p class="font-medium">Surface Card</p>
                  <p class="text-sm text-text-color-secondary">#ffffff</p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-lg bg-surface-ground border"></div>
                <div>
                  <p class="font-medium">Surface Ground</p>
                  <p class="text-sm text-text-color-secondary">#f8f9fa</p>
                </div>
              </div>
            </div>
          </app-card>

          <!-- Badges & Spinners -->
          <app-card>
            <h3 class="font-semibold mb-4 text-text-color">Badges & Spinners</h3>
            <div class="flex flex-wrap items-center gap-4">
              <app-badge label="Success" severity="success"></app-badge>
              <app-badge label="Info" severity="info"></app-badge>
              <app-badge label="Warning" severity="warning"></app-badge>
              <app-badge label="Danger" severity="danger"></app-badge>
              <app-badge label="Neutral" severity="neutral"></app-badge>
            </div>
            <div class="mt-6">
              <app-spinner></app-spinner>
            </div>
          </app-card>
        </div>
      </div>
    </div>
  `,
})
export default class DesignSystemComponent {}
