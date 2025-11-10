---
alwaysApply: true
---

# Frontend Firestore Access

**Intent:** Safe, consistent Firestore access patterns.

**Scope:** `frontend/`

## Data Model

```
users/{uid}/config/current       -> { pointsPerCarrot:int, updatedAt:ts }
users/{uid}/bunnies/{bunnyId}    -> { name, colorClass?, eventCount:int, createdAt:ts }
users/{uid}/bunnies/{bunnyId}/events/{eventId}
                                 -> { type:"CARROT_GIVEN", carrots:int>0, createdAt:ts }
```

## Rules of Engagement

- Read config and bunnies via AngularFire `docData` / `collectionData`.
- Compute happiness client-side via stream composition.
- Give carrots via a Firestore transaction:
  - create immutable event with `serverTimestamp()`
  - `increment(carrots)` on parent `eventCount`
- Validate carrots on client (int 1..50), surface errors with `MatSnackBar`.
- Pagination: `orderBy('createdAt','desc')`, `startAfter(lastDoc)`, `limit(10)`.

## Do

- Share collection/document path builders in a single file (e.g., `paths.ts`).
- Handle null/undefined snapshots defensively.

## Don't

- Don't mutate events after create (immutable by design).
- Don't write happiness to Firestore on the client.

