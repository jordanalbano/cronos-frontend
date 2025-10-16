import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeSeverity = 'success' | 'info' | 'warning' | 'danger' | 'neutral';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [ngClass]="badgeClasses()">
      {{ label }}
    </span>
  `,
})
export class BadgeComponent {
  @Input() label: string = '';
  @Input() severity: BadgeSeverity = 'neutral';

  badgeClasses = computed(() => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const colorClasses = {
      success: 'bg-green-100 text-green-800',
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      danger: 'bg-red-100 text-red-800',
      neutral: 'bg-gray-100 text-gray-800',
    };
    return `${baseClasses} ${colorClasses[this.severity]}`;
  });
}
