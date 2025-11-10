# Deployment Guide

This project uses Firebase CLI for all deployments. No Terraform is used.

## Prerequisites

- **Node.js 20+** (required for Angular 20)
- **Firebase CLI** installed and authenticated
- **Firebase Blaze Plan** (required for Cloud Functions)

## Quick Deploy (Using Scripts)

### Deploy Everything

```bash
# Deploy to dev environment (default)
./deploy.sh dev

# Deploy to production
./deploy.sh prod
```

The script will:
1. Build Cloud Functions (TypeScript → JavaScript)
2. Build Frontend (Angular app)
3. Deploy Functions, Hosting, and Firestore Rules to Firebase
4. Display deployment URLs

### Destroy Resources

```bash
# Destroy dev environment
./destroy.sh dev

# Destroy with auto-confirm (no prompts)
./destroy.sh dev --confirm
```

⚠️ **Warning**: This will delete Cloud Functions and optionally the Hosting site. Firestore data must be deleted manually.

## Manual Deploy Commands

### Deploy Everything

```bash
firebase deploy --project uvbunny-app-477814-afe6d
```

### Deploy Individual Services

#### Deploy Cloud Functions

```bash
cd backend/functions
npm install
npm run build
cd ../..
firebase deploy --only functions --project uvbunny-app-477814-afe6d
```

#### Deploy Frontend

```bash
cd frontend
npm install
npm run build:prod
cd ..
firebase deploy --only hosting --project uvbunny-app-477814-afe6d
```

#### Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules --project uvbunny-app-477814-afe6d
```

## Development Workflow

### Local Development

1. **Start Firebase Emulators:**
   ```bash
   firebase emulators:start
   ```

2. **Start Frontend (in another terminal):**
   ```bash
   cd frontend
   npm start
   ```

3. **Build Functions Locally:**
   ```bash
   cd backend/functions
   npm run build
   ```

### Production Deployment

1. **Build and Deploy Functions:**
   ```bash
   cd backend/functions
   npm install
   npm run build
   cd ../..
   firebase deploy --only functions --project uvbunny-app-477814-afe6d
   ```

2. **Build and Deploy Frontend:**
   ```bash
   cd frontend
   npm install
   npm run build:prod
   cd ..
   firebase deploy --only hosting --project uvbunny-app-477814-afe6d
   ```

3. **Deploy Firestore Rules:**
   ```bash
   firebase deploy --only firestore:rules --project uvbunny-app-477814-afe6d
   ```

## Project URLs

- **Hosting**: https://uvbunny-app-477814-afe6d.web.app
- **Console**: https://console.firebase.google.com/project/uvbunny-app-477814-afe6d/overview

## Environment Configuration

The project supports three environments:
- **Local**: `npm run start:local` (uses emulators)
- **Dev**: `npm run start:dev` (uses live Firebase)
- **Prod**: `npm run build:prod` (production build)

See `frontend/ENVIRONMENTS.md` for details.

