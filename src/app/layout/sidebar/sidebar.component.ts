import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Role } from '../../shared/models/roles.enum';
import { LucideAngularModule } from 'lucide-angular';

interface NavItem {
  labelKey: string;
  icon: string;
  route: string;
  requiredRoles: Role[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <aside class="w-64 flex-shrink-0 bg-surface-card border-r border-surface-border flex-col hidden lg:flex">
      <div class="h-16 flex items-center justify-center border-b border-surface-border">
        <h1 class="text-2xl font-bold text-primary">Titasd</h1>
      </div>
      <nav class="flex-1 px-4 py-6 space-y-2">
        @for(item of visibleNavItems(); track item.route) {
          <a [routerLink]="item.route" routerLinkActive="bg-primary/10 text-primary" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-text-color-secondary hover:bg-gray-50 hover:text-text-color transition-colors">
            <lucide-icon [name]="item.icon" size="20"></lucide-icon>
            <span>label leas</span>
          </a>
        }
      </nav>
      <div class="p-4 border-t border-surface-border">
          <a routerLink="/design" routerLinkActive="bg-primary/10 text-primary" class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-text-color-secondary hover:bg-gray-50 hover:text-text-color transition-colors">
            <lucide-icon name="palette" size="20"></lucide-icon>
            <span>navvar</span>
          </a>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  private authService = inject(AuthService);
  
  private allNavItems: NavItem[] = [
    { labelKey: 'NAV_DASHBOARD', icon: 'layout-dashboard', route: '/dashboard', requiredRoles: [Role.EMPLOYEE, Role.RRHH, Role.SYSTEM_ADMIN] },
    { labelKey: 'NAV_MY_CLOCKINGS', icon: 'clock', route: '/clockings', requiredRoles: [Role.EMPLOYEE] },
    { labelKey: 'NAV_EMPLOYEE_HISTORY', icon: 'history', route: '/employee-history', requiredRoles: [Role.RRHH, Role.SYSTEM_ADMIN] },
    { labelKey: 'NAV_REPORTS', icon: 'bar-chart-3', route: '/reports', requiredRoles: [Role.RRHH, Role.SYSTEM_ADMIN] },
    { labelKey: 'NAV_USERS', icon: 'users', route: '/users', requiredRoles: [Role.SYSTEM_ADMIN] },
  ];

  public visibleNavItems = computed(() => 
    this.allNavItems.filter(item => this.authService.hasRole(item.requiredRoles))
  );
}
