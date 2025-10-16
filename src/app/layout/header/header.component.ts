import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { MobileMenuService } from '../../core/services/mobile-menu.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <header class="border-b border-surface-border sticky top-0 z-20">
      <div class="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          (click)="toggleMobileMenu()"
          class="lg:hidden p-2 primary-color rounded-lg hover:bg-surface-hover transition-colors"
          aria-label="Toggle menu"
          [attr.aria-expanded]="mobileMenuService.isOpen()">
          @if (mobileMenuService.isOpen()) {
            <lucide-icon name="x" size="24" class="text-text-color"></lucide-icon>
          } @else {
            <lucide-icon name="menu" size="24" class="text-text-color"></lucide-icon>
          }
        </button>

        <div class="hidden lg:block"></div>

        <div class="flex items-center gap-4">
            @if (currentUser(); as user) {
                <div class="text-right">
                    <p class="text-sm font-medium text-text-color">{{ user.name }}</p>
                    <p class="text-xs text-text-color-secondary">{{ user.roles.join(', ') }}</p>
                </div>
            }
          <button (click)="logout()" class="p-2 rounded-full hover:bg-surface-hover transition-colors" aria-label="Cerrar sesión">
            <lucide-icon name="log-out" size="20" class="text-text-color-secondary"></lucide-icon>
          </button>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  private authService = inject(AuthService);
  public mobileMenuService = inject(MobileMenuService);
  public currentUser = this.authService.currentUser;

  toggleMobileMenu() {
    this.mobileMenuService.toggle();
  }

  logout() {
    this.authService.logout();
  }
}
