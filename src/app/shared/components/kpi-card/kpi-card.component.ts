import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CardComponent],
  template: `
    <app-card>
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-text-color-secondary">{{ title }}</span>
        <lucide-icon [name]="iconName" size="20" class="text-text-color-secondary"></lucide-icon>
      </div>
      <div class="mt-2">
        <p class="text-3xl font-bold text-text-color">{{ value }}</p>
        @if(change) {
          <p class="text-xs mt-1" [ngClass]="change.startsWith('+') ? 'text-green-500' : 'text-red-500'">
            {{ change }} vs mes anterior
          </p>
        }
      </div>
    </app-card>
  `,
})
export class KpiCardComponent {
  @Input() title: string = 'Title';
  @Input() value: string = '0';
  @Input() iconName: string = 'alert-circle';
  @Input() change!: string;
}
