# Environment Configuration Setup

This project uses `.env` files to manage Firebase configuration across different environments. The environment TypeScript files are **auto-generated** from these `.env` files.

## Environment Files

- `.env` - Local development (Firebase Emulators)
- `.env.dev` - Development environment (live Firebase)
- `.env.production` - Production environment (live Firebase)
- `.env.example` - Template file (committed to git)

## Setup Instructions

### 1. Copy the Example File

```bash
cd frontend
cp .env.example .env
cp .env.example .env.dev
cp .env.example .env.production
```

### 2. Update Configuration Values

Edit each `.env` file with your Firebase configuration:

```bash
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id
APP_VERSION=0.2.0
```

### 3. Generate Environment Files

The environment files are automatically generated when you run:

- `npm start` or `npm run start:local` - Generates from `.env`
- `npm run start:dev` - Generates from `.env.dev`
- `npm run build:prod` - Generates from `.env.production`

Or manually:

```bash
npm run generate-env        # Generate all environments
npm run generate-env:local  # Generate local environment
npm run generate-env:dev    # Generate dev environment
npm run generate-env:prod   # Generate production environment
```

## Using serve.sh

For local development, use the `serve.sh` script:

```bash
cd frontend
./serve.sh          # Uses .env (local with emulators)
./serve.sh local    # Same as above
./serve.sh dev      # Uses .env.dev (live Firebase)
```

The script will:
1. Check if `.env` exists (create from `.env.example` if missing)
2. Generate environment files from `.env`
3. Install dependencies if needed
4. Start the Angular development server

## Security Notes

⚠️ **Important**: Firebase API keys in `.env` files are **public client-side keys**. They are safe to commit to version control (see `SECURITY.md`), but for better organization, we keep them in `.env` files.

- `.env*` files are in `.gitignore` (not committed)
- `.env.example` is committed (template only)
- Generated `environment*.ts` files are committed (they're generated from `.env`)

## Deployment

The `deploy.sh` script automatically:
1. Checks for `.env.dev` or `.env.production` (based on environment)
2. Generates environment files from the appropriate `.env` file
3. Builds the Angular app with the generated configuration

```bash
./scripts/deploy.sh dev   # Uses .env.dev
./scripts/deploy.sh prod  # Uses .env.production
```

## Troubleshooting

### Environment files not updating

If you change `.env` files but the app still uses old values:

1. Regenerate environment files:
   ```bash
   npm run generate-env
   ```

2. Restart the dev server

### Missing .env file

If you see warnings about missing `.env` files:

1. Copy from example:
   ```bash
   cp .env.example .env
   ```

2. Update with your Firebase configuration

3. Regenerate:
   ```bash
   npm run generate-env
   ```

