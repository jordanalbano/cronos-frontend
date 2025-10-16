import {ApplicationConfig, importProvidersFrom, APP_INITIALIZER, provideAppInitializer, inject} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideAnimations} from '@angular/platform-browser/animations';
import {
    LucideAngularModule,
    Users,
    Clock,
    BarChart3,
    LayoutDashboard,
    LogOut,
    Palette,
    History,
    AlertTriangle,
    FileDown,
    FileText,
    UserPlus,
    ClipboardX,
    CalendarCheck, Timer, UserX, BarChart
} from 'lucide-angular';
import {MessageService} from 'primeng/api';

import {routes} from './app.routes';
import {authInterceptor} from './core/auth/auth.interceptor';
import {mockHttpInterceptor} from './core/interceptors/mock-http.interceptor';
import {environment} from '../environments/environment';
import {TranslationService} from './core/i18n/translation.service';
import {providePrimeNG} from "primeng/config";

const interceptors = [authInterceptor];
if (environment.mockMode) {
    interceptors.push(mockHttpInterceptor);
}

export function initializeTranslations(translationService: TranslationService) {
    return () => translationService.loadTranslations('es');
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptors(interceptors)),
        provideAnimations(),
        importProvidersFrom(LucideAngularModule.pick({
            Users,
            Clock,
            BarChart3,
            LayoutDashboard,
            CalendarCheck,
            Timer,
            UserX,
            BarChart,
            LogOut,
            Palette,
            History,
            AlertTriangle,
            FileDown,
            FileText,
            UserPlus,
            ClipboardX
        })),
        MessageService,
        TranslationService,
        providePrimeNG({
            theme: {}
        }),
        provideAppInitializer(() => {
            initializeTranslations(inject(TranslationService));
        })

    ],
};
