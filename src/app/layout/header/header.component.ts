import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <header class="bg-surface-card/80 backdrop-blur-sm border-b border-surface-border sticky top-0 z-10">
      <div class="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <!-- Placeholder for mobile nav toggle -->
        <div></div>

        <div class="flex items-center gap-4">
            @if (currentUser(); as user) {
                <div class="text-right">
                    <p class="text-sm font-medium text-text-color">{{ user.name }}</p>
                    <p class="text-xs text-text-color-secondary">{{ user.roles.join(', ') }}</p>
                </div>
            }
          <button (click)="logout()" class="p-2 rounded-full hover:bg-gray-100" aria-label="Cerrar sesión">
            <lucide-icon name="log-out" size="20" class="text-text-color-secondary"></lucide-icon>
          </button>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  private authService = inject(AuthService);
  public currentUser = this.authService.currentUser;

  logout() {
    this.authService.logout();
  }
}
