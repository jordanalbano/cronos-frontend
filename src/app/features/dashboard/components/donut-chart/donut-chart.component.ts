import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';

export interface DonutDataItem {
  label: string;
  value: number;
  color?: string;
}

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [CommonModule, ChartModule],
  template: `
    <div class="bg-surface-card rounded-xl shadow-md border border-surface-border p-6 hover-lift animate-fade-in-up">
      <h3 class="font-semibold text-text-color mb-6">{{ title }}</h3>

      <div class="flex flex-col lg:flex-row items-center gap-8">
        <div class="w-64 h-64 flex-shrink-0">
          <p-chart type="doughnut" [data]="chartData" [options]="chartOptions"></p-chart>
        </div>

        <div class="flex-1 w-full">
          <div class="space-y-3">
            @for(item of data; track item.label; let i = $index) {
              <div class="flex items-center justify-between p-3 rounded-lg hover:bg-surface-hover transition-colors">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <div class="w-4 h-4 rounded-full flex-shrink-0" [style.background-color]="getColor(i)"></div>
                  <span class="text-sm font-medium text-text-color truncate">{{ item.label }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-sm font-bold text-text-color">{{ item.value }}h</span>
                  <span class="text-xs text-text-color-muted">{{ getPercentage(item.value) }}%</span>
                </div>
              </div>
            }
          </div>

          @if(showTotal) {
            <div class="mt-6 pt-4 border-t border-surface-border">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-text-color-secondary">Total</span>
                <span class="text-xl font-bold text-text-color">{{ getTotalValue() }}h</span>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DonutChartComponent implements OnInit {
  @Input() title: string = 'Distribución';
  @Input() data: DonutDataItem[] = [];
  @Input() showTotal: boolean = true;

  chartData: any;
  chartOptions: any;

  private colors = [
    '#2563eb',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f97316'
  ];

  ngOnInit() {
    this.initializeChart();
  }

  private initializeChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    this.chartData = {
      labels: this.data.map(d => d.label),
      datasets: [{
        data: this.data.map(d => d.value),
        backgroundColor: this.data.map((d, i) => d.color || this.colors[i % this.colors.length]),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };

    this.chartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const value = context.parsed || 0;
              const percentage = this.getPercentage(value);
              return `${label}: ${value}h (${percentage}%)`;
            }
          }
        }
      }
    };
  }

  getColor(index: number): string {
    return this.data[index]?.color || this.colors[index % this.colors.length];
  }

  getTotalValue(): number {
    return this.data.reduce((sum, item) => sum + item.value, 0);
  }

  getPercentage(value: number): number {
    const total = this.getTotalValue();
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }
}
