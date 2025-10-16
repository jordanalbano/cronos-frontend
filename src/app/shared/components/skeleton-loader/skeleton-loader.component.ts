import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if(variant === 'card') {
      <div class="bg-surface-card rounded-xl p-6 border border-surface-border animate-pulse">
        <div class="flex items-center justify-between mb-4">
          <div class="h-4 bg-surface-hover rounded w-1/3"></div>
          <div class="h-8 w-8 bg-surface-hover rounded-lg"></div>
        </div>
        <div class="space-y-3">
          <div class="h-10 bg-surface-hover rounded w-2/3"></div>
          <div class="h-3 bg-surface-hover rounded w-1/2"></div>
        </div>
      </div>
    }

    @if(variant === 'chart') {
      <div class="bg-surface-card rounded-xl p-6 border border-surface-border animate-pulse">
        <div class="h-6 bg-surface-hover rounded w-1/4 mb-6"></div>
        <div class="space-y-4">
          <div class="flex items-end gap-2 h-64">
            @for(item of [1,2,3,4,5,6,7]; track item) {
              <div class="flex-1 bg-surface-hover rounded-t"
                   [style.height.%]="getRandomHeight()"></div>
            }
          </div>
        </div>
      </div>
    }

    @if(variant === 'list') {
      <div class="bg-surface-card rounded-xl p-6 border border-surface-border animate-pulse">
        <div class="h-6 bg-surface-hover rounded w-1/3 mb-4"></div>
        <div class="space-y-4">
          @for(item of [1,2,3,4,5]; track item) {
            <div class="flex items-center gap-4">
              <div class="h-12 w-12 bg-surface-hover rounded-full"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-surface-hover rounded w-3/4"></div>
                <div class="h-3 bg-surface-hover rounded w-1/2"></div>
              </div>
            </div>
          }
        </div>
      </div>
    }

    @if(variant === 'hero') {
      <div class="animate-pulse space-y-4">
        <div class="h-8 bg-surface-hover rounded w-1/3"></div>
        <div class="h-20 bg-surface-hover rounded w-1/2"></div>
        <div class="h-4 bg-surface-hover rounded w-2/3"></div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() variant: 'card' | 'chart' | 'list' | 'hero' = 'card';

  getRandomHeight(): number {
    return Math.floor(Math.random() * 60) + 40;
  }
}
