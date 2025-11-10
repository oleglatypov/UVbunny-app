import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil, Observable } from 'rxjs';
import { BunniesService } from '../services/bunnies.service';
import { BunnyWithHappiness, BunnyColor } from '../types';
import { AddBunnyDialogComponent } from './add-bunny-dialog.component';
import { DeleteBunnyDialogComponent } from './delete-bunny-dialog.component';
import { HeaderComponent } from '../shared/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    RouterModule,
    MatCardModule,
    MatProgressBarModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDialogModule,
    HeaderComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Use reactive observables directly in template with async pipe
  bunnies$!: Observable<BunnyWithHappiness[]>;
  private destroy$ = new Subject<void>();
  private countdownInterval: any;

  constructor(
    private bunniesService: BunniesService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Initialize reactive streams after constructor
    this.bunnies$ = this.bunniesService.bunnies$;
    
    // Start countdown timer that updates every second
    this.countdownInterval = setInterval(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
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

  async deleteBunny(event: Event, bunny: BunnyWithHappiness): Promise<void> {
    // Prevent card click event from firing
    event.stopPropagation();

    // Open Material confirmation dialog
    const dialogRef = this.dialog.open(DeleteBunnyDialogComponent, {
      width: '450px',
      disableClose: false,
      data: { bunnyName: bunny.name },
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (confirmed: boolean) => {
        if (!confirmed) {
          return;
        }

        try {
          if (!bunny.id) {
            throw new Error('Bunny ID is missing');
          }

          await this.bunniesService.deleteBunny(bunny.id);
          this.snackBar.open(`${bunny.name} has been deleted 🐇`, 'Close', {
            duration: 3000,
          });
          // No need to reload - reactive stream will update automatically
        } catch (error: any) {
          this.snackBar.open('Error deleting bunny: ' + error.message, 'Close', {
            duration: 5000,
          });
        }
      });
  }

  /**
   * Check if bunny was created within the last 60 seconds (newly created)
   */
  isNewlyCreated(bunny: BunnyWithHappiness): boolean {
    if (!bunny.createdAt) return false;
    const now = new Date().getTime();
    const createdAt = bunny.createdAt.getTime();
    const secondsSinceCreation = Math.floor((now - createdAt) / 1000);
    return secondsSinceCreation < 60;
  }

  /**
   * Get countdown display for newly created bunny
   * Returns "1m" for first minute, then "59", "58", etc.
   */
  getCountdown(bunny: BunnyWithHappiness): string {
    if (!bunny.createdAt) return '';
    const now = new Date().getTime();
    const createdAt = bunny.createdAt.getTime();
    const secondsSinceCreation = Math.floor((now - createdAt) / 1000);
    
    if (secondsSinceCreation >= 60) {
      return ''; // No countdown after 60 seconds
    }
    
    const secondsRemaining = 60 - secondsSinceCreation;
    
    // Show "1m" for the first second, then countdown from 59
    if (secondsRemaining === 60) {
      return '1m';
    }
    
    return secondsRemaining.toString();
  }

}

