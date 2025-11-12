import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, query, serverTimestamp, doc, deleteDoc, orderBy } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, of, combineLatest, map, switchMap, shareReplay } from 'rxjs';
import { Bunny, BunnyWithHappiness, BunnyColor, UserConfig, BunnyMood } from '../types';
import { getBunniesCollectionPath } from '../shared/paths';
import { ConfigService } from './config.service';

interface FirestoreBunny {
  id: string;
  name: string;
  colorClass: BunnyColor;
  eventCount?: number;
  createdAt: any;
}

@Injectable({
  providedIn: 'root',
})
export class BunniesService {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);
  private readonly configService = inject(ConfigService);

  private readonly defaultColorPalette: BunnyColor[] = ['cream', 'gray', 'brown', 'white', 'black', 'pink'];
  private readonly defaultPointsPerCarrot = 3;
  private readonly defaultMaxHappinessMultiplier = 100;
  private readonly defaultSadThreshold = 20;
  private readonly defaultAverageThreshold = 49;

  private readonly currentUserId$ = authState(this.auth).pipe(
    map((user) => user?.uid ?? null),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /**
   * Reactive stream of all bunnies with computed happiness metrics.
   * Automatically recalculates when configuration changes.
   */
  readonly bunnies$: Observable<BunnyWithHappiness[]> = combineLatest([
    this.getBunniesCollection$(),
    this.configService.config$,
  ]).pipe(
    map(([bunnies, userConfig]) => this.enrichBunniesWithHappiness(bunnies, userConfig)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /**
   * Average happiness across all bunnies (0 if no bunnies exist).
   */
  readonly averageHappiness$: Observable<number> = this.bunnies$.pipe(
    map((bunnies) => this.calculateAverageHappiness(bunnies)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /**
   * Create a new bunny with optional color selection.
   * @returns Promise resolving to the new bunny's document ID.
   */
  async createBunny(name: string, color?: BunnyColor): Promise<string> {
    const currentUser = this.getCurrentUser();
    const selectedColor = color ?? this.selectRandomColor();
    const bunniesCollection = collection(this.firestore, getBunniesCollectionPath(currentUser.uid));

    const documentReference = await addDoc(bunniesCollection, {
      name: name.trim(),
      colorClass: selectedColor,
      eventCount: 0,
      createdAt: serverTimestamp(),
    });

    return documentReference.id;
  }

  /**
   * Delete a bunny by ID.
   * Note: Associated events are deleted by Cloud Function onBunnyDeleteCascade.
   */
  async deleteBunny(bunnyId: string): Promise<void> {
    const currentUser = this.getCurrentUser();
    const bunnyDocumentReference = doc(this.firestore, getBunniesCollectionPath(currentUser.uid), bunnyId);
    await deleteDoc(bunnyDocumentReference);
  }

  /**
   * Get reactive stream of bunnies collection for current user.
   */
  private getBunniesCollection$(): Observable<FirestoreBunny[]> {
    return this.currentUserId$.pipe(
      switchMap((userId) => {
        if (!userId) {
          return of([]);
        }

        const bunniesCollection = collection(this.firestore, getBunniesCollectionPath(userId));
        const sortedQuery = query(bunniesCollection, orderBy('createdAt', 'desc'));
        return collectionData(sortedQuery, { idField: 'id' }) as Observable<FirestoreBunny[]>;
      }),
    );
  }

  /**
   * Enrich raw bunny data with computed happiness metrics.
   */
  private enrichBunniesWithHappiness(
    rawBunnies: FirestoreBunny[],
    userConfig: UserConfig | null,
  ): BunnyWithHappiness[] {
    const pointsPerCarrot = userConfig?.pointsPerCarrot ?? this.defaultPointsPerCarrot;
    const maxHappinessPoints = userConfig?.maxHappinessPoints ?? pointsPerCarrot * this.defaultMaxHappinessMultiplier;

    return rawBunnies.map((rawBunny) => {
      const bunny = this.mapFirestoreBunnyToBunny(rawBunny);
      const happiness = this.calculateHappiness(bunny.eventCount, pointsPerCarrot);
      const progressBarPercent = this.calculateProgressBarPercent(happiness, maxHappinessPoints);
      const mood = this.calculateMood(progressBarPercent, userConfig);

      return {
        ...bunny,
        happiness,
        mood,
        progressBarPercent,
      };
    });
  }

  /**
   * Map Firestore bunny data to domain Bunny object.
   */
  private mapFirestoreBunnyToBunny(rawBunny: FirestoreBunny): Bunny {
    return {
      id: rawBunny.id,
      name: rawBunny.name,
      colorClass: rawBunny.colorClass,
      eventCount: rawBunny.eventCount ?? 0,
      createdAt: this.normalizeTimestamp(rawBunny.createdAt),
    };
  }

  /**
   * Calculate happiness points from event count and points per carrot.
   */
  private calculateHappiness(eventCount: number, pointsPerCarrot: number): number {
    return eventCount * pointsPerCarrot;
  }

  /**
   * Calculate progress bar percentage (0-100).
   */
  private calculateProgressBarPercent(happiness: number, maxHappinessPoints: number): number {
    return Math.min(100, Math.round((happiness / maxHappinessPoints) * 100));
  }

  /**
   * Calculate mood based on happiness percentage and configurable thresholds.
   */
  private calculateMood(happinessPercent: number, userConfig: UserConfig | null): BunnyMood {
    const sadThreshold = userConfig?.moodSadThreshold ?? this.defaultSadThreshold;
    const averageThreshold = userConfig?.moodAverageThreshold ?? this.defaultAverageThreshold;

    if (happinessPercent < sadThreshold) {
      return 'sad';
    }
    if (happinessPercent < averageThreshold) {
      return 'average';
    }
    return 'happy';
  }

  /**
   * Calculate average happiness across all bunnies.
   */
  private calculateAverageHappiness(bunnies: BunnyWithHappiness[]): number {
    if (bunnies.length === 0) {
      return 0;
    }

    const totalHappiness = bunnies.reduce((sum, bunny) => sum + bunny.happiness, 0);
    return Math.round(totalHappiness / bunnies.length);
  }

  /**
   * Select a random color from the default palette.
   */
  private selectRandomColor(): BunnyColor {
    const randomIndex = Math.floor(Math.random() * this.defaultColorPalette.length);
    return this.defaultColorPalette[randomIndex];
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

  /**
   * Normalize various timestamp formats to Date object.
   */
  private normalizeTimestamp(timestamp: any): Date {
    if (!timestamp) {
      return new Date();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (timestamp?.toDate) {
      return timestamp.toDate();
    }
    if (typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    return new Date(timestamp);
  }
}

