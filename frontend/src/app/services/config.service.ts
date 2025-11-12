import { Injectable, inject } from '@angular/core';
import { Firestore, doc, docData, setDoc, serverTimestamp } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, of, switchMap, map, shareReplay } from 'rxjs';
import { UserConfig } from '../types';
import { getUserConfigPath } from '../shared/paths';

interface FirestoreConfigData {
  pointsPerCarrot?: number;
  maxHappinessPoints?: number;
  moodSadThreshold?: number;
  moodAverageThreshold?: number;
  updatedAt?: any;
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);

  private readonly defaultPointsPerCarrot = 3;
  private readonly minPointsPerCarrot = 1;
  private readonly maxPointsPerCarrot = 10;
  private readonly defaultSadThreshold = 20;
  private readonly defaultAverageThreshold = 49;
  private readonly minThreshold = 0;
  private readonly maxThreshold = 100;
  private readonly minMaxHappinessPoints = 1;

  private readonly currentUserId$ = authState(this.auth).pipe(
    map((user) => user?.uid ?? null),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /**
   * Reactive stream of user configuration.
   * Automatically emits new values when config document changes in Firestore.
   * Returns default config if document doesn't exist.
   */
  readonly config$: Observable<UserConfig | null> = this.currentUserId$.pipe(
    switchMap((userId) => {
      if (!userId) {
        return of(null);
      }

      const configDocumentReference = doc(this.firestore, getUserConfigPath(userId));
      return docData(configDocumentReference, { idField: 'id' }).pipe(
        map((data) => this.mapFirestoreDataToUserConfig(data)),
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /**
   * Update points per carrot (1-10).
   */
  async updatePointsPerCarrot(points: number): Promise<void> {
    const validatedPoints = this.validateAndClampPointsPerCarrot(points);
    const currentUser = this.getCurrentUser();

    const configDocumentReference = doc(this.firestore, getUserConfigPath(currentUser.uid));
    await setDoc(
      configDocumentReference,
      {
        pointsPerCarrot: validatedPoints,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  /**
   * Update max happiness points (optional cap for progress bar).
   */
  async updateMaxHappinessPoints(maxPoints: number): Promise<void> {
    this.validateMaxHappinessPoints(maxPoints);
    const currentUser = this.getCurrentUser();

    const configDocumentReference = doc(this.firestore, getUserConfigPath(currentUser.uid));
    await setDoc(
      configDocumentReference,
      {
        maxHappinessPoints: maxPoints,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  /**
   * Update mood thresholds (percentages for sad and average moods).
   */
  async updateMoodThresholds(sadThreshold: number, averageThreshold: number): Promise<void> {
    this.validateMoodThresholds(sadThreshold, averageThreshold);
    const currentUser = this.getCurrentUser();

    const configDocumentReference = doc(this.firestore, getUserConfigPath(currentUser.uid));
    await setDoc(
      configDocumentReference,
      {
        moodSadThreshold: Math.round(sadThreshold),
        moodAverageThreshold: Math.round(averageThreshold),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  /**
   * Map Firestore data to UserConfig object.
   */
  private mapFirestoreDataToUserConfig(data: any): UserConfig {
    if (!data) {
      return this.createDefaultUserConfig();
    }

    const configData = data as FirestoreConfigData;
    const updatedAt = this.normalizeTimestamp(configData.updatedAt);

    return {
      pointsPerCarrot: configData.pointsPerCarrot ?? this.defaultPointsPerCarrot,
      maxHappinessPoints: configData.maxHappinessPoints,
      moodSadThreshold: configData.moodSadThreshold ?? this.defaultSadThreshold,
      moodAverageThreshold: configData.moodAverageThreshold ?? this.defaultAverageThreshold,
      updatedAt,
    };
  }

  /**
   * Create default user configuration.
   */
  private createDefaultUserConfig(): UserConfig {
    return {
      pointsPerCarrot: this.defaultPointsPerCarrot,
      moodSadThreshold: this.defaultSadThreshold,
      moodAverageThreshold: this.defaultAverageThreshold,
      updatedAt: new Date(),
    };
  }

  /**
   * Normalize Firestore timestamp to Date object.
   */
  private normalizeTimestamp(timestamp: any): Date {
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (timestamp?.toDate) {
      return timestamp.toDate();
    }
    return new Date();
  }

  /**
   * Validate and clamp points per carrot value.
   */
  private validateAndClampPointsPerCarrot(points: number): number {
    const clampedPoints = Math.max(this.minPointsPerCarrot, Math.min(this.maxPointsPerCarrot, Math.round(points)));

    if (points !== clampedPoints) {
      throw new Error(`pointsPerCarrot must be between ${this.minPointsPerCarrot} and ${this.maxPointsPerCarrot}`);
    }

    return clampedPoints;
  }

  /**
   * Validate max happiness points.
   */
  private validateMaxHappinessPoints(maxPoints: number): void {
    if (maxPoints < this.minMaxHappinessPoints) {
      throw new Error(`maxHappinessPoints must be greater than ${this.minMaxHappinessPoints - 1}`);
    }
  }

  /**
   * Validate mood thresholds.
   */
  private validateMoodThresholds(sadThreshold: number, averageThreshold: number): void {
    if (sadThreshold < this.minThreshold || sadThreshold > this.maxThreshold) {
      throw new Error(`moodSadThreshold must be between ${this.minThreshold} and ${this.maxThreshold}`);
    }
    if (averageThreshold < this.minThreshold || averageThreshold > this.maxThreshold) {
      throw new Error(`moodAverageThreshold must be between ${this.minThreshold} and ${this.maxThreshold}`);
    }
    if (sadThreshold >= averageThreshold) {
      throw new Error('moodSadThreshold must be less than moodAverageThreshold');
    }
  }

  /**
   * Get current authenticated user or throw error.
   */
  private getCurrentUser() {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return user;
  }
}

