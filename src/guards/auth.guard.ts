 import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/services/auth/auth.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getUser().pipe(
    map(user => {
      if (!user) { // alterar
        return true; // Permite acesso
      } else {
        router.navigate(['/login']); // Redireciona para login
        return false;
      }
    })
  );
};
