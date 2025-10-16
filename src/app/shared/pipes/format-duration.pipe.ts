import { Pipe, PipeTransform } from '@angular/core';
import { Clocking } from '../models/clocking.model';

@Pipe({
  name: 'formatDuration',
  standalone: true
})
export class FormatDurationPipe implements PipeTransform {

  transform(clocking: Clocking): string {
    if (clocking.status === 'in-progress' || !clocking.endTime) {
      return '-';
    }

    const start = new Date(clocking.startTime).getTime();
    const end = new Date(clocking.endTime).getTime();
    let diff = Math.floor((end - start) / 1000);

    const hours = Math.floor(diff / 3600);
    diff %= 3600;
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
}
