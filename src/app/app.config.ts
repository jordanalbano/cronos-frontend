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
    Sun,
    Moon,
    FileDown,
    FileText,
    UserPlus,
    ClipboardX,
    CalendarCheck, Timer, UserX, BarChart, Menu, Sparkles, TrendingUp, TrendingDown,
    PlayCircle, Plus, Info
} from 'lucide-angular';
import {MessageService} from 'primeng/api';
import Aura from '@primeuix/themes/aura';

import {routes} from './app.routes';
import {authInterceptor} from './core/auth/auth.interceptor';
import {mockHttpInterceptor} from './core/interceptors/mock-http.interceptor';
import {environment} from '../environments/environment';
import {providePrimeNG} from "primeng/config";

const interceptors = [authInterceptor];
if (environment.mockMode) {
    interceptors.push(mockHttpInterceptor);
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
            Moon,
            AlertTriangle,
            FileDown,
            FileText,
            Sun,
          
            Menu,
            Sparkles,
            TrendingUp,
            TrendingDown,
            PlayCircle,
            Info,
            Plus,
            UserPlus,
            ClipboardX
        })),
        MessageService,
        providePrimeNG({
            theme: {
                preset: Aura

            }
        }),
    ],
};
