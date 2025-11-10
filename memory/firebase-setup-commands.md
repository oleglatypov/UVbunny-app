# Firebase CLI Setup Commands

## Prerequisites

1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Set your project (already configured in `.firebaserc`):
   ```bash
   firebase use uvbunny-app-477814
   ```

## Create Firebase Web App

Firebase Web Apps are typically created through the Firebase Console, but you can also use the REST API or Firebase Admin SDK. The CLI doesn't have a direct command for this.

**Option 1: Use Firebase Console (Recommended)**
1. Go to https://console.firebase.google.com
2. Select your project: `uvbunny-app-477814`
3. Click the gear icon ⚙️ → Project Settings
4. Scroll to "Your apps" section
5. Click "Add app" → Web (</> icon)
6. Register app (you can skip Firebase Hosting setup for now)
7. Copy the Firebase configuration object

**Option 2: Use Firebase Management API (Advanced)**
```bash
# Get access token
firebase login:ci

# Create web app using REST API
curl -X POST \
  "https://firebase.googleapis.com/v1beta1/projects/uvbunny-app-477814/webApps" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "UVbunny App"
  }'
```

## Create Firebase Hosting Site

**Option 1: Auto-created on first deploy (Easiest)**
The hosting site will be automatically created when you first deploy:
```bash
firebase deploy --only hosting
```

**Option 2: Create explicitly via CLI**
```bash
firebase hosting:sites:create uvbunny-app
```

**Option 3: Use Firebase Console**
1. Go to Firebase Console → Hosting
2. Click "Add another site"
3. Enter site ID: `uvbunny-app`
4. Click "Create site"

## Create Preview Channel (for PRs)

After the hosting site exists, create a preview channel:
```bash
firebase hosting:channel:create preview --expires 7d
```

Or it will be created automatically when you deploy to a preview channel:
```bash
firebase hosting:channel:deploy preview
```

## Verify Setup

Check your Firebase project configuration:
```bash
# List all apps in the project
firebase apps:list

# List hosting sites
firebase hosting:sites:list

# Check current project
firebase projects:list
```

## Complete Setup Workflow

```bash
# 1. Login and select project
firebase login
firebase use uvbunny-app-477814

# 2. Initialize Firebase (if not done)
firebase init

# 3. Create hosting site (if not auto-created)
firebase hosting:sites:create uvbunny-app

# 4. Deploy to create resources
firebase deploy --only hosting,functions,firestore:rules
```

## Get Firebase Configuration

After creating the Web App, get the configuration:

1. Firebase Console → Project Settings → General → Your apps
2. Click on your web app
3. Copy the `firebaseConfig` object
4. Update `frontend/src/environments/environment.ts` with these values

Or use the Firebase CLI to get app info:
```bash
firebase apps:list
# Then get details from console
```

## Notes

- Web Apps must be created via Console or REST API (CLI doesn't support it directly)
- Hosting sites are auto-created on first deploy, or can be created explicitly
- Preview channels are created automatically when deploying to them
- All configuration values are available in Firebase Console → Project Settings

