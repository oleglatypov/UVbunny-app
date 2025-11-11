import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Auth } from '@angular/fire/auth';

/**
 * Guard to redirect authenticated users away from login page
 * Note: We don't check redirect results here - that's handled by login.component
 * getRedirectResult can only be called once, so we let the component handle it
 */
export const loginGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return new Promise<boolean>((resolve) => {
    // Wait for auth state to be determined
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      if (user) {
        // User is authenticated, redirect to dashboard
        router.navigate(['/'], { replaceUrl: true });
        resolve(false);
      } else {
        // User is not authenticated, allow access to login page
        resolve(true);
      }
    });
  });
};

