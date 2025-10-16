import { Injectable, signal, inject } from '@angular/core';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Clocking } from '../../shared/models/clocking.model';
import { ApiService } from '../../core/services/api.service';

interface HistoryState {
  history: Clocking[];
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeHistoryService {
  private apiService = inject(ApiService);
  private messageService = inject(MessageService);

  private state = signal<HistoryState>({
    history: [],
    loading: false,
    error: null,
  });

  public readonly history = this.state().history;
  public readonly loading = this.state().loading;
  public readonly error = this.state().error;

  loadHistory(userId: string): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    const path = `/users/${userId}/history`;

    this.apiService.get<Clocking[]>(path).pipe(
      catchError(err => {
        const message = 'No se pudo cargar el historial del empleado.';
        this.state.update(s => ({ ...s, error: message, history: [] }));
        this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
        return of([]);
      }),
      finalize(() => this.state.update(s => ({ ...s, loading: false })))
    ).subscribe(history => {
      this.state.update(s => ({ ...s, history }));
    });
  }

  clearHistory(): void {
    this.state.set({ history: [], loading: false, error: null });
  }
}
