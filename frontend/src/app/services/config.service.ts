import { Injectable, inject } from '@angular/core';
import { Firestore, doc, docData, setDoc, serverTimestamp } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, of, switchMap, map, shareReplay } from 'rxjs';
import { UserConfig } from '../types';
import { getUserConfigPath } from '../shared/paths';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  /** Stream: currently signed-in user's UID (null if signed out) */
  private readonly uid$ = authState(this.auth).pipe(
    map((u) => u?.uid ?? null),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /**
   * Get user config stream (reactive)
   * Returns default config if document doesn't exist
   * 
   * This stream automatically emits new values when the config document changes in Firestore.
   * Components subscribing to this (like BunniesService) will automatically recalculate
   * happiness values when pointsPerCarrot changes - enabling retroactive behavior.
   */
  readonly config$: Observable<UserConfig | null> = this.uid$.pipe(
    switchMap((uid) => {
      if (!uid) return of(null);

      const configRef = doc(this.firestore, getUserConfigPath(uid));
      return docData(configRef, { idField: 'id' }).pipe(
        map((data) => {
          if (!data) {
            // Return default config if document doesn't exist
            return { pointsPerCarrot: 3, updatedAt: new Date() };
          }

          const configData = data as any;
          // AngularFire automatically converts Firestore Timestamps to Date
          const updatedAt = configData.updatedAt instanceof Date
            ? configData.updatedAt
            : (configData.updatedAt as any)?.toDate?.() || new Date();

          return {
            pointsPerCarrot: configData.pointsPerCarrot || 3,
            maxHappinessPoints: configData.maxHappinessPoints, // Optional, defaults to pointsPerCarrot * 100
            updatedAt,
          };
        }),
      );
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /**
   * Update points per carrot (1-10)
   * Uses setDoc with merge: true to create or update the config document
   * Returns Promise for easier async/await usage
   */
  async updatePointsPerCarrot(points: number): Promise<void> {
    // Client-side validation: clamp value between 1-10
    const clampedPoints = Math.max(1, Math.min(10, Math.round(points)));
    
    if (points !== clampedPoints) {
      throw new Error('pointsPerCarrot must be between 1 and 10');
    }

    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const configRef = doc(this.firestore, getUserConfigPath(user.uid));
    
    // Use setDoc with merge: true to create or update
    // This ensures the document exists even on first save
    await setDoc(
      configRef,
      {
        pointsPerCarrot: clampedPoints,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  /**
   * Update max happiness points (optional cap for progress bar)
   * Uses setDoc with merge: true to create or update the config document
   * Returns Promise for easier async/await usage
   */
  async updateMaxHappinessPoints(maxPoints: number): Promise<void> {
    if (maxPoints < 1) {
      throw new Error('maxHappinessPoints must be greater than 0');
    }

    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const configRef = doc(this.firestore, getUserConfigPath(user.uid));
    
    // Use setDoc with merge: true to create or update
    // This ensures the document exists even on first save
    await setDoc(
      configRef,
      {
        maxHappinessPoints: maxPoints,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
}

