# Firestore and Cloud Functions Setup Guide

## Firestore Database Setup

### Via Firebase Console

1. Go to: https://console.firebase.google.com/project/uvbunny-app-477814-afe6d/firestore
2. Click "Create database"
3. Select "Start in production mode" (we'll use security rules)
4. Choose location: `us-central` (or your preferred region)
5. Click "Enable"

## Cloud Functions Setup

### 1. Install Dependencies

```bash
cd backend/functions
npm install
```

### 2. Build TypeScript

```bash
npm run build
```

### 3. Test Locally (Optional)

```bash
# Start Firebase emulators
firebase emulators:start

# Or just functions
npm run serve
```

### 4. Deploy Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Or from functions directory
npm run deploy
```

## Functions Overview

### Required Functions

1. **onCarrotEventCreate** ✅
   - Trigger: `onCreate` at `users/{uid}/bunnies/{bunnyId}/events/{eventId}`
   - Purpose: Increments `eventCount` when carrot event is created
   - Status: Implemented

2. **onCarrotEventDelete** ✅
   - Trigger: `onDelete` at `users/{uid}/bunnies/{bunnyId}/events/{eventId}`
   - Purpose: Decrements `eventCount` when carrot event is deleted
   - Status: Implemented

### Optional Functions

3. **onBunnyDeleteCascade** ✅
   - Trigger: `onDelete` at `users/{uid}/bunnies/{bunnyId}`
   - Purpose: Deletes all child events when bunny is deleted
   - Status: Implemented

4. **onUserCreateBootstrap** ✅
   - Trigger: `onCreate` at `users/{uid}`
   - Purpose: Initializes config with default `pointsPerCarrot: 3`
   - Note: Only triggers if user document is created (optional)
   - Status: Implemented

5. **onConfigUpdate** ✅
   - Trigger: `onUpdate` at `users/{uid}/config/current`
   - Purpose: Updates cached happiness when config changes
   - Note: Optional if computing happiness in UI
   - Status: Implemented

6. **onBunnyAnalyticsSnapshot** ✅
   - Trigger: Scheduled every 60 minutes
   - Purpose: Computes and stores `stats/global.avgHappiness`
   - Status: Implemented

7. **apiHealthCheck** ✅
   - Trigger: HTTPS endpoint
   - Purpose: Health check endpoint
   - Status: Implemented

## Verification

After deploying, verify functions are running:

```bash
# Check function logs
firebase functions:log

# Test health check
curl https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/apiHealthCheck
```

## Next Steps

1. Deploy Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. Deploy functions:
   ```bash
   firebase deploy --only functions
   ```

3. Test the app - create a bunny and give carrots to verify functions work!

