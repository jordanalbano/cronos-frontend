import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="relative overflow-hidden bg-gradient-to-br from-primary via-primary-light to-info-color rounded-2xl shadow-xl mb-8 animate-fade-in-up">
      <div class="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div class="absolute -right-16 -top-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
      <div class="absolute -left-16 -bottom-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>

      <div class="relative p-8 sm:p-12">
        <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div class="space-y-4 flex-1">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
              <lucide-icon name="sparkles" size="16" class="text-white"></lucide-icon>
              <span class="text-xs font-medium text-white uppercase tracking-wider">Destacado del Día</span>
            </div>

            <div>
              <h2 class="text-5xl sm:text-6xl font-bold text-white mb-2 tracking-tight">
                {{ value }}
              </h2>
              <p class="text-xl text-white/90 font-medium">{{ title }}</p>
            </div>

            <p class="text-white/80 text-sm max-w-lg leading-relaxed">
              {{ description }}
            </p>

            @if(comparison) {
              <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg">
                <lucide-icon
                  [name]="comparison.startsWith('+') ? 'trending-up' : 'trending-down'"
                  size="18"
                  class="text-white">
                </lucide-icon>
                <span class="text-white font-semibold">{{ comparison }}</span>
                <span class="text-white/70 text-sm">vs ayer</span>
              </div>
            }
          </div>

          <div class="flex items-center justify-center p-8 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <lucide-icon [name]="iconName" [size]="80" class="text-white" strokeWidth="1.5"></lucide-icon>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-grid-pattern {
      background-image:
        linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px);
      background-size: 24px 24px;
    }
  `]
})
export class HeroSectionComponent {
  @Input() title: string = 'Título';
  @Input() value: string = '0';
  @Input() description: string = 'Descripción';
  @Input() iconName: string = 'trophy';
  @Input() comparison?: string;
}
