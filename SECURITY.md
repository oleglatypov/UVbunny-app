# Security Notes

## Firebase Configuration

The Firebase configuration values in `frontend/src/environments/*.ts` files are **public client-side keys**. These are safe to commit to version control because:

- Firebase API keys are designed to be public and are restricted by domain/app ID
- They are used in client-side JavaScript and are visible to anyone using the app
- Security is enforced through Firebase Security Rules and App Check (if configured)

### What's Public (Safe to Commit)
- `apiKey` - Public Firebase API key
- `authDomain` - Public authentication domain
- `projectId` - Public project identifier
- `storageBucket` - Public storage bucket name
- `messagingSenderId` - Public messaging sender ID
- `appId` - Public app identifier
- `measurementId` - Public Google Analytics ID

### What Should NEVER Be Committed
- Service account JSON files (`service-account-*.json`)
- Private keys (`.pem`, `.key` files)
- Environment variables with secrets (`.env` files with actual secrets)
- Firebase Admin SDK private keys
- OAuth client secrets

## Environment Files

All environment files (`environment*.ts`) contain public Firebase configuration. These are intentionally committed to the repository.

If you need to use different Firebase projects for different environments, update the values in the respective environment files.

