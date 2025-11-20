import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { Role } from './shared/models/roles.enum';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component')
    },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./features/dashboard/dashboard.component')
            },
            {
                path: 'clockings',
                loadComponent: () => import('./features/clockings/clockings-container.component'),
                canActivate: [roleGuard],
                data: { roles: [Role.EMPLOYEE, Role.RRHH, Role.SYSTEM_ADMIN, Role.FICHADOR] }
            },
            {
                path: 'reports',
                loadComponent: () => import('./features/reports/reports.component'),
                canActivate: [roleGuard],
                data: { roles: [Role.RRHH, Role.SYSTEM_ADMIN] }
            },
            {
                path: 'users',
                loadComponent: () => import('./features/users/users.component'),
                canActivate: [roleGuard],
                data: { roles: [Role.SYSTEM_ADMIN] }
            },
            {
                path: 'employee-history',
                loadComponent: () => import('./features/employee-history/employee-history.component'),
                canActivate: [roleGuard],
                data: { roles: [Role.RRHH, Role.SYSTEM_ADMIN] }
            },
            {
                path: 'monthly-hours-config',
                loadComponent: () => import('./features/monthly-hours-config/monthly-hours-config.component'),
                canActivate: [roleGuard],
                data: { roles: [Role.RRHH, Role.SYSTEM_ADMIN] }
            },
            {
                path: 'monthly-closure',
                loadComponent: () => import('./features/monthly-closure/monthly-closure.component'),
                canActivate: [roleGuard],
                data: { roles: [Role.RRHH, Role.SYSTEM_ADMIN] }
            },
            {
                path: 'monthly-closure/:id',
                loadComponent: () => import('./features/monthly-closure/monthly-closure-detail.component'),
                canActivate: [roleGuard],
                data: { roles: [Role.RRHH, Role.SYSTEM_ADMIN] }
            },
            {
                path: 'design',
                loadComponent: () => import('./features/design-system/design-system.component')
            },
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    }
];
