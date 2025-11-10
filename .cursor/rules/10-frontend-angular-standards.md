---
alwaysApply: true
---

# Frontend Angular Standards

**Intent:** Ensure Angular code matches our stack and UI style.

**Scope:** `frontend/`

## Framework

- Angular 17+ standalone (no NgModules).
- Angular Material for UI; RxJS for state composition; `@angular/fire` modular APIs.
- Routing paths: `/login`, `/`, `/bunnies/:id`, `/settings`.

## UI

Dashboard uses Material cards with:
- SVG bunny icon (`src/assets/icons/bunny_{mood}_{color}.svg`)
- name, "Happiness: N"
- `mat-progress-bar` (0–100)
- click → details page

Add-bunny card with a big +.

Top toolbar: "UVbunny", average happiness chip, avatar/menu with Sign out.

## State

- Compute happiness = `eventCount * pointsPerCarrot`.
- `colorClass` (or color token) is assigned once at creation and persisted.

## Services

- `BunniesService`: `createBunny(name, color)`, `listBunnies$()`
- `ConfigService`: `config$` (pointsPerCarrot), `updatePointsPerCarrot(n)`
- `BunnyDetailsService`: `giveCarrots(bunnyId, n)` (transaction + increment()), `loadEventsPage(...)`

## Code Patterns

- Keep RxJS chains small; prefer `combineLatest + map`.
- Minimal optimistic UI; rely on Firestore realtime updates.
- All actionable UI elements must have accessible labels.

## Example: Component Skeleton

```typescript
// Place in frontend/src/app/dashboard/dashboard.component.ts
// GOAL: Material cards grid, icons, progress bar, click to details, add card.
```

