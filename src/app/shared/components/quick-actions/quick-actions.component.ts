import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed bottom-8 right-8 z-50 flex flex-col-reverse items-end gap-3">
      @if(isExpanded) {
        <div class="flex flex-col-reverse gap-2 animate-fade-in-up">
          @for(action of actions; track action.label) {
            <button
              (click)="handleAction(action.action)"
              class="group flex items-center gap-3 bg-surface-card hover:bg-primary hover:text-white text-text-color px-4 py-3 rounded-full shadow-lg border border-surface-border transition-all hover-lift">
              <span class="text-sm font-medium whitespace-nowrap">{{ action.label }}</span>
              <div class="p-2 rounded-full bg-surface-hover group-hover:bg-white/20 transition-colors">
                <lucide-icon [name]="action.icon" size="18"></lucide-icon>
              </div>
            </button>
          }
        </div>
      }

      <button
        (click)="toggleExpanded()"
        class="group relative p-4 bg-gradient-to-br from-primary to-primary-dark text-white rounded-full shadow-xl hover:shadow-glow transition-all hover:scale-110"
        [class.rotate-45]="isExpanded">
        <lucide-icon [name]="isExpanded ? 'x' : 'plus'" size="28" strokeWidth="2.5"></lucide-icon>

        @if(!isExpanded) {
          <div class="absolute -top-1 -right-1 w-3 h-3 bg-danger-color rounded-full animate-pulse"></div>
        }
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }

    button {
      cursor: pointer;
    }

    .rotate-45 {
      transform: rotate(45deg);
    }
  `]
})
export class QuickActionsComponent {
  @Output() actionClick = new EventEmitter<string>();

  isExpanded = false;

  actions = [
    { label: 'Nuevo Fichaje', icon: 'clock', action: 'new-clocking' },
    { label: 'Ver Reportes', icon: 'bar-chart-3', action: 'view-reports' },
    { label: 'Gestionar Usuarios', icon: 'users', action: 'manage-users' },
    { label: 'Configuración', icon: 'settings', action: 'settings' }
  ];

  toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  handleAction(action: string) {
    this.actionClick.emit(action);
    this.isExpanded = false;
  }
}
