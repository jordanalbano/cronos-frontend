import { Component } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [],
  template: `
    <div class="flex justify-center items-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class SpinnerComponent {}
