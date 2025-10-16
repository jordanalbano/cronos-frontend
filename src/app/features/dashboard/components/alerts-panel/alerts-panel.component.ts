import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

export interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  timestamp?: Date;
  actionLabel?: string;
}

@Component({
  selector: 'app-alerts-panel',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-surface-card rounded-xl shadow-md border border-surface-border overflow-hidden animate-fade-in-up">
      <div class="px-6 py-4 border-b border-surface-border bg-gradient-to-r from-surface-ground to-surface-card">
        <div class="flex items-center gap-2">
          <lucide-icon name="alert-triangle" size="20" class="text-warning-color"></lucide-icon>
          <h3 class="font-semibold text-text-color">Alertas y Notificaciones</h3>
          @if(alerts.length > 0) {
            <span class="ml-auto px-2 py-1 bg-warning-color/10 text-warning-color text-xs font-medium rounded-full">
              {{ alerts.length }}
            </span>
          }
        </div>
      </div>

      <div class="divide-y divide-surface-border max-h-96 overflow-y-auto">
        @for(alert of alerts; track alert.id) {
          <div class="p-4 hover:bg-surface-hover transition-colors cursor-pointer group">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 mt-0.5">
                <div class="p-2 rounded-lg" [ngClass]="getAlertBgClass(alert.type)">
                  <lucide-icon
                    [name]="getAlertIcon(alert.type)"
                    size="18"
                    [ngClass]="getAlertIconClass(alert.type)">
                  </lucide-icon>
                </div>
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <h4 class="font-medium text-text-color text-sm">{{ alert.title }}</h4>
                  @if(alert.timestamp) {
                    <span class="text-xs text-text-color-muted flex-shrink-0">
                      {{ getTimeAgo(alert.timestamp) }}
                    </span>
                  }
                </div>

                <p class="text-sm text-text-color-secondary mt-1 line-clamp-2">
                  {{ alert.message }}
                </p>

                @if(alert.actionLabel) {
                  <button class="mt-2 text-xs font-medium hover:underline transition-all"
                          [ngClass]="getAlertActionClass(alert.type)">
                    {{ alert.actionLabel }}
                    <lucide-icon name="arrow-right" size="12" class="inline ml-1"></lucide-icon>
                  </button>
                }
              </div>
            </div>
          </div>
        } @empty {
          <div class="p-8 text-center">
            <lucide-icon name="check-circle" size="48" class="text-success-color mx-auto mb-3"></lucide-icon>
            <p class="text-text-color-secondary font-medium">No hay alertas pendientes</p>
            <p class="text-text-color-muted text-sm mt-1">Todo está funcionando correctamente</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class AlertsPanelComponent {
  @Input() alerts: Alert[] = [];

  getAlertIcon(type: string): string {
    const icons = {
      warning: 'alert-circle',
      danger: 'alert-octagon',
      info: 'info'
    };
    return icons[type as keyof typeof icons] || 'bell';
  }

  getAlertBgClass(type: string): string {
    const classes = {
      warning: 'bg-warning-color/10',
      danger: 'bg-danger-color/10',
      info: 'bg-info-color/10'
    };
    return classes[type as keyof typeof classes] || 'bg-surface-hover';
  }

  getAlertIconClass(type: string): string {
    const classes = {
      warning: 'text-warning-color',
      danger: 'text-danger-color',
      info: 'text-info-color'
    };
    return classes[type as keyof typeof classes] || 'text-text-color-secondary';
  }

  getAlertActionClass(type: string): string {
    const classes = {
      warning: 'text-warning-color',
      danger: 'text-danger-color',
      info: 'text-info-color'
    };
    return classes[type as keyof typeof classes] || 'text-primary';
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `Hace ${diffInDays}d`;
  }
}
