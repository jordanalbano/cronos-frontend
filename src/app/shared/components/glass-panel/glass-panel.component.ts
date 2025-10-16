import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-glass-panel',
  standalone: true,
  imports: [],
  template: `
    <div class="p-6 sm:p-8">
      <ng-content></ng-content>
    </div>
  `,
})
export class GlassPanelComponent {
  @HostBinding('class') classes = 'glass';
}
