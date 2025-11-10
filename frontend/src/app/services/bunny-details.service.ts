import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot, serverTimestamp } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { CarrotEvent } from '../types';
import { getEventsCollectionPath } from '../shared/paths';

@Injectable({
  providedIn: 'root',
})
export class BunnyDetailsService {
  constructor(
    private firestore: Firestore,
    private auth: Auth,
  ) {}

  /**
   * Give carrots to a bunny (transaction: create event + increment eventCount)
   */
  giveCarrots(bunnyId: string, carrots: number): Observable<void> {
    if (carrots < 1 || carrots > 50) {
      throw new Error('carrots must be between 1 and 50');
    }

    return new Observable((subscriber) => {
      const unsubscribe = this.auth.onAuthStateChanged(async (user) => {
        if (!user) {
          subscriber.error(new Error('User not authenticated'));
          return;
        }

        try {
          const eventsRef = collection(this.firestore, getEventsCollectionPath(user.uid, bunnyId));

          // Create the event - Cloud Function will handle incrementing eventCount
          const eventData: Omit<CarrotEvent, 'id'> = {
            type: 'CARROT_GIVEN',
            carrots,
            createdAt: new Date(),
            source: 'ui', // Track that this event was created from the UI
          };

          await addDoc(eventsRef, {
            ...eventData,
            createdAt: serverTimestamp(),
          });

          subscriber.next(undefined);
          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      });
      return unsubscribe;
    });
  }

  /**
   * Load events page (10 per page, ordered by createdAt desc)
   */
  loadEventsPage(
    bunnyId: string,
    lastDoc?: QueryDocumentSnapshot,
  ): Observable<{ events: CarrotEvent[]; lastDoc: QueryDocumentSnapshot | null }> {
    return new Observable((subscriber) => {
      const unsubscribe = this.auth.onAuthStateChanged(async (user) => {
        if (!user) {
          subscriber.error(new Error('User not authenticated'));
          return;
        }

        try {
          const eventsRef = collection(this.firestore, getEventsCollectionPath(user.uid, bunnyId));
          // In AngularFire 20, getDocs() requires a Query, not a CollectionReference
          // We must wrap the CollectionReference in query() with orderBy/limit to create a Query
          let q = query(eventsRef, orderBy('createdAt', 'desc'), limit(10));

          if (lastDoc) {
            q = query(eventsRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(10));
          }

          const snapshot = await getDocs(q);
          const events: CarrotEvent[] = [];
          let newLastDoc: QueryDocumentSnapshot | null = null;

          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            // AngularFire automatically converts Firestore Timestamps to Date
            const createdAt = data['createdAt'] instanceof Date
              ? data['createdAt']
              : (data['createdAt'] as any)?.toDate?.() || new Date();
            events.push({
              id: docSnap.id,
              type: data['type'] as 'CARROT_GIVEN',
              carrots: data['carrots'] as number,
              createdAt,
              source: data['source'] as 'ui' | 'function' | undefined,
              notes: data['notes'] as string | undefined,
            });
            newLastDoc = docSnap;
          });

          subscriber.next({ events, lastDoc: newLastDoc });
          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      });
      return unsubscribe;
    });
  }
}

