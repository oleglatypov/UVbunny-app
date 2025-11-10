# Quick Start Guide

## Deployment Scripts

### Deploy to Firebase

```bash
# Development environment
./deploy.sh dev

# Production environment
./deploy.sh prod
```

### Destroy Resources

```bash
# Destroy dev environment (with confirmation prompt)
./destroy.sh dev

# Destroy with auto-confirm
./destroy.sh dev --confirm
```

## What Gets Deployed

- ✅ Cloud Functions (backend/functions)
- ✅ Frontend (Angular app to Firebase Hosting)
- ✅ Firestore Security Rules

## Prerequisites

- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase login (`firebase login`)
- Firebase Blaze Plan (for Cloud Functions)

## Manual Commands

If you prefer to deploy manually, see `DEPLOYMENT.md` for detailed instructions.
