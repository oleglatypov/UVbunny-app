---
alwaysApply: true
---

# Firebase CLI and CI/CD

**Intent:** All deployments via Firebase CLI; CI via GitHub Actions.

**Scope:** `.github/`, `firebase.json`, `.firebaserc`

## Firebase CLI

Use Firebase CLI for all deployments:
- `firebase deploy --only functions` - Deploy Cloud Functions
- `firebase deploy --only hosting` - Deploy frontend to Firebase Hosting
- `firebase deploy --only firestore:rules` - Deploy Firestore security rules
- `firebase deploy` - Deploy everything

Configuration files:
- `firebase.json` - Firebase project configuration (hosting, functions, rules, emulators)
- `.firebaserc` - Firebase project aliases

Do not use Terraform. All infrastructure is managed via Firebase Console or Firebase CLI.

## CI/CD

- GitHub Action builds Angular and deploys Hosting (live on main, preview on PR).
- Use secret `FIREBASE_SERVICE_ACCOUNT_JSON` for authentication.
- Deploys functions, hosting, and Firestore rules on main branch pushes.

## Deliverables

- When asked to modify deployment, update `firebase.json` or provide Firebase CLI commands.
- For CI, output full workflow file under `.github/workflows/deploy.yml`.

