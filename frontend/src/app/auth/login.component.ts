import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatSnackBarModule],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>UVbunny 🐇</mat-card-title>
          <mat-card-subtitle>Sign in to manage your bunnies</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <button
            mat-raised-button
            color="primary"
            (click)="signIn()"
            [disabled]="loading"
            aria-label="Sign in with Google">
            <span class="material-icons">login</span>
            Sign in with Google
          </button>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .login-card {
      min-width: 300px;
      text-align: center;
    }
    button {
      width: 100%;
      margin-top: 1rem;
    }
    .material-icons {
      vertical-align: middle;
      margin-right: 8px;
    }
  `],
})
export class LoginComponent {
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  signIn(): void {
    this.loading = true;
    // Redirect-based auth will navigate away, so we don't need to handle navigation
    this.authService.signInWithGoogle().subscribe({
      next: () => {
        // User will be redirected to Google, then back to the app
        // The redirect result will be handled in app.component.ts
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Sign in failed: ' + error.message, 'Close', {
          duration: 5000,
        });
      },
    });
  }
}

