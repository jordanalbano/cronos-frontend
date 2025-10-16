import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Clocking } from '../../../../shared/models/clocking.model';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { FormatDurationPipe } from '../../../../shared/pipes/format-duration.pipe';

@Component({
  selector: 'app-recent-clockings',
  standalone: true,
  imports: [CommonModule, BadgeComponent, FormatDurationPipe],
  template: `
    <h3 class="font-semibold text-text-color mb-4">Actividad Reciente</h3>
    <ul class="space-y-4">
      @for(clocking of clockings; track clocking.id) {
        <li class="flex items-center justify-between gap-4">
          <div class="flex-1 min-w-0">
            <p class="font-medium text-text-color truncate">{{ clocking.userName }}</p>
            <p class="text-sm text-text-color-secondary truncate">{{ clocking.description }}</p>
          </div>
          <div class="flex-shrink-0 text-right">
            @if(clocking.status === 'completed') {
              <span class="text-sm font-mono text-text-color-secondary">{{ clocking | formatDuration }}</span>
            } @else {
              <app-badge label="En curso" severity="info"></app-badge>
            }
          </div>
        </li>
      } @empty {
        <p class="text-sm text-text-color-secondary text-center py-4">No hay actividad reciente.</p>
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentClockingsComponent {
  @Input() clockings: Clocking[] = [];
}
