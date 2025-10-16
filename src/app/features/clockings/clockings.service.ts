import { Injectable, signal, inject } from '@angular/core';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';

import { Clocking } from '../../shared/models/clocking.model';
import { ApiService } from '../../core/services/api.service';

interface ClockingState {
  clockings: Clocking[];
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ClockingsService {
  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private readonly API_PATH = '/clockings';

  // State signal
  private state = signal<ClockingState>({
    clockings: [],
    loading: false,
    error: null,
  });

  // Public selectors from state
  public readonly clockings = this.state().clockings;
  public readonly loading = this.state().loading;
  public readonly error = this.state().error;

  constructor() {}

  loadClockings(): void {
    this.state.update(s => ({ ...s, loading: true, error: null }));
    this.apiService.get<Clocking[]>(this.API_PATH).pipe(
      catchError(err => {
        const message = 'No se pudieron cargar los fichajes.';
        this.state.update(s => ({ ...s, error: message }));
        this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
        return of([]);
      }),
      finalize(() => this.state.update(s => ({ ...s, loading: false })))
    ).subscribe(clockings => {
      this.state.update(s => ({ ...s, clockings }));
    });
  }

  addClocking(newClockingData: Partial<Clocking>): void {
    this.apiService.post<Clocking>(this.API_PATH, newClockingData).pipe(
      catchError(err => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el fichaje.' });
        return of(null);
      })
    ).subscribe(newClocking => {
      if (newClocking) {
        this.state.update(s => ({ ...s, clockings: [newClocking, ...s.clockings] }));
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Fichaje iniciado.' });
      }
    });
  }

  endClocking(id: string): void {
    this.apiService.put<Clocking>(`${this.API_PATH}/${id}`, {}).pipe(
      catchError(err => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo finalizar el fichaje.' });
        return of(null);
      })
    ).subscribe(updatedClocking => {
      if (updatedClocking) {
        this.state.update(s => ({
          ...s,
          clockings: s.clockings.map(c => c.id === id ? updatedClocking : c)
        }));
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Fichaje finalizado.' });
      }
    });
  }

  deleteClocking(id: string): void {
    this.apiService.delete(`${this.API_PATH}/${id}`).pipe(
      catchError(err => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el fichaje.' });
        return of(null);
      })
    ).subscribe(response => {
      if (response !== null) {
        this.state.update(s => ({
          ...s,
          clockings: s.clockings.filter(c => c.id !== id)
        }));
        this.messageService.add({ severity: 'warn', summary: 'Eliminado', detail: 'Fichaje eliminado correctamente.' });
      }
    });
  }
}
