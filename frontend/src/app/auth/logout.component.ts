import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="logout-container">
      <mat-card class="logout-card">
        <mat-card-header>
          <mat-card-title>Signing Out...</mat-card-title>
          <mat-card-subtitle>Please wait while we sign you out</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="spinner-container">
            <mat-spinner diameter="50"></mat-spinner>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .logout-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .logout-card {
      min-width: 300px;
      text-align: center;
    }
    .spinner-container {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }
  `],
})
export class LogoutComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Perform complete logout
    this.performLogout();
  }

  private async performLogout(): Promise<void> {
    try {
      // Sign out from Firebase first
      await firstValueFrom(this.authService.signOut());

      // Clear all storage after sign out
      this.clearAllStorage();

      // Small delay to ensure everything is cleared
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to login page
      this.router.navigate(['/login'], { replaceUrl: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, clear storage and navigate to login
      this.clearAllStorage();
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  private clearAllStorage(): void {
    // Clear localStorage (except theme preference - user might want to keep it)
    // Actually, let's clear everything for a clean logout
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('Error clearing localStorage:', e);
    }

    // Clear sessionStorage
    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn('Error clearing sessionStorage:', e);
    }

    // Clear all cookies
    this.clearAllCookies();

    // Reset theme to default (light)
    this.themeService.setTheme('light');
  }

  private clearAllCookies(): void {
    const domain = window.location.hostname;
    const domainParts = domain.split('.');
    const parentDomain = domainParts.length > 1 ? '.' + domainParts.slice(-2).join('.') : null;

    // Get all cookies
    const cookies = document.cookie.split(';');

    // Clear each cookie with multiple attempts (different paths and domains)
    cookies.forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      if (!name) return;

      // Clear cookie for current domain with various paths
      const paths = ['/', '/login', '/logout', ''];
      paths.forEach(path => {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}`;
        if (parentDomain) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};domain=${parentDomain}`;
        }
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};domain=${domain}`;
      });
    });

    // Also clear common Firebase Auth and Google cookies explicitly
    const commonCookies = [
      'firebase:authUser',
      '__session',
      'session',
      'SID',
      'HSID',
      'SSID',
      'APISID',
      'SAPISID',
      'NID',
      'OGPC',
      'OGP',
      '1P_JAR',
    ];

    commonCookies.forEach((cookieName) => {
      const paths = ['/', '/login', '/logout', ''];
      paths.forEach(path => {
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}`;
        if (parentDomain) {
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};domain=${parentDomain}`;
        }
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};domain=${domain}`;
        // Also try without domain
        document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path};domain=`;
      });
    });

    // Clear Firebase-specific cookies with host pattern
    if (domain.includes('firebaseapp.com') || domain.includes('web.app')) {
      const firebaseHostCookies = [
        `firebase:host:${domain}`,
        `firebase:host:${domain.replace('.web.app', '.firebaseapp.com')}`,
        `firebase:host:${domain.replace('.firebaseapp.com', '.web.app')}`,
      ];
      firebaseHostCookies.forEach((cookieName) => {
        const paths = ['/', '/login', '/logout', ''];
        paths.forEach(path => {
          document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}`;
        });
      });
    }
  }
}

