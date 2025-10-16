import { Injectable, signal } from '@angular/core';
import { MonthlyHoursConfig } from '../../shared/models/monthly-hours-config.model';

interface ConfigState {
  config: MonthlyHoursConfig | null;
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class MonthlyHoursConfigService {
  private mockConfig: MonthlyHoursConfig = {
    id: '1',
    monthlyHours: 160,
    updatedAt: new Date(),
    updatedBy: 'Admin'
  };

  private state = signal<ConfigState>({
    config: null,
    loading: false,
    error: null,
  });

  public readonly config = () => this.state().config;
  public readonly loading = () => this.state().loading;
  public readonly error = () => this.state().error;

  loadConfig(): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));

    setTimeout(() => {
      this.state.update(s => ({
        ...s,
        config: { ...this.mockConfig },
        loading: false
      }));
    }, 300);
  }

  updateConfig(monthlyHours: number, updatedBy: string): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));

    setTimeout(() => {
      this.mockConfig = {
        ...this.mockConfig,
        monthlyHours,
        updatedAt: new Date(),
        updatedBy
      };

      this.state.update(s => ({
        ...s,
        config: { ...this.mockConfig },
        loading: false
      }));
    }, 500);
  }
}
