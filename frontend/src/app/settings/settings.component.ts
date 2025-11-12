import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
  private originalPointsPerCarrot: number | null = null;
  private originalMaxHappinessPoints: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private configService: ConfigService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Load initial value from user's database record
    this.configService.config$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (config) => {
        // ConfigService.config$ returns default { pointsPerCarrot: 3 } if no document exists
        // So config will always have a value, but we check if it came from DB or is default
        if (config) {
          // Use the value from the database (or default 3 if no record exists)
          this.pointsPerCarrot = config.pointsPerCarrot;
          this.originalPointsPerCarrot = config.pointsPerCarrot;
          
          // Set maxHappinessPoints from config or calculate default (pointsPerCarrot * 100)
          this.maxHappinessPoints = config.maxHappinessPoints ?? config.pointsPerCarrot * 100;
          this.originalMaxHappinessPoints = this.maxHappinessPoints;
        } else {
          // Fallback: only use 3 if config is null (shouldn't happen, but safety)
          this.pointsPerCarrot = 3;
          this.originalPointsPerCarrot = 3;
          this.maxHappinessPoints = 300; // 3 * 100
          this.originalMaxHappinessPoints = 300;
        }
        
        // Ensure values are normalized and trigger change detection
        this.normalizeValue();
        this.normalizeMaxHappinessPoints();
        this.configLoading = false; // Config has loaded
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.configLoading = false;
        // On error, use default value but show error message
        this.pointsPerCarrot = 3;
        this.originalPointsPerCarrot = 3;
        this.maxHappinessPoints = 300;
        this.originalMaxHappinessPoints = 300;
        this.snackBar.open('Error loading settings: ' + error.message, 'Close', {
          duration: 5000,
        });
        this.cdr.detectChanges();
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isValid(): boolean {
    const pointsValid = (
      this.pointsPerCarrot !== null &&
      this.pointsPerCarrot !== undefined &&
      !isNaN(this.pointsPerCarrot) &&
      this.pointsPerCarrot >= 1 &&
      this.pointsPerCarrot <= 10
    );
    
    const maxPointsValid = (
      this.maxHappinessPoints !== null &&
      this.maxHappinessPoints !== undefined &&
      !isNaN(this.maxHappinessPoints) &&
      this.maxHappinessPoints >= 1
    );
    
    return pointsValid && maxPointsValid;
  }

  onSliderChange(value: number): void {
    // Update the value directly from the slider
    this.pointsPerCarrot = value;
    this.normalizeValue();
    // Auto-update maxHappinessPoints if it's using default (pointsPerCarrot * 100)
    if (this.maxHappinessPoints === this.originalMaxHappinessPoints && 
        this.originalMaxHappinessPoints === (this.originalPointsPerCarrot ?? 3) * 100) {
      this.maxHappinessPoints = value * 100;
      this.normalizeMaxHappinessPoints();
    }
    // Force change detection to update Impact Preview immediately
    this.cdr.detectChanges();
  }

  onMaxHappinessSliderChange(value: number): void {
    this.maxHappinessPoints = value;
    this.normalizeMaxHappinessPoints();
    this.cdr.detectChanges();
  }

  private normalizeValue(): void {
    // Skip normalization if value is null (still loading)
    if (this.pointsPerCarrot === null || this.pointsPerCarrot === undefined) {
      return;
    }

    // Convert to number if it's a string
    if (typeof this.pointsPerCarrot === 'string') {
      this.pointsPerCarrot = parseFloat(this.pointsPerCarrot) || 3;
    }

    // Ensure value stays within bounds
    if (isNaN(this.pointsPerCarrot) || this.pointsPerCarrot < 1) {
      this.pointsPerCarrot = 1;
    } else if (this.pointsPerCarrot > 10) {
      this.pointsPerCarrot = 10;
    }

    // Round to integer if needed
    this.pointsPerCarrot = Math.round(this.pointsPerCarrot);
  }

  private normalizeMaxHappinessPoints(): void {
    // Skip normalization if value is null (still loading)
    if (this.maxHappinessPoints === null || this.maxHappinessPoints === undefined) {
      return;
    }

    // Convert to number if it's a string
    if (typeof this.maxHappinessPoints === 'string') {
      this.maxHappinessPoints = parseFloat(this.maxHappinessPoints) || (this.pointsPerCarrot ?? 3) * 100;
    }

    // Ensure value stays within bounds (minimum 1)
    if (isNaN(this.maxHappinessPoints) || this.maxHappinessPoints < 1) {
      this.maxHappinessPoints = (this.pointsPerCarrot ?? 3) * 100;
    }

    // Round to integer if needed
    this.maxHappinessPoints = Math.round(this.maxHappinessPoints);
  }

  /**
   * Get normalized points per carrot for display
   */
  getPointsPerCarrot(): number {
    const value = this.pointsPerCarrot;
    if (!value || value < 1) return 1;
    if (value > 10) return 10;
    return Math.round(value);
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
    if (this.maxHappinessPoints !== null && this.maxHappinessPoints >= 1) {
      return this.maxHappinessPoints;
    }
    return this.getPointsPerCarrot() * 100;
  }

  /**
   * Calculate progress bar percentage for a given happiness value
   */
  getProgressBarPercent(happiness: number): number {
    const max = this.getMaxHappinessPoints();
    return Math.min(100, Math.round((happiness / max) * 100));
  }

  resetToDefault(): void {
    // Reset to default values
    this.pointsPerCarrot = 3;
    this.maxHappinessPoints = 300; // 3 * 100
    this.normalizeValue();
    this.normalizeMaxHappinessPoints();
    this.cdr.detectChanges();
  }

  async saveSettings(): Promise<void> {
    // Step 1: Validation and Feedback in the UI
    if (!this.isValid() || this.pointsPerCarrot === null || this.maxHappinessPoints === null) {
      this.snackBar.open('Please ensure all values are valid (points: 1-10, max happiness: ≥1)', 'Close', {
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
      await this.configService.updateMaxHappinessPoints(this.maxHappinessPoints);
      
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
      
      this.snackBar.open(errorMessage, 'Close', {
        duration: 5000,
      });
    }
  }
}

