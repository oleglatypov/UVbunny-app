# Environment Configuration Guide

This project supports three different environments for development and deployment.

## Environments

### 1. **Local** (`environment.local.ts`)
- **Purpose**: Local development with Firebase Emulators
- **Firebase**: Uses local emulators (Firestore, Auth, Functions)
- **Data**: Stored locally, not persisted
- **Use Case**: Testing without affecting real data

### 2. **Development** (`environment.dev.ts`)
- **Purpose**: Development with live Firebase
- **Firebase**: Uses real Firestore and Cloud Functions
- **Data**: Stored in your Firebase project
- **Use Case**: Testing with real Firebase services

### 3. **Production** (`environment.prod.ts`)
- **Purpose**: Production deployment
- **Firebase**: Uses real Firebase (production)
- **Data**: Production data
- **Use Case**: Deployed application

## Running the Application

### Local (with Emulators)

**Prerequisites:**
1. Start Firebase emulators:
   ```bash
   firebase emulators:start
   ```

2. In a new terminal, start the frontend:
   ```bash
   cd frontend
   npm run start:local
   ```

**What it does:**
- Connects to local Firebase emulators
- Data is stored locally (not in Firebase)
- Perfect for offline development

### Development (with Live Firebase)

```bash
cd frontend
npm run start:dev
# or
npm start  # defaults to dev
```

**What it does:**
- Connects to your real Firebase project
- Uses live Firestore and Cloud Functions
- Data is stored in Firebase

### Production

```bash
cd frontend
npm run start:prod
```

**What it does:**
- Production build with optimizations
- Connects to production Firebase
- Minified and optimized code

## Building for Deployment

### Build for Local
```bash
npm run build:local
```

### Build for Development
```bash
npm run build:dev
```

### Build for Production
```bash
npm run build:prod
# or
npm run build  # defaults to production
```

## Environment Files

All environment files are located in `src/environments/`:

- `environment.ts` - Default/fallback (used by dev)
- `environment.local.ts` - Local with emulators
- `environment.dev.ts` - Development with live Firebase
- `environment.prod.ts` - Production

## Environment Variables

Each environment file contains:

```typescript
export const environment = {
  production: boolean,        // true for prod, false otherwise
  useEmulators: boolean,      // true for local, false otherwise
  environment: string,        // 'local' | 'dev' | 'prod'
  firebase: {
    apiKey: string,
    authDomain: string,
    projectId: string,
    // ... other Firebase config
  },
};
```

## Quick Reference

| Command | Environment | Firebase | Use Case |
|---------|------------|----------|----------|
| `npm run start:local` | Local | Emulators | Local dev with emulators |
| `npm run start:dev` | Dev | Live | Dev with real Firebase |
| `npm run start:prod` | Prod | Live | Production testing |
| `npm run build:local` | Local | Emulators | Build for local |
| `npm run build:dev` | Dev | Live | Build for dev |
| `npm run build:prod` | Prod | Live | Production build |

## Switching Environments

The environment is automatically selected based on the npm script you use. Angular's build system replaces `environment.ts` with the appropriate environment file during compilation.

## Troubleshooting

### Emulators not connecting
- Make sure `firebase emulators:start` is running
- Check that `useEmulators: true` in `environment.local.ts`
- Verify emulator ports (Firestore: 8080, Auth: 9099)

### Wrong environment loaded
- Check which npm script you're using
- Verify `angular.json` fileReplacements configuration
- Clear Angular cache: `rm -rf .angular`

