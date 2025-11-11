import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { Auth, User } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  isSignUp = false;
  loading = false;
  hidePassword = true;
  emailForm: FormGroup;
  currentUser: User | null = null;
  userData: any = null;
  private authStateUnsubscribe: (() => void) | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private auth: Auth,
    private fb: FormBuilder,
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // Subscribe to auth state changes to track current user
    this.authStateUnsubscribe = this.auth.onAuthStateChanged((user) => {
      this.currentUser = user;
      if (user) {
        // Extract user data for debugging
        this.userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          isAnonymous: user.isAnonymous,
          providerData: user.providerData.map(provider => ({
            providerId: provider.providerId,
            uid: provider.uid,
            email: provider.email,
            displayName: provider.displayName,
            photoURL: provider.photoURL,
          })),
          metadata: {
            creationTime: user.metadata.creationTime,
            lastSignInTime: user.metadata.lastSignInTime,
          },
          refreshToken: user.refreshToken,
        };
        console.log('Current Auth User:', this.userData);
      } else {
        this.userData = null;
        console.log('No authenticated user');
      }
    });

    // Handle redirect result if user is returning from Google auth
    // This must be called FIRST before any other component (getRedirectResult can only be called once)
    // Call immediately to catch the redirect result
    this.authService.handleRedirectResult().subscribe({
      next: (user) => {
        if (user) {
          console.log('Login: Redirect result detected, user authenticated', user.uid);
          // Wait for auth state to be fully updated before navigating
          // This ensures the auth guard will see the authenticated user
          let resolved = false;
          const unsubscribe = this.auth.onAuthStateChanged((authUser) => {
            if (authUser && !resolved) {
              resolved = true;
              unsubscribe();
              console.log('Login: Auth state updated, navigating to dashboard');
              // User successfully signed in, navigate to dashboard
              // Use replaceUrl to prevent back button from going to login
              this.router.navigate(['/'], { replaceUrl: true });
            }
          });
          
          // Fallback: if auth state doesn't update within 2 seconds, navigate anyway
          // This handles edge cases where onAuthStateChanged might not fire immediately
          setTimeout(() => {
            if (!resolved && this.auth.currentUser) {
              resolved = true;
              unsubscribe();
              console.log('Login: Fallback navigation (auth state timeout)');
              this.router.navigate(['/'], { replaceUrl: true });
            }
          }, 2000);
        } else {
          console.log('Login: No redirect result (normal page load)');
        }
      },
      error: (error) => {
        // Silently ignore "no-auth-event" errors (normal when no redirect happened)
        // This happens when the page loads normally without a redirect
        if (error?.code !== 'auth/no-auth-event' && error?.code !== 'auth/popup-closed-by-user') {
          console.error('Error handling redirect result in login:', error);
          this.snackBar.open('Authentication error: ' + (error.message || 'Unknown error'), 'Close', {
            duration: 5000,
          });
        }
      },
    });
  }

  toggleMode(): void {
    this.isSignUp = !this.isSignUp;
    this.emailForm.reset();
  }

  signInWithGoogle(): void {
    this.loading = true;
    // Redirect-based auth will navigate away, so we don't need to handle navigation
    this.authService.signInWithGoogle().subscribe({
      next: () => {
        // User will be redirected to Google, then back to the app
        // The redirect result will be handled in ngOnInit
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Sign in failed: ' + error.message, 'Close', {
          duration: 5000,
        });
      },
    });
  }

  async signInWithEmail(): Promise<void> {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { email, password } = this.emailForm.value;

    try {
      if (this.isSignUp) {
        // Sign up
        await firstValueFrom(this.authService.signUpWithEmailAndPassword(email, password));
        this.snackBar.open('Account created successfully! 🐇', 'Close', {
          duration: 3000,
        });
      } else {
        // Sign in
        await firstValueFrom(this.authService.signInWithEmailAndPassword(email, password));
      }

      // Wait for auth state to update
      let resolved = false;
      const unsubscribe = this.auth.onAuthStateChanged((user) => {
        if (user && !resolved) {
          resolved = true;
          unsubscribe();
          this.loading = false;
          this.router.navigate(['/'], { replaceUrl: true });
        }
      });

      // Fallback timeout
      setTimeout(() => {
        if (!resolved && this.auth.currentUser) {
          resolved = true;
          unsubscribe();
          this.loading = false;
          this.router.navigate(['/'], { replaceUrl: true });
        } else if (!resolved) {
          this.loading = false;
        }
      }, 2000);
    } catch (error: any) {
      this.loading = false;
      let errorMessage = 'Authentication failed';
      
      if (error?.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.';
      } else if (error?.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error?.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (error?.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check and try again.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      this.snackBar.open(errorMessage, 'Close', {
        duration: 5000,
      });
    }
  }

  get emailControl() {
    return this.emailForm.get('email');
  }

  get passwordControl() {
    return this.emailForm.get('password');
  }

  ngOnDestroy(): void {
    if (this.authStateUnsubscribe) {
      this.authStateUnsubscribe();
    }
  }
}
