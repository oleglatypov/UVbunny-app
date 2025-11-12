import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { BunniesService } from '../services/bunnies.service';
import { ThemeService } from '../services/theme.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    AsyncPipe,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() showBackButton = false;
  @Input() backRoute: string | null = null;
  
  appVersion = environment.version;
  averageHappiness$: Observable<number>;
  isDarkMode$: Observable<boolean>;
  userName$: Observable<string | null>;

  constructor(
    private authService: AuthService,
    private bunniesService: BunniesService,
    private themeService: ThemeService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.averageHappiness$ = this.bunniesService.averageHappiness$;
    this.isDarkMode$ = this.themeService.theme$.pipe(
      // Convert Theme to boolean
      map(theme => theme === 'dark')
    );
    this.userName$ = this.authService.currentUser$.pipe(
      map(user => user?.displayName || user?.email || null)
    );
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  goBack(): void {
    if (this.backRoute) {
      this.router.navigate([this.backRoute]);
    } else {
      this.router.navigate(['/']);
    }
  }

  signOut(): void {
    // Navigate to logout page which will handle complete cleanup
    this.router.navigate(['/logout']);
  }
}

