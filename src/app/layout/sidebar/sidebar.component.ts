import { Component, computed, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { MobileMenuService } from '../../core/services/mobile-menu.service';
import { Role } from '../../shared/models/roles.enum';
import { LucideAngularModule } from 'lucide-angular';
import { filter } from 'rxjs/operators';

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
    <aside
      [class]="sidebarClasses()"
      class="w-64 flex-shrink-0 bg-surface-card border-r border-surface-border flex-col transition-transform duration-300 ease-in-out lg:translate-x-0">
      <div class="h-16 flex items-center justify-center border-b border-surface-border">
        <h1 class="text-2xl font-bold text-primary">Titasd</h1>
      </div>
      <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        @for(item of visibleNavItems(); track item.route) {
          <a
            [routerLink]="item.route"
            routerLinkActive="bg-primary/10 text-primary"
            (click)="onNavItemClick()"
            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-text-color-secondary hover:bg-surface-hover hover:text-text-color transition-colors">
            <lucide-icon [name]="item.icon" size="20"></lucide-icon>
            <span>{{item.labelKey}}</span>
          </a>
        }
      </nav>
      <div class="p-4 border-t border-surface-border">
          <a
            routerLink="/design"
            routerLinkActive="bg-primary/10 text-primary"
            (click)="onNavItemClick()"
            class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-text-color-secondary hover:bg-surface-hover hover:text-text-color transition-colors">
            <lucide-icon name="palette" size="20"></lucide-icon>
            <span>diseño</span>
          </a>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  private authService = inject(AuthService);
  public mobileMenuService = inject(MobileMenuService);
  private router = inject(Router);

  private allNavItems: NavItem[] = [
    { labelKey: 'Dashboard', icon: 'layout-dashboard', route: '/dashboard', requiredRoles: [Role.EMPLOYEE, Role.RRHH, Role.SYSTEM_ADMIN, Role.FICHADOR] },
    { labelKey: 'Fichadas', icon: 'clock', route: '/clockings', requiredRoles: [Role.EMPLOYEE, Role.FICHADOR] },
    { labelKey: 'Historial de empleados', icon: 'history', route: '/employee-history', requiredRoles: [Role.RRHH, Role.SYSTEM_ADMIN] },
    { labelKey: 'Reportes', icon: 'bar-chart-3', route: '/reports', requiredRoles: [Role.RRHH, Role.SYSTEM_ADMIN] },
    { labelKey: 'Empleados', icon: 'users', route: '/users', requiredRoles: [Role.SYSTEM_ADMIN] },
    { labelKey: 'Configuracion de horas', icon: 'settings', route: '/monthly-hours-config', requiredRoles: [Role.RRHH, Role.SYSTEM_ADMIN] },
  ];

  public visibleNavItems = computed(() =>
    this.allNavItems.filter(item => this.authService.hasRole(item.requiredRoles))
  );

  public sidebarClasses = computed(() => {
    const isOpen = this.mobileMenuService.isOpen();
    return `
      fixed lg:static inset-y-0 left-0 z-30
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:flex
    `;
  });

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.mobileMenuService.close();
      });
  }

  onNavItemClick() {
    this.mobileMenuService.close();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.mobileMenuService.isOpen()) {
      this.mobileMenuService.close();
    }
  }
}
