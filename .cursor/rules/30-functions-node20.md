---
alwaysApply: true
---

# Cloud Functions (Node 20)

**Intent:** Patterns for backend Cloud Functions.

**Scope:** `backend/functions/`

## Runtime

- Node 20, `firebase-functions@^5`, `firebase-admin@^12`.
- Exported functions:
  - `onCarrotEventCreate` (onCreate events): increment parent in transaction.
  - `onCarrotEventDelete` (onDelete events): decrement floor(0).
- Optional:
  - `onConfigUpdate` to cache `cachedHappiness` (projection)
  - `onBunnyDeleteCascade` to cleanup events

## Conventions

- Single `admin.initializeApp()` in `index.ts`.
- Reuse path builders from `backend/functions/src/paths.ts`.
- Defensive validation even if rules exist.
- Small transactions; avoid multi-doc fan-out if not required.

## Example Stub

```typescript
// backend/functions/src/index.ts
// GOAL: Implement onCreate/onDelete triggers; use runTransaction.
```

