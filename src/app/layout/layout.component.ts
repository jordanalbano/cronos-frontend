import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { MobileMenuService } from '../core/services/mobile-menu.service';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent, FooterComponent, ToastModule],
  template: `
    <div class="flex h-screen bg-surface-ground relative">
      @if (mobileMenuService.isOpen()) {
        <div
          class="fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-300"
          (click)="mobileMenuService.close()">
        </div>
      }

      <app-sidebar></app-sidebar>

      <div class="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
        <app-header></app-header>
        <main class="flex-1 overflow-x-hidden overflow-y-auto">
          <router-outlet></router-outlet>
        </main>
        <app-footer></app-footer>
      </div>
      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    :host ::ng-deep body {
      overflow: hidden;
    }
  `]
})
export class LayoutComponent {
  public mobileMenuService = inject(MobileMenuService);
}
