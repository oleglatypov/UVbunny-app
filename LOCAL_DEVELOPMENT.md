# Local Development Guide

This guide explains how to run the UVbunny project locally for development.

## Prerequisites

- Node.js 20+ (check with `node --version`)
- npm (comes with Node.js)
- Firebase CLI: `npm install -g firebase-tools`
- Angular CLI (optional, can use npm scripts)

## Quick Start

### 1. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend functions dependencies
cd ../backend/functions
npm install
```

### 2. Set Up Firebase Emulators

Firebase emulators allow you to run Firestore, Functions, and Auth locally.

```bash
# From project root
firebase init emulators

# Select:
# - Firestore
# - Functions
# - Authentication (optional but recommended)
```

Or create `firebase.json` with emulator configuration (already done).

### 3. Start Firebase Emulators

```bash
# From project root
firebase emulators:start
```

This starts:
- Firestore emulator on `http://localhost:8080`
- Functions emulator on `http://localhost:5001`
- Auth emulator on `http://localhost:9099`
- Emulator UI on `http://localhost:4000`

### 4. Update Frontend Environment for Local Development

Update `frontend/src/environments/environment.ts` to use emulator:

```typescript
export const environment = {
  production: false,
  firebase: {
    // ... your Firebase config ...
    useEmulator: true, // Add this
  },
};
```

Or update `main.ts` to connect to emulators:

```typescript
import { connectFirestoreEmulator } from '@angular/fire/firestore';
import { connectAuthEmulator } from '@angular/fire/auth';

// After initializing Firebase
if (!environment.production) {
  connectFirestoreEmulator(getFirestore(), 'localhost', 8080);
  connectAuthEmulator(getAuth(), 'http://localhost:9099');
}
```

### 5. Run Frontend Development Server

```bash
cd frontend
npm start
# or
ng serve
```

Frontend will be available at `http://localhost:4200`

### 6. Build and Watch Backend Functions (Optional)

If you're developing functions:

```bash
cd backend/functions
npm run build
# Watch mode (rebuilds on changes)
npm run build -- --watch
```

## Complete Local Setup

### Step-by-Step

1. **Install all dependencies:**
   ```bash
   # Frontend
   cd frontend && npm install && cd ..
   
   # Backend
   cd backend/functions && npm install && cd ../..
   ```

2. **Build backend functions:**
   ```bash
   cd backend/functions
   npm run build
   cd ../..
   ```

3. **Start Firebase emulators:**
   ```bash
   firebase emulators:start
   ```
   Keep this terminal running.

4. **In a new terminal, start frontend:**
   ```bash
   cd frontend
   npm start
   ```

5. **Open browser:**
   - Frontend: http://localhost:4200
   - Emulator UI: http://localhost:4000

## Environment Configuration

### For Local Development

The frontend needs to connect to Firebase emulators. Update `frontend/src/main.ts`:

```typescript
import { connectFirestoreEmulator } from '@angular/fire/firestore';
import { connectAuthEmulator } from '@angular/fire/auth';
import { getFirestore } from '@angular/fire/firestore';
import { getAuth } from '@angular/fire/auth';

// After bootstrapApplication
if (!environment.production) {
  connectFirestoreEmulator(getFirestore(), 'localhost', 8080);
  connectAuthEmulator(getAuth(), 'http://localhost:9099');
}
```

## Testing the Full Stack

1. **Start emulators** (Firestore, Functions, Auth)
2. **Start frontend** (`npm start` in frontend/)
3. **Sign in** - Use emulator auth (no real Google sign-in needed)
4. **Create bunnies** - Data goes to local Firestore
5. **Give carrots** - Functions run locally and update eventCount
6. **View data** - Check Emulator UI at http://localhost:4000

## Troubleshooting

### Port Already in Use

If ports are already in use:
```bash
# Kill process on port 4200 (frontend)
lsof -ti:4200 | xargs kill -9

# Kill process on port 8080 (Firestore emulator)
lsof -ti:8080 | xargs kill -9
```

### Emulator Connection Issues

Make sure emulators are running before starting the frontend.

### Functions Not Updating

Rebuild functions after changes:
```bash
cd backend/functions
npm run build
```

## Useful Commands

```bash
# Start emulators only
firebase emulators:start --only firestore,functions,auth

# Start emulators with UI
firebase emulators:start --ui

# View emulator logs
firebase emulators:exec "echo 'Emulators running'"

# Clear emulator data
# Stop emulators, then delete .firebase/emulators directory
```

## Next Steps

- Create bunnies and test the full flow
- Check Firestore data in Emulator UI
- Test Cloud Functions locally
- Verify security rules work correctly

