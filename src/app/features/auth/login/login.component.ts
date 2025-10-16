import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { GlassPanelComponent } from '../../../shared/components/glass-panel/glass-panel.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GlassPanelComponent],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop');">
      <app-glass-panel>
        <div class="w-full max-w-sm p-4">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-primary">Titulo</h1>
            <p class="text-text-color-secondary">Subtitulo</p>
          </div>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label for="userType" class="block text-sm font-medium text-text-color">Simular login</label>
              <select formControlName="userType" id="userType" class="mt-1 block w-full px-3 py-2 bg-white border border-surface-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm">
                <option value="employee">Empleado (Juan)</option>
                <option value="rrhh">RRHH (Laura)</option>
                <option value="admin">Admin (Chronos)</option>
                <option value="fichador">Fichador (Pedro)</option>
              </select>
            </div>
            <button type="submit" [disabled]="loginForm.invalid" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">
              Boton de login
            </button>
          </form>
          <p class="mt-6 text-center text-xs text-text-color-secondary">
            Nota de login
          </p>
        </div>
      </app-glass-panel>
    </div>
  `,
})
export default class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    userType: ['employee' as 'admin' | 'rrhh' | 'employee' | 'fichador', Validators.required]
  });

  constructor() {
    // If already logged in, redirect to dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const userType = this.loginForm.value.userType!;
      this.authService.login(userType);
    }
  }
}
