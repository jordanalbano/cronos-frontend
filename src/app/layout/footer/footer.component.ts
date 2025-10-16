import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-surface-card border-t border-surface-border py-4 px-6">
      <div class="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-text-color-secondary">
        <span>© {{ currentYear }} Todos los derechos reservados.</span>
        <span class="hidden sm:inline">|</span>
        <span>
          Desarrollado por
          <a
            href="https://krauser.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary hover:text-primary-600 font-medium transition-colors">
            Krauser
          </a>
        </span>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
