import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSliderModule } from '@angular/material/slider';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ConfigService } from '../services/config.service';
import { UserConfig } from '../types';
import { HeaderComponent } from '../shared/header.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatSnackBarModule,
    MatSliderModule,
    MatIconModule,
    MatDividerModule,
    FormsModule,
    HeaderComponent,
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  pointsPerCarrot: number | null = null; // Initialize as null until loaded from DB
  maxHappinessPoints: number | null = null; // Initialize as null until loaded from DB
  loading = false;
  configLoading = true; // Track if config is still loading
  // Track original values to detect changes (used for reset logic)
  private originalPointsPerCarrot: number | null = null;
  private originalMaxHappinessPoints: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private configService: ConfigService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    // Load initial value from user's database record
    this.configService.config$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (config) => {
        // ConfigService guarantees a default config when none exists
        const ppc = config?.pointsPerCarrot ?? 3;
        const max = config?.maxHappinessPoints ?? ppc * 100;
        this.pointsPerCarrot = this.clampPoints(ppc);
        this.maxHappinessPoints = this.clampMax(max, this.pointsPerCarrot);
        this.originalPointsPerCarrot = this.pointsPerCarrot;
        this.originalMaxHappinessPoints = this.maxHappinessPoints;
        this.configLoading = false;
      },
      error: (error) => {
        // Graceful fallback to defaults
        this.configLoading = false;
        this.pointsPerCarrot = 3;
        this.originalPointsPerCarrot = 3;
        this.maxHappinessPoints = 300;
        this.originalMaxHappinessPoints = 300;
        this.snackBar.open('Error loading settings: ' + (error?.message || 'Unknown error'), 'Close', {
          duration: 5000,
        });
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isValid(): boolean {
    // Simple bounds checking; both values must be present & valid
    return (
      this.pointsPerCarrot !== null &&
      this.pointsPerCarrot >= 1 &&
      this.pointsPerCarrot <= 10 &&
      this.maxHappinessPoints !== null &&
      this.maxHappinessPoints >= 1
    );
  }

  onSliderChange(value: number): void {
    this.pointsPerCarrot = this.clampPoints(value);
    // If max is still tracking the original auto-calculated value, update it
    const defaultMaxOriginal = (this.originalPointsPerCarrot ?? 3) * 100;
    if (this.originalMaxHappinessPoints === defaultMaxOriginal && this.maxHappinessPoints === this.originalMaxHappinessPoints) {
      this.maxHappinessPoints = this.clampMax(this.pointsPerCarrot * 100, this.pointsPerCarrot);
    }
  }

  onMaxHappinessSliderChange(value: number): void {
    this.maxHappinessPoints = this.clampMax(value, this.pointsPerCarrot ?? 3);
  }

  /** Utility: clamp points per carrot (1..10) */
  private clampPoints(value: any): number {
    let v = typeof value === 'string' ? parseFloat(value) : value;
    if (!Number.isFinite(v)) v = 3;
    if (v < 1) v = 1;
    if (v > 10) v = 10;
    return Math.round(v);
  }

  /** Utility: clamp max happiness (>=1, fallback to points*100) */
  private clampMax(value: any, points: number): number {
    let v = typeof value === 'string' ? parseFloat(value) : value;
    if (!Number.isFinite(v) || v < 1) v = points * 100;
    return Math.round(v);
  }

  /**
   * Get normalized points per carrot for display
   */
  getPointsPerCarrot(): number {
    return this.pointsPerCarrot === null ? 1 : this.clampPoints(this.pointsPerCarrot);
  }

  /**
   * Calculate happiness for 10 carrots
   */
  getHappinessFor10Carrots(): number {
    return this.getPointsPerCarrot() * 10;
  }

  /**
   * Calculate happiness for 100 carrots
   */
  getHappinessFor100Carrots(): number {
    return this.getPointsPerCarrot() * 100;
  }

  /**
   * Get current max happiness points or calculate default
   */
  getMaxHappinessPoints(): number {
    return this.maxHappinessPoints === null ? this.getPointsPerCarrot() * 100 : this.clampMax(this.maxHappinessPoints, this.getPointsPerCarrot());
  }

  /**
   * Calculate progress bar percentage for a given happiness value
   */
  getProgressBarPercent(happiness: number): number {
    const max = this.getMaxHappinessPoints();
    return Math.min(100, Math.round((happiness / max) * 100));
  }

  resetToDefault(): void {
    this.pointsPerCarrot = 3;
    this.maxHappinessPoints = 300;
  }

  async saveSettings(): Promise<void> {
    // Step 1: Validation and Feedback in the UI
    if (!this.isValid() || this.pointsPerCarrot === null) {
      this.snackBar.open('Points per carrot must be between 1 and 10', 'Close', {
        duration: 3000,
      });
      return;
    }

    // Set loading state and disable save button
    this.loading = true;

    try {
      // Step 2: ConfigService Updates Firestore
      // This will write to users/{uid}/config/current with merge: true
      // Both values are guaranteed to be numbers here due to validation above
      await this.configService.updatePointsPerCarrot(this.pointsPerCarrot);
      if (this.maxHappinessPoints !== null) {
        await this.configService.updateMaxHappinessPoints(this.maxHappinessPoints);
      }
      
      // Update original values to track changes
      this.originalPointsPerCarrot = this.pointsPerCarrot;
      this.originalMaxHappinessPoints = this.maxHappinessPoints;
      
      // Step 5: User Feedback - Success
      this.loading = false;
      this.snackBar.open('Configuration saved successfully! 🐇', 'Close', {
        duration: 3000,
      });
      
      // Step 4: Real-Time Propagation happens automatically via ConfigService.config$
      // BunniesService will automatically recalculate happiness using the new values
      // No manual refresh needed - reactive streams handle it
      
    } catch (error: any) {
      // Handle different error types with specific messages
      this.loading = false;
      
      let errorMessage = 'Error saving configuration';
      
      // Check for Firestore permission errors
      if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
        errorMessage = 'Missing or insufficient permissions. Please check your authentication.';
      } else if (error?.message) {
        errorMessage = error.message;
      } else {
        errorMessage = 'An unexpected error occurred. Please try again.';
      }
      
      this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
    }
  }
}

