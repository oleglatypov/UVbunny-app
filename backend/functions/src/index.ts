import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { getBunnyPath, getUserConfigPath, getGlobalStatsPath } from './paths';

// Initialize Firebase Admin
admin.initializeApp();

// Get Firestore instance
const db = admin.firestore();

/**
 * Required: Triggered when a carrot event is created
 * Increments the parent bunny's eventCount in a transaction
 */
export const onCarrotEventCreate = functions.firestore
  .document('users/{uid}/bunnies/{bunnyId}/events/{eventId}')
  .onCreate(async (snap, ctx) => {
    const { type, carrots } = snap.data() as { type: string; carrots: number };

    // Validate event type and carrots
    if (type !== 'CARROT_GIVEN' || !Number.isInteger(carrots) || carrots <= 0 || carrots > 50) {
      console.warn(`Invalid event: type=${type}, carrots=${carrots}`);
      return;
    }

    const bunnyRef = db.doc(getBunnyPath(ctx.params.uid, ctx.params.bunnyId));

    try {
      await db.runTransaction(async (tx) => {
        const b = await tx.get(bunnyRef);
        if (!b.exists) {
          throw new Error(`Bunny ${ctx.params.bunnyId} not found`);
        }
        const currentCount = b.get('eventCount') ?? 0;
        tx.update(bunnyRef, { eventCount: currentCount + carrots });
      });

      console.log(`Incremented eventCount for bunny ${ctx.params.bunnyId} by ${carrots}`);
    } catch (error) {
      console.error(`Error incrementing eventCount for bunny ${ctx.params.bunnyId}:`, error);
      throw error;
    }
  });

/**
 * Required: Triggered when a carrot event is deleted
 * Decrements the parent bunny's eventCount (floored at 0)
 */
export const onCarrotEventDelete = functions.firestore
  .document('users/{uid}/bunnies/{bunnyId}/events/{eventId}')
  .onDelete(async (snap, ctx) => {
    const { carrots } = snap.data() as { carrots: number };

    // Validate carrots
    if (!Number.isInteger(carrots) || carrots <= 0 || carrots > 50) {
      console.warn(`Invalid carrots count: ${carrots}`);
      return;
    }

    const bunnyRef = db.doc(getBunnyPath(ctx.params.uid, ctx.params.bunnyId));

    try {
      await db.runTransaction(async (tx) => {
        const b = await tx.get(bunnyRef);
        if (!b.exists) {
          throw new Error(`Bunny ${ctx.params.bunnyId} not found`);
        }
        const currentCount = b.get('eventCount') ?? 0;
        const next = Math.max(0, currentCount - carrots);
        tx.update(bunnyRef, { eventCount: next });
      });

      console.log(`Decremented eventCount for bunny ${ctx.params.bunnyId} by ${carrots}`);
    } catch (error) {
      console.error(`Error decrementing eventCount for bunny ${ctx.params.bunnyId}:`, error);
      throw error;
    }
  });

/**
 * Optional: Triggered when a bunny is deleted
 * Cascades delete to all child events
 */
export const onBunnyDeleteCascade = functions.firestore
  .document('users/{uid}/bunnies/{bunnyId}')
  .onDelete(async (_, ctx) => {
    const col = db.collection(`users/${ctx.params.uid}/bunnies/${ctx.params.bunnyId}/events`);

    try {
      const snap = await col.limit(500).get();
      const batch = db.batch();

      snap.forEach((d) => batch.delete(d.ref));

      await batch.commit();
      console.log(`Deleted ${snap.size} events for bunny ${ctx.params.bunnyId}`);

      // Note: If >500 events, you'd need to loop or use recursive delete
      if (snap.size === 500) {
        console.warn(`Bunny ${ctx.params.bunnyId} had >500 events, some may remain`);
      }
    } catch (error) {
      console.error(`Error cascading delete for bunny ${ctx.params.bunnyId}:`, error);
      // Don't throw - bunny is already deleted, events cleanup is optional
    }
  });

/**
 * Optional: Triggered when a user document is created
 * Initializes config/current with default pointsPerCarrot
 */
export const onUserCreateBootstrap = functions.firestore
  .document('users/{uid}')
  .onCreate(async (_, ctx) => {
    try {
      await db.doc(getUserConfigPath(ctx.params.uid)).set(
        {
          pointsPerCarrot: 3,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
      console.log(`Initialized config for user ${ctx.params.uid}`);
    } catch (error) {
      console.error(`Error initializing config for user ${ctx.params.uid}:`, error);
      // Don't throw - config can be created manually
    }
  });

/**
 * Optional: Triggered when config is updated
 * Recomputes cached happiness for all bunnies (if using cached values)
 * Note: This is optional if you compute happiness purely in the UI
 */
export const onConfigUpdate = functions.firestore
  .document('users/{uid}/config/current')
  .onUpdate(async (chg, ctx) => {
    const ppc = (chg.after.get('pointsPerCarrot') ?? 3) as number;

    try {
      const bunnies = await db.collection(`users/${ctx.params.uid}/bunnies`).get();

      if (bunnies.empty) {
        return;
      }

      const batch = db.batch();
      bunnies.forEach((b) => {
        const count = b.get('eventCount') ?? 0;
        // Only update if you're using cachedHappiness field
        // Otherwise, happiness is computed in UI
        batch.update(b.ref, {
          cachedHappiness: count * ppc,
          cachedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
      console.log(`Updated cached happiness for ${bunnies.size} bunnies (ppc=${ppc})`);
    } catch (error) {
      console.error(`Error updating cached happiness for user ${ctx.params.uid}:`, error);
      // Don't throw - cached values are optional
    }
  });

/**
 * Optional: Scheduled function to compute/store global stats
 * Runs every 60 minutes to update avgHappiness for each user
 */
export const onBunnyAnalyticsSnapshot = functions.pubsub
  .schedule('every 60 minutes')
  .onRun(async () => {
    try {
      const users = await db.collection('users').get();

      for (const u of users.docs) {
        const bunnies = await db.collection(`users/${u.id}/bunnies`).get();

        if (bunnies.empty) {
          continue;
        }

        // Fetch config to get pointsPerCarrot
        const cfg = await db.doc(getUserConfigPath(u.id)).get();
        const ppc = cfg.get('pointsPerCarrot') ?? 3;

        // Compute average happiness
        const totalHappiness = bunnies.docs.reduce(
          (sum, b) => sum + ((b.get('eventCount') ?? 0) * ppc),
          0,
        );
        const avg = Math.round(totalHappiness / bunnies.size);

        // Update stats/global
        await db.doc(getGlobalStatsPath(u.id)).set(
          {
            avgHappiness: avg,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      }

      console.log(`Updated analytics for ${users.size} users`);
    } catch (error) {
      console.error('Error updating analytics snapshot:', error);
      throw error;
    }
  });

/**
 * Optional: HTTPS health check endpoint
 */
export const apiHealthCheck = functions.https.onRequest((_req, res) => {
  res.json({
    service: 'UVbunny Functions',
    ok: true,
    time: new Date().toISOString(),
  });
});

