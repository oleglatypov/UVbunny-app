import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, Observable } from 'rxjs';
import { BunnyDetailsService } from '../services/bunny-details.service';
import { BunniesService } from '../services/bunnies.service';
import { ConfigService } from '../services/config.service';
import { CarrotEvent, BunnyWithHappiness, BunnyColor, UserConfig } from '../types';
import { HeaderComponent } from '../shared/header.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-bunny-details',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatIconModule,
    MatDividerModule,
    FormsModule,
    HeaderComponent,
  ],
  templateUrl: './bunny-details.component.html',
  styleUrls: ['./bunny-details.component.scss'],
})
export class BunnyDetailsComponent implements OnInit, OnDestroy {
  bunny: BunnyWithHappiness | null = null;
  events: CarrotEvent[] = [];
  carrotsToGive = 1;
  loading = false;
  config$: Observable<UserConfig | null>;
  readonly quickAmounts = [1, 5, 10, 25, 50];
  private destroy$ = new Subject<void>();
  private bunnyId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bunnyDetailsService: BunnyDetailsService,
    private bunniesService: BunniesService,
    private configService: ConfigService,
    private snackBar: MatSnackBar,
  ) {
    // Expose config$ observable for template
    this.config$ = this.configService.config$;
  }

  ngOnInit(): void {
    this.bunnyId = this.route.snapshot.paramMap.get('id');
    if (!this.bunnyId) {
      this.router.navigate(['/']);
      return;
    }

    // Load bunny details using reactive stream
    this.bunniesService.bunnies$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (bunnies) => {
        const bunny = bunnies.find((b) => b.id === this.bunnyId);
        if (bunny) {
          this.bunny = bunny;
        } else {
          this.snackBar.open('Bunny not found', 'Close', { duration: 3000 });
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        this.snackBar.open('Error loading bunny: ' + error.message, 'Close', {
          duration: 5000,
        });
      },
    });

    // Load events
    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setCarrotAmount(amount: number): void {
    this.carrotsToGive = amount;
  }

  onCarrotAmountChange(): void {
    // Ensure value stays within bounds
    if (this.carrotsToGive < 1) {
      this.carrotsToGive = 1;
    } else if (this.carrotsToGive > 50) {
      this.carrotsToGive = 50;
    }
  }

  getHappinessPreview(pointsPerCarrot: number): number {
    return (this.carrotsToGive || 1) * pointsPerCarrot;
  }

  giveCarrots(): void {
    if (!this.bunnyId || !this.carrotsToGive || this.carrotsToGive < 1 || this.carrotsToGive > 50) {
      return;
    }

    this.loading = true;
    this.bunnyDetailsService.giveCarrots(this.bunnyId, this.carrotsToGive).subscribe({
      next: () => {
        this.loading = false;
        const carrotsGiven = this.carrotsToGive;
        this.carrotsToGive = 1;
        this.snackBar.open(
          `🎉 ${carrotsGiven} carrot${carrotsGiven !== 1 ? 's' : ''} given to ${this.bunny?.name}! 🥕`,
          'Close',
          { duration: 4000 }
        );
        this.loadEvents();
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error giving carrots: ' + error.message, 'Close', {
          duration: 5000,
        });
      },
    });
  }

  getBunnyIcon(bunny: BunnyWithHappiness): string {
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

  private loadEvents(): void {
    if (!this.bunnyId) return;

    this.loading = true;
    this.bunnyDetailsService.loadEventsPage(this.bunnyId).subscribe({
      next: ({ events }) => {
        this.loading = false;
        this.events = events;
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Error loading events: ' + error.message, 'Close', {
          duration: 5000,
        });
      },
    });
  }
}

