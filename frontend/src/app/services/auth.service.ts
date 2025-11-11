import { Injectable } from '@angular/core';
import { Auth, signInWithRedirect, getRedirectResult, GoogleAuthProvider, signOut, User, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
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
   * Note: Firebase redirects back to the current page URL, so ensure redirect handling
   * is implemented in the component that receives the redirect (typically login component)
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
   * Note: getRedirectResult can only be called once per redirect, so call this early
   */
  handleRedirectResult(): Observable<User | null> {
    return from(getRedirectResult(this.auth)).pipe(
      map((result) => {
        if (result?.user) {
          console.log('Redirect result: User authenticated', result.user.uid);
        }
        return result?.user ?? null;
      }),
      catchError((error) => {
        // Ignore "no-auth-event" - this is normal when there's no redirect
        if (error?.code === 'auth/no-auth-event') {
          return of(null);
        }
        console.error('Redirect result error:', error);
        return of(null);
      }),
    );
  }

  /**
   * Sign out current user
   * Note: This only signs out from Firebase Auth
   * For complete logout including storage/cookies, use the logout page
   */
  signOut(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      map(() => {
        // Don't navigate here - let the logout component handle navigation
        // This allows the logout page to clear all storage first
        return undefined;
      }),
      catchError((error) => {
        console.error('Sign out error:', error);
        // Even on error, return success so logout page can clear storage
        return of(undefined);
      }),
    );
  }

  /**
   * Sign up with email and password
   */
  signUpWithEmailAndPassword(email: string, password: string): Observable<User> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      map((userCredential) => userCredential.user),
      catchError((error) => {
        console.error('Sign up error:', error);
        throw error;
      }),
    );
  }

  /**
   * Sign in with email and password
   */
  signInWithEmailAndPassword(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map((userCredential) => userCredential.user),
      catchError((error) => {
        console.error('Sign in error:', error);
        throw error;
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

