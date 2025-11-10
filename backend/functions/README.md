# Cloud Functions for UVbunny

## Setup

1. Install dependencies:
   ```bash
   cd backend/functions
   npm install
   ```

2. Build TypeScript:
   ```bash
   npm run build
   ```

3. Test locally with emulators:
   ```bash
   npm run serve
   ```

4. Deploy to Firebase:
   ```bash
   npm run deploy
   ```

## Functions

### Required Functions

1. **onCarrotEventCreate** - Increments `eventCount` when a carrot event is created
2. **onCarrotEventDelete** - Decrements `eventCount` when a carrot event is deleted

### Optional Functions

3. **onBunnyDeleteCascade** - Deletes all child events when a bunny is deleted
4. **onUserCreateBootstrap** - Initializes config when a user document is created
5. **onConfigUpdate** - Updates cached happiness when config changes (optional)
6. **onBunnyAnalyticsSnapshot** - Scheduled function to compute global stats (every 60 minutes)
7. **apiHealthCheck** - HTTPS endpoint for health checks

## Notes

- All functions use Node 20
- Functions use `firebase-functions@^5` and `firebase-admin@^12`
- Firestore database must be created via Firebase Console or CLI

