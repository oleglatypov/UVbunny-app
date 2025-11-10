import { Injectable } from '@angular/core';
import { Auth, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, from, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private auth: Auth,
    private router: Router,
  ) {}

  /**
   * Sign in with Google using redirect (avoids COOP issues with Firebase Hosting)
   */
  signInWithGoogle(): Observable<void> {
    const provider = new GoogleAuthProvider();
    return from(signInWithRedirect(this.auth, provider)).pipe(
      map(() => undefined),
      catchError((error) => {
        console.error('Sign in redirect error:', error);
        throw error;
      }),
    );
  }

  /**
   * Handle redirect result after Google sign-in
   * Call this in your app component or login component after redirect
   */
  handleRedirectResult(): Observable<User | null> {
    return from(getRedirectResult(this.auth)).pipe(
      map((result) => result?.user ?? null),
      catchError((error) => {
        console.error('Redirect result error:', error);
        return of(null);
      }),
    );
  }

  /**
   * Sign out current user
   */
  signOut(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      map(() => {
        this.router.navigate(['/login']);
        return undefined;
      }),
    );
  }

  /**
   * Get current user
   */
  get currentUser$(): Observable<User | null> {
    return new Observable((subscriber) => {
      const unsubscribe = this.auth.onAuthStateChanged((user) => {
        subscriber.next(user);
      });
      return unsubscribe;
    });
  }
}

