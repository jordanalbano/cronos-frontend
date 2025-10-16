import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from '../../shared/models/roles.enum';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data['roles'] as Role[];

  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // No roles required for this route
  }

  if (authService.hasRole(requiredRoles)) {
    return true;
  }

  // Redirect to a default page (e.g., dashboard) if role access is denied
  console.warn(`[RoleGuard] Access denied. User does not have required roles: ${requiredRoles.join(', ')}`);
  return router.parseUrl('/dashboard');
};
