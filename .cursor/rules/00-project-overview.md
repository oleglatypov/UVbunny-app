---
alwaysApply: true
---

# Project Overview

## Project Layout

```
.github/               # CI/CD
backend/               # Cloud Functions (Node 20) and Firestore rules
frontend/              # Angular 17+ standalone app (Material, AngularFire)
memory/                # Product docs/notes (non-code, for context)
scripts/               # Dev scripts (lint, typecheck, emulators, build)
firebase.json          # Firebase configuration (hosting, functions, rules, emulators)
.firebaserc            # Firebase project aliases
README.md
```

## Authoring Conventions

- Prefer small, composable files. Each generation targets the correct folder.
- TypeScript strict in both frontend and backend.
- No `any` for domain models; define interfaces in `frontend/src/app/types/`.
- Use relative imports within each package; don't cross-import frontend ↔ backend.
- Reference shared constants (collection paths, route paths) from a single source-of-truth file:
  - `frontend/src/app/shared/paths.ts`
  - `backend/functions/src/paths.ts`

## File Placement

- Angular components/services → `frontend/src/app/...`
- Firestore security rules → `backend/firestore.rules`
- Cloud Functions → `backend/functions/src/**`
- Firebase configuration → `firebase.json`, `.firebaserc`
- GitHub Actions → `.github/workflows/**`

## Do

- Include imports, providers, and complete, runnable code in generations.
- Add minimal JSDoc with purpose + params for each public function.
- Provide tests for pure utilities (frontend `*.spec.ts`, backend with Jest).

## Don't

- Don't hardcode Firebase config; read from `environment.ts` files.
- Don't bake secrets into code or commits.

