import { Injectable, signal, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { MonthlyReportItem } from '../../shared/models/report.model';
import { ApiService } from '../../core/services/api.service';

interface ReportState {
  reports: MonthlyReportItem[];
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private readonly API_PATH = '/reports';

  private state = signal<ReportState>({
    reports: [],
    loading: false,
    error: null,
  });

  public readonly reports = this.state().reports;
  public readonly loading = this.state().loading;
  public readonly error = this.state().error;

  loadReports(filters: { month: number, year: number, userId?: string }): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));

    let params = new HttpParams()
      .set('month', filters.month.toString())
      .set('year', filters.year.toString());

    if (filters.userId) {
      params = params.set('userId', filters.userId);
    }

    this.apiService.get<MonthlyReportItem[]>(this.API_PATH, params).pipe(
      catchError(err => {
        const message = 'No se pudieron cargar los reportes.';
        this.state.update(s => ({ ...s, error: message, reports: [] }));
        this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
        return of([]);
      }),
      finalize(() => this.state.update(s => ({ ...s, loading: false })))
    ).subscribe(reports => {
      this.state.update(s => ({ ...s, reports }));
    });
  }
}
