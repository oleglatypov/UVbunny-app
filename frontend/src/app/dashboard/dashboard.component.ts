import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil, Observable } from 'rxjs';
import { BunniesService } from '../services/bunnies.service';
import { ConfigService } from '../services/config.service';
import { AuthService } from '../services/auth.service';
import { BunnyWithHappiness, BunnyColor } from '../types';
import { AddBunnyDialogComponent } from './add-bunny-dialog.component';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    RouterModule,
    MatCardModule,
    MatProgressBarModule,
    MatToolbarModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSnackBarModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Use reactive observables directly in template with async pipe
  bunnies$!: Observable<BunnyWithHappiness[]>;
  averageHappiness$!: Observable<number>;
  appVersion = environment.version;
  private destroy$ = new Subject<void>();

  constructor(
    private bunniesService: BunniesService,
    private configService: ConfigService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    // Initialize reactive streams after constructor
    this.bunnies$ = this.bunniesService.bunnies$;
    this.averageHappiness$ = this.bunniesService.averageHappiness$;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  viewBunny(id: string): void {
    this.router.navigate(['/bunnies', id]);
  }

  async openAddBunnyDialog(): Promise<void> {
    const dialogRef = this.dialog.open(AddBunnyDialogComponent, {
      width: '450px',
      disableClose: false,
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (result?: { name: string; color?: BunnyColor }) => {
        if (result && result.name) {
          try {
            await this.bunniesService.createBunny(result.name, result.color);
            this.snackBar.open('Bunny created! 🐇', 'Close', { duration: 3000 });
            // No need to reload - reactive stream will update automatically via collectionData
          } catch (error: any) {
            this.snackBar.open('Error creating bunny: ' + error.message, 'Close', {
              duration: 5000,
            });
          }
        }
      });
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

  getBunnyIcon(bunny: BunnyWithHappiness): string {
    // Placeholder - will use actual SVG icons from assets
    return `assets/icons/bunny_${bunny.mood}_${bunny.colorClass}.svg`;
  }

  getProgressColor(mood: 'sad' | 'average' | 'happy'): string {
    switch (mood) {
      case 'sad':
        return 'warn';
      case 'happy':
        return 'primary';
      default:
        return 'accent';
    }
  }

  getBunnyBorderColor(colorClass: BunnyColor): string {
    const colorMap: Record<BunnyColor, string> = {
      black: '#222222',
      brown: '#C89B6D',
      cream: '#F4D6A3',
      gray: '#CFCFD6',
      pink: '#F6B7C2',
      white: '#E0E0E0', // Light gray for better visibility on white background
    };
    return colorMap[colorClass] || '#CFCFD6';
  }

}

