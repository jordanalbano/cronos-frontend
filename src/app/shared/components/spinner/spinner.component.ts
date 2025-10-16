import { Component } from '@angular/core';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [],
  template: `
    <div class="loading-wrapper" role="status" aria-live="polite" aria-busy="true">
      <span class="visually-hidden">Cargando...</span>
      <div class="spinner-ring"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .loading-wrapper {
      --spinner-size: clamp(2.5rem, 6vw, 3.75rem);
      --spinner-thickness: calc(var(--spinner-size) * 0.18);
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--spinner-size);
      height: var(--spinner-size);
    }

    .spinner-ring {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 9999px;
      border: var(--spinner-thickness) solid transparent;
      border-top-color: var(--primary-color, #2563eb);
      border-right-color: var(--primary-light, #60a5fa);
      border-bottom-color: rgba(37, 99, 235, 0.25);
      border-left-color: rgba(37, 99, 235, 0.12);
      background: radial-gradient(circle at center, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.1) 55%, transparent 72%);
      box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.08), var(--shadow-glow, 0 0 20px rgba(37, 99, 235, 0.15));
      animation: spinner-rotate 0.85s linear infinite;
    }

    .spinner-ring::before {
      content: '';
      position: absolute;
      inset: calc(var(--spinner-thickness) * 0.6);
      border-radius: inherit;
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.25), rgba(96, 165, 250, 0.12));
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
    }

    .spinner-ring::after {
      content: '';
      position: absolute;
      width: calc(var(--spinner-thickness) * 0.95);
      height: calc(var(--spinner-thickness) * 0.95);
      border-radius: 9999px;
      top: 50%;
      right: calc(var(--spinner-thickness) * -0.4);
      transform: translateY(-50%);
      background: var(--primary-light, #60a5fa);
      box-shadow: 0 0 12px rgba(96, 165, 250, 0.6);
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    @keyframes spinner-rotate {
      to {
        transform: rotate(360deg);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .spinner-ring {
        animation-duration: 1.6s;
      }
    }
  `]
})
export class SpinnerComponent {}
