import { Injectable, signal, inject } from '@angular/core';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { User } from '../../shared/models/user.model';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../core/services/api.service';

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private readonly API_PATH = '/users';

  private state = signal<UserState>({
    users: [],
    loading: false,
    error: null,
  });

  public readonly users = this.state().users;
  public readonly loading = this.state().loading;
  public readonly error = this.state().error;

  loadUsers(): void {
    // Avoid reloading if already populated and not loading
    if (this.state().users.length > 0 && !this.state().loading) return;

    this.state.update(s => ({ ...s, loading: true, error: null }));

    this.apiService.get<User[]>(this.API_PATH).pipe(
      catchError(err => {
        const message = 'No se pudieron cargar los usuarios.';
        this.state.update(s => ({ ...s, error: message, users: [] }));
        this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
        return of([]);
      }),
      finalize(() => this.state.update(s => ({ ...s, loading: false })))
    ).subscribe(users => {
      this.state.update(s => ({ ...s, users }));
    });
  }

  addUser(user: Omit<User, 'id'>): void {
    this.apiService.post<User>(this.API_PATH, user).pipe(
      catchError(err => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el usuario.' });
        return of(null);
      })
    ).subscribe(newUser => {
      if (newUser) {
        this.state.update(s => ({ ...s, users: [...s.users, newUser] }));
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado correctamente.' });
      }
    });
  }

  updateUser(user: User): void {
    this.apiService.put<User>(`${this.API_PATH}/${user.id}`, user).pipe(
      catchError(err => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el usuario.' });
        return of(null);
      })
    ).subscribe(updatedUser => {
      if (updatedUser) {
        this.state.update(s => ({
          ...s,
          users: s.users.map(u => u.id === user.id ? updatedUser : u)
        }));
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado correctamente.' });
      }
    });
  }

  deleteUser(id: string): void {
    this.apiService.delete(`${this.API_PATH}/${id}`).pipe(
      catchError(err => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el usuario.' });
        return of(null);
      })
    ).subscribe(response => {
      if (response !== null) {
        this.state.update(s => ({
          ...s,
          users: s.users.filter(u => u.id !== id)
        }));
        this.messageService.add({ severity: 'warn', summary: 'Eliminado', detail: 'Usuario eliminado correctamente.' });
      }
    });
  }
}
