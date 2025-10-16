import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, ToastModule],
  template: `
    <div class="flex h-screen bg-surface-ground">
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col overflow-hidden">
        <app-header></app-header>
        <main class="flex-1 overflow-x-hidden overflow-y-auto">
          <router-outlet></router-outlet>
        </main>
      </div>
      <p-toast></p-toast>
    </div>
  `,
})
export class LayoutComponent {}
