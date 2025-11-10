import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { BunnyDetailsService } from '../services/bunny-details.service';
import { BunniesService } from '../services/bunnies.service';
import { ConfigService } from '../services/config.service';
import { CarrotEvent, BunnyWithHappiness } from '../types';

@Component({
  selector: 'app-bunny-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    FormsModule,
  ],
  template: `
    <div class="details-container">
      <mat-card *ngIf="bunny">
        <mat-card-header>
          <mat-card-title>{{ bunny.name }}</mat-card-title>
          <mat-card-subtitle>Happiness: {{ bunny.happiness }}%</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div class="give-carrots">
            <mat-form-field>
              <mat-label>Carrots (1-50)</mat-label>
              <input
                matInput
                type="number"
                [(ngModel)]="carrotsToGive"
                min="1"
                max="50"
                aria-label="Number of carrots to give" />
            </mat-form-field>
            <button
              mat-raised-button
              color="primary"
              (click)="giveCarrots()"
              [disabled]="loading || !carrotsToGive || carrotsToGive < 1 || carrotsToGive > 50"
              aria-label="Give carrots">
              Give Carrots
            </button>
          </div>

          <div class="events-section">
            <h3>Recent Events</h3>
            <div *ngIf="loading" class="loading">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
            <div *ngIf="!loading && events.length === 0" class="no-events">
              No events yet. Give some carrots!
            </div>
            <div *ngFor="let event of events" class="event-item">
              <p>
                <strong>{{ event.carrots }}</strong> carrot{{ event.carrots > 1 ? 's' : '' }} given
                on {{ event.createdAt | date: 'short' }}
              </p>
            </div>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button routerLink="/" aria-label="Back to dashboard">Back</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .details-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    .give-carrots {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
      margin-bottom: 2rem;
    }
    .events-section {
      margin-top: 2rem;
    }
    .event-item {
      padding: 0.5rem;
      border-bottom: 1px solid #eee;
    }
    .loading {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }
    .no-events {
      text-align: center;
      color: #666;
      padding: 2rem;
    }
  `],
})
export class BunnyDetailsComponent implements OnInit, OnDestroy {
  bunny: BunnyWithHappiness | null = null;
  events: CarrotEvent[] = [];
  carrotsToGive = 1;
  loading = false;
  private destroy$ = new Subject<void>();
  private bunnyId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bunnyDetailsService: BunnyDetailsService,
    private bunniesService: BunniesService,
    private configService: ConfigService,
    private snackBar: MatSnackBar,
  ) {}

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

  giveCarrots(): void {
    if (!this.bunnyId || !this.carrotsToGive || this.carrotsToGive < 1 || this.carrotsToGive > 50) {
      return;
    }

    this.loading = true;
    this.bunnyDetailsService.giveCarrots(this.bunnyId, this.carrotsToGive).subscribe({
      next: () => {
        this.loading = false;
        this.carrotsToGive = 1;
        this.snackBar.open('Carrots given!', 'Close', { duration: 3000 });
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

