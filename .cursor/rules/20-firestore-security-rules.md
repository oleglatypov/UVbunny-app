---
alwaysApply: true
---

# Firestore Security Rules

**Intent:** Generate/maintain Firestore rules aligned to our model.

**Scope:** `backend/firestore.rules`

## Requirements

- Ownership gate: only `request.auth.uid == uid` can access `users/{uid}/**`.

### Bunnies

- Create/update/delete allowed to owner.
- `name` 1..40 chars.
- `eventCount` monotonic non-decreasing on update.

### Events

- create only if:
  - `type == "CARROT_GIVEN"`
  - `carrots` int 1..50
  - `createdAt == request.time`
- update denied (immutable)
- delete allowed for owner (supports cascade delete)

### Config/current

- `pointsPerCarrot` int 1..10

## Output Format

- Provide complete rules file content.
- Keep helper function `isOwner(uid)` at top-level.
- Comment each match block.

## Example Header

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function isOwner(uid) { return request.auth != null && request.auth.uid == uid; }
    // ...
  }
}
```

