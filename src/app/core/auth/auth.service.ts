import { Injectable, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../shared/models/user.model';
import { Role } from '../../shared/models/roles.enum';

interface AuthState {
  user: User | null;
  token: string | null;
}

// Mock users for development
const MOCK_USERS: Record<string, User> = {
  admin: { id: '1', name: 'Admin Chronos', email: 'admin@chronos.dev', roles: [Role.SYSTEM_ADMIN] },
  rrhh: { id: '2', name: 'Laura RRHH', email: 'rrhh@chronos.dev', roles: [Role.RRHH, Role.EMPLOYEE] },
  employee: { id: '3', name: 'Juan Empleado', email: 'juan@chronos.dev', roles: [Role.EMPLOYEE] },
  fichador: { id: '6', name: 'Pedro Fichador', email: 'fichador@chronos.dev', roles: [Role.FICHADOR] },
};
const MOCK_TOKEN = 'MOCK_JWT_TOKEN';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly state = signal<AuthState>({
    user: null,
    token: null,
  });

  // Public signals
  public readonly currentUser = computed(() => this.state().user);
  public readonly isLoggedIn = computed(() => !!this.state().user);
  public readonly token = computed(() => this.state().token);

  constructor(private router: Router) {
    // Rehydrate state from localStorage on startup
    const savedState = localStorage.getItem('chronos_auth_state');
    if (savedState) {
      this.state.set(JSON.parse(savedState));
    }

    // Persist state to localStorage whenever it changes
    effect(() => {
      localStorage.setItem('chronos_auth_state', JSON.stringify(this.state()));
    });
  }

  /**
   * Simulates a login. In a real app, this would call Keycloak.
   * @param userType The type of mock user to log in as.
   */
  login(userType: 'admin' | 'rrhh' | 'employee' | 'fichador'): void {
    const user = MOCK_USERS[userType];
    if (user) {
      this.state.set({ user, token: MOCK_TOKEN });
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Logs the user out.
   */
  logout(): void {
    this.state.set({ user: null, token: null });
    this.router.navigate(['/login']);
  }

  /**
   * Gets the current auth token.
   * @returns The token or null.
   */
  getToken(): string | null {
    return this.token();
  }

  /**
   * Checks if the current user has at least one of the specified roles.
   * @param requiredRoles Array of roles to check against.
   * @returns True if the user has any of the required roles.
   */
  hasRole(requiredRoles: Role[]): boolean {
    const user = this.currentUser();
    if (!user || !user.roles) {
      return false;
    }
    return requiredRoles.some(role => user.roles.includes(role));
  }
}
