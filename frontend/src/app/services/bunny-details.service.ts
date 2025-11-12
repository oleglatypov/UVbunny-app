import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot, serverTimestamp } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { CarrotEvent } from '../types';
import { getEventsCollectionPath } from '../shared/paths';

interface FirestoreEventData {
  type: 'CARROT_GIVEN';
  carrots: number;
  createdAt: any;
  source?: 'ui' | 'function';
  notes?: string;
}

interface EventsPageResult {
  events: CarrotEvent[];
  lastDoc: QueryDocumentSnapshot | null;
}

@Injectable({
  providedIn: 'root',
})
export class BunnyDetailsService {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);

  private readonly minCarrots = 1;
  private readonly maxCarrots = 50;
  private readonly eventsPerPage = 10;
  private readonly eventSource = 'ui' as const;

  /**
   * Give carrots to a bunny.
   * Cloud Function will handle incrementing eventCount automatically.
   */
  giveCarrots(bunnyId: string, carrots: number): Observable<void> {
    this.validateCarrotAmount(carrots);

    return new Observable((subscriber) => {
      const unsubscribe = this.auth.onAuthStateChanged(async (user) => {
        if (!user) {
          subscriber.error(new Error('User not authenticated'));
          return;
        }

        try {
          await this.createCarrotEvent(user.uid, bunnyId, carrots);
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
   * Load paginated events for a bunny (10 per page, ordered by createdAt desc).
   */
  loadEventsPage(
    bunnyId: string,
    lastDocument?: QueryDocumentSnapshot,
  ): Observable<EventsPageResult> {
    return new Observable((subscriber) => {
      const unsubscribe = this.auth.onAuthStateChanged(async (user) => {
        if (!user) {
          subscriber.error(new Error('User not authenticated'));
          return;
        }

        try {
          const result = await this.fetchEventsPage(user.uid, bunnyId, lastDocument);
          subscriber.next(result);
          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      });
      return unsubscribe;
    });
  }

  /**
   * Create a carrot event in Firestore.
   */
  private async createCarrotEvent(userId: string, bunnyId: string, carrots: number): Promise<void> {
    const eventsCollection = collection(this.firestore, getEventsCollectionPath(userId, bunnyId));
    const eventData: Omit<CarrotEvent, 'id'> = {
      type: 'CARROT_GIVEN',
      carrots,
      createdAt: new Date(),
      source: this.eventSource,
    };

    await addDoc(eventsCollection, {
      ...eventData,
      createdAt: serverTimestamp(),
    });
  }

  /**
   * Fetch a page of events from Firestore.
   */
  private async fetchEventsPage(
    userId: string,
    bunnyId: string,
    lastDocument?: QueryDocumentSnapshot,
  ): Promise<EventsPageResult> {
    const eventsCollection = collection(this.firestore, getEventsCollectionPath(userId, bunnyId));
    const eventsQuery = this.buildEventsQuery(eventsCollection, lastDocument);
    const querySnapshot = await getDocs(eventsQuery);

    const events = this.mapDocumentsToCarrotEvents(querySnapshot);
    const newLastDocument = this.getLastDocument(querySnapshot);

    return { events, lastDoc: newLastDocument };
  }

  /**
   * Build Firestore query for events pagination.
   */
  private buildEventsQuery(
    eventsCollection: any,
    lastDocument?: QueryDocumentSnapshot,
  ) {
    const baseQuery = query(
      eventsCollection,
      orderBy('createdAt', 'desc'),
      limit(this.eventsPerPage),
    );

    if (lastDocument) {
      return query(
        eventsCollection,
        orderBy('createdAt', 'desc'),
        startAfter(lastDocument),
        limit(this.eventsPerPage),
      );
    }

    return baseQuery;
  }

  /**
   * Map Firestore documents to CarrotEvent objects.
   */
  private mapDocumentsToCarrotEvents(querySnapshot: any): CarrotEvent[] {
    const events: CarrotEvent[] = [];

    querySnapshot.forEach((documentSnapshot: QueryDocumentSnapshot) => {
      const eventData = documentSnapshot.data() as FirestoreEventData;
      const createdAt = this.normalizeTimestamp(eventData.createdAt);

      events.push({
        id: documentSnapshot.id,
        type: eventData.type,
        carrots: eventData.carrots,
        createdAt,
        source: eventData.source,
        notes: eventData.notes,
      });
    });

    return events;
  }

  /**
   * Get the last document from query snapshot for pagination.
   */
  private getLastDocument(querySnapshot: any): QueryDocumentSnapshot | null {
    let lastDocument: QueryDocumentSnapshot | null = null;

    querySnapshot.forEach((documentSnapshot: QueryDocumentSnapshot) => {
      lastDocument = documentSnapshot;
    });

    return lastDocument;
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
   * Validate carrot amount is within allowed range.
   */
  private validateCarrotAmount(carrots: number): void {
    if (carrots < this.minCarrots || carrots > this.maxCarrots) {
      throw new Error(`carrots must be between ${this.minCarrots} and ${this.maxCarrots}`);
    }
  }
}

