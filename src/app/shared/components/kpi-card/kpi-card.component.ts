import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="relative overflow-hidden bg-surface-card rounded-xl shadow-md border border-surface-border hover-lift animate-fade-in-up group cursor-pointer">
      <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
           [style.background]="gradientBg"></div>

      <div class="relative p-6">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-medium text-text-color-secondary uppercase tracking-wide">{{ title }}</span>
          <div class="p-2 rounded-lg transition-all duration-300"
               [style.background]="iconBg"
               [class.scale-110]="isHovered">
            <lucide-icon [name]="iconName" size="20" [style.color]="iconColor"></lucide-icon>
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-4xl font-bold text-text-color tracking-tight">{{ value }}</p>

          @if(change) {
            <div class="flex items-center gap-1">
              <lucide-icon
                [name]="change.startsWith('+') ? 'trending-up' : 'trending-down'"
                size="14"
                [class]="change.startsWith('+') ? 'text-success-color' : 'text-danger-color'">
              </lucide-icon>
              <span class="text-sm font-medium"
                    [class]="change.startsWith('+') ? 'text-success-color' : 'text-danger-color'">
                {{ change }}
              </span>
              <span class="text-xs text-text-color-muted">vs mes anterior</span>
            </div>
          }

          @if(sparklineData && sparklineData.length > 0) {
            <div class="mt-3 h-8">
              <svg class="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 30">
                <polyline
                  [attr.points]="sparklinePoints"
                  fill="none"
                  [attr.stroke]="iconColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="transition-all duration-500"
                />
                <polyline
                  [attr.points]="sparklinePoints"
                  [attr.fill]="sparklineFill"
                  opacity="0.2"
                  class="transition-all duration-500"
                />
              </svg>
            </div>
          }
        </div>
      </div>

      <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r"
           [style.background]="gradientBg"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class KpiCardComponent {
  @Input() title: string = 'Title';
  @Input() value: string = '0';
  @Input() iconName: string = 'alert-circle';
  @Input() change!: string;
  @Input() sparklineData: number[] = [];
  @Input() variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' = 'primary';

  isHovered = false;

  get gradientBg(): string {
    const gradients = {
      primary: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(96, 165, 250, 0.05) 100%)',
      success: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(52, 211, 153, 0.05) 100%)',
      warning: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(251, 191, 36, 0.05) 100%)',
      danger: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(248, 113, 113, 0.05) 100%)',
      info: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.05) 100%)'
    };
    return gradients[this.variant];
  }

  get iconBg(): string {
    const backgrounds = {
      primary: 'rgba(37, 99, 235, 0.1)',
      success: 'rgba(16, 185, 129, 0.1)',
      warning: 'rgba(245, 158, 11, 0.1)',
      danger: 'rgba(239, 68, 68, 0.1)',
      info: 'rgba(59, 130, 246, 0.1)'
    };
    return backgrounds[this.variant];
  }

  get iconColor(): string {
    const colors = {
      primary: '#2563eb',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6'
    };
    return colors[this.variant];
  }

  get sparklinePoints(): string {
    if (!this.sparklineData || this.sparklineData.length === 0) return '';

    const max = Math.max(...this.sparklineData);
    const min = Math.min(...this.sparklineData);
    const range = max - min || 1;

    return this.sparklineData
      .map((value, index) => {
        const x = (index / (this.sparklineData.length - 1)) * 100;
        const y = 30 - ((value - min) / range) * 25;
        return `${x},${y}`;
      })
      .join(' ');
  }

  get sparklineFill(): string {
    if (!this.sparklineData || this.sparklineData.length === 0) return '';
    return `${this.sparklinePoints} 100,30 0,30`;
  }
}
