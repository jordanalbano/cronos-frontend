import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-surface-card p-6 rounded-lg shadow-md border border-surface-border">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardComponent {}
