import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, query, serverTimestamp, doc, deleteDoc, orderBy } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, of, combineLatest, map, switchMap, shareReplay } from 'rxjs';
import { Bunny, BunnyWithHappiness, BunnyColor } from '../types';
import { getBunniesCollectionPath } from '../shared/paths';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class BunniesService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private config = inject(ConfigService);

  /** Random palette used when color not provided */
  private readonly palette: BunnyColor[] = ['cream', 'gray', 'brown', 'white', 'black', 'pink'];

  /** Stream: currently signed-in user's UID (null if signed out) */
  private readonly uid$ = authState(this.auth).pipe(
    map((u) => u?.uid ?? null),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /**
   * List all bunnies with computed happiness, mood, and progressBarPercent (0..100)
   * 
   * Uses combineLatest to reactively combine bunny data with config.
   * When config.pointsPerCarrot changes, this automatically recalculates all happiness values.
   * This enables retroactive behavior - changing pointsPerCarrot instantly updates all bunnies.
   */
  readonly bunnies$: Observable<BunnyWithHappiness[]> = combineLatest([
    this.uid$.pipe(
      switchMap((uid) => {
        if (!uid) return of([] as any[]);
        const bunniesRef = collection(this.firestore, getBunniesCollectionPath(uid));
        // Sort by createdAt descending (newest first)
        const bunniesQuery = query(bunniesRef, orderBy('createdAt', 'desc'));
        return collectionData(bunniesQuery, { idField: 'id' });
      }),
    ),
    this.config.config$,
  ]).pipe(
    map(([raw, cfg]: any[]) => {
      const pointsPerCarrot = cfg?.pointsPerCarrot ?? 3;
      const maxHap = cfg?.maxHappinessPoints ?? pointsPerCarrot * 100; // default cap = 100 carrots worth

      return (raw as any[]).map((bunny) => {
        const data: Bunny = {
          id: bunny.id,
          name: bunny.name,
          colorClass: bunny.colorClass,
          eventCount: bunny.eventCount ?? 0,
          createdAt: this.convertTimestamp(bunny.createdAt),
        };

        // Retroactive happiness calculation: uses current pointsPerCarrot from config
        // When config changes, this recalculates automatically via combineLatest
        const happiness = data.eventCount * pointsPerCarrot;
        const mood = this.getMood(happiness);
        const progressBarPercent = Math.min(100, Math.round((happiness / maxHap) * 100));

        return { ...data, happiness, mood, progressBarPercent } as BunnyWithHappiness & { progressBarPercent: number };
      });
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /** Overall average happiness across all bunnies (0 if none) */
  readonly averageHappiness$: Observable<number> = this.bunnies$.pipe(
    map((list) => (list.length ? Math.round(list.reduce((s, b) => s + b.happiness, 0) / list.length) : 0)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /**
   * Create a new bunny
   * Returns new document ID (Promise) for easy usage in components.
   */
  async createBunny(name: string, color?: BunnyColor): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const selectedColor = color ?? this.palette[(Math.random() * this.palette.length) | 0];
    const bunniesRef = collection(this.firestore, getBunniesCollectionPath(user.uid));
    const docRef = await addDoc(bunniesRef, {
      name: name.trim(),
      colorClass: selectedColor,
      eventCount: 0,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  /**
   * Delete a bunny from Firestore
   * Note: Cloud Function onBunnyDeleteCascade will handle deleting associated events
   */
  async deleteBunny(bunnyId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const bunnyRef = doc(this.firestore, getBunniesCollectionPath(user.uid), bunnyId);
    await deleteDoc(bunnyRef);
    // Reactive stream will automatically update via collectionData
  }

  /** Mood buckets based on absolute happiness points (not percent) */
  //TODO: make this calculated based on current pointsPerCarrot config
  private getMood(happiness: number): 'sad' | 'average' | 'happy' {
    if (happiness < 30) return 'sad'; // < 10 carrots @ 3 points each
    if (happiness >= 70) return 'happy'; // ≥ ~24 carrots
    return 'average';
  }

  /** Normalizes Firestore Timestamp → Date */
  private convertTimestamp(ts: any): Date {
    if (!ts) return new Date();
    if (ts instanceof Date) return ts;
    if (ts?.toDate) return ts.toDate();
    if (typeof ts === 'number') return new Date(ts);
    return new Date(ts);
  }
}

