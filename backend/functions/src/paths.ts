/**
 * Shared path builders for Firestore collections and documents
 * Single source of truth for all Firestore paths
 */

/**
 * Get user config document path
 */
export function getUserConfigPath(uid: string): string {
  return `users/${uid}/config/current`;
}

/**
 * Get bunnies collection path for a user
 */
export function getBunniesCollectionPath(uid: string): string {
  return `users/${uid}/bunnies`;
}

/**
 * Get a specific bunny document path
 */
export function getBunnyPath(uid: string, bunnyId: string): string {
  return `users/${uid}/bunnies/${bunnyId}`;
}

/**
 * Get events collection path for a bunny
 */
export function getEventsCollectionPath(uid: string, bunnyId: string): string {
  return `users/${uid}/bunnies/${bunnyId}/events`;
}

/**
 * Get a specific event document path
 */
export function getEventPath(uid: string, bunnyId: string, eventId: string): string {
  return `users/${uid}/bunnies/${bunnyId}/events/${eventId}`;
}

/**
 * Get global stats document path for a user
 */
export function getGlobalStatsPath(uid: string): string {
  return `users/${uid}/stats/global`;
}

