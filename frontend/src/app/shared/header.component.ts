import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AsyncPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { BunniesService } from '../services/bunnies.service';
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

  constructor(
    private authService: AuthService,
    private bunniesService: BunniesService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
    this.averageHappiness$ = this.bunniesService.averageHappiness$;
  }

  goBack(): void {
    if (this.backRoute) {
      this.router.navigate([this.backRoute]);
    } else {
      this.router.navigate(['/']);
    }
  }

  signOut(): void {
    this.authService.signOut().subscribe({
      error: (error) => {
        this.snackBar.open('Error signing out: ' + error.message, 'Close', {
          duration: 5000,
        });
      },
    });
  }
}

