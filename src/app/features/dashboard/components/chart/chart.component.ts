import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [ChartModule],
  template: `
    <div class="h-96">
      <p-chart type="bar" [data]="data" [options]="options"></p-chart>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartComponent {
  @Input() data: any;
  @Input() options: any;
}
