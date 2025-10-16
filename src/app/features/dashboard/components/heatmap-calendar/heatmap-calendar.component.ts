import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface HeatmapDay {
  date: Date;
  value: number;
  intensity: number;
}

@Component({
  selector: 'app-heatmap-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-surface-card rounded-xl shadow-md border border-surface-border p-6 animate-fade-in-up">
      <div class="flex items-center justify-between mb-6">
        <h3 class="font-semibold text-text-color">Intensidad de Fichajes</h3>
        <div class="flex items-center gap-2 text-xs text-text-color-secondary">
          <span>Menos</span>
          <div class="flex gap-1">
            @for(level of [0, 1, 2, 3, 4]; track level) {
              <div class="w-3 h-3 rounded-sm" [style.background-color]="getColorForIntensity(level)"></div>
            }
          </div>
          <span>Más</span>
        </div>
      </div>

      <div class="overflow-x-auto">
        <div class="inline-grid gap-1" [style.grid-template-columns]="'repeat(7, minmax(0, 1fr))'">
          @for(day of calendarDays; track day.date.toISOString()) {
            <div
              class="aspect-square rounded-sm hover:ring-2 hover:ring-primary transition-all cursor-pointer group relative"
              [style.background-color]="getColorForIntensity(day.intensity)"
              [title]="getTooltip(day)">
              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="text-[10px] font-bold text-white drop-shadow-lg">{{ day.value }}</span>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="mt-4 text-xs text-text-color-muted text-center">
        Últimos 35 días
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class HeatmapCalendarComponent implements OnInit {
  @Input() data: { date: Date; value: number }[] = [];

  calendarDays: HeatmapDay[] = [];
  maxValue = 0;

  ngOnInit() {
    this.generateCalendar();
  }

  private generateCalendar() {
    const days: HeatmapDay[] = [];
    const today = new Date();
    const dataMap = new Map(this.data.map(d => [this.formatDate(d.date), d.value]));

    this.maxValue = Math.max(...this.data.map(d => d.value), 1);

    for (let i = 34; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = this.formatDate(date);
      const value = dataMap.get(dateKey) || 0;

      days.push({
        date,
        value,
        intensity: this.calculateIntensity(value)
      });
    }

    this.calendarDays = days;
  }

  private calculateIntensity(value: number): number {
    if (value === 0) return 0;
    const percentage = value / this.maxValue;
    if (percentage <= 0.25) return 1;
    if (percentage <= 0.5) return 2;
    if (percentage <= 0.75) return 3;
    return 4;
  }

  getColorForIntensity(intensity: number): string {
    const colors = [
      '#e5e7eb',
      '#93c5fd',
      '#60a5fa',
      '#3b82f6',
      '#2563eb'
    ];
    return colors[intensity] || colors[0];
  }

  getTooltip(day: HeatmapDay): string {
    const dateStr = day.date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
    return `${dateStr}: ${day.value} fichajes`;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
