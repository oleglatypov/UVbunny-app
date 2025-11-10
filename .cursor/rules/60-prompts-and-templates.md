---
alwaysApply: true
---

# Prompts and Templates

**Intent:** Provide ready prompts/templates Cursor can reuse in chat.

**Scope:** Whole workspace.

## Reusable Prompts

### Scaffold Dashboard

Generate a standalone DashboardComponent (Angular 17) with Material cards using icons from `src/assets/icons/`. Each card shows name, icon, "Happiness: N", and a `mat-progress-bar`. Clicking a card routes to `/bunnies/:id`. Include an Add Bunny card. Persist a random `colorClass` at create. Use AngularFire and compute happiness from `eventCount * pointsPerCarrot`.

### Bunny Details

Create `BunnyDetailsService` + `BunnyDetailsComponent`: `giveCarrots(bunnyId, n)` via transaction that creates event + `increment(n)`, events pagination (10 per page, `orderBy('createdAt','desc')`, `startAfter`), and a Chart.js line chart over daily cumulative carrots * current ppc.

### Firestore Rules

Write `backend/firestore.rules` enforcing owner-only access, immutable events (carrots 1..50), and monotonic non-decreasing `eventCount`. Include comments and helper `isOwner(uid)`.

### Functions

Create `backend/functions/src/index.ts` exporting `onCarrotEventCreate` (increment) and `onCarrotEventDelete` (decrement). Node 20, Admin SDK initialized once.

### Firebase Deployment

Update `firebase.json` to add additional hosting sites or functions. Provide Firebase CLI commands for deployment.

## Templates

Express minimal service (if needed), Angular component/service skeletons, Jest test stubs: keep them discoverable under `memory/templates/`.

