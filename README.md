# UVbunny-app 🐇

A full-stack web application that helps users monitor and manage the happiness of their virtual bunnies. Track carrot-giving events, adjust happiness calculations, and watch your bunnies thrive!

## 📋 Project Overview

UVbunny is a modern web application built with Angular and Firebase that allows users to:

- **Create and manage virtual bunnies** with different colors and personalities
- **Track happiness** by giving carrots and monitoring mood changes
- **Adjust happiness calculations** retroactively as understanding of bunny psychology evolves
- **View analytics** including average happiness across all bunnies
- **Real-time updates** using Firebase Firestore reactive streams

The application uses an event-sourcing architecture where all carrot-giving events are stored immutably, and happiness is calculated reactively based on current configuration settings.

## 🛠️ Tech Stack

- **Frontend:** Angular 20 (standalone APIs, Angular Material, RxJS, AngularFire)
- **Backend:** Firebase Firestore (Native mode) + Cloud Functions (Node 20)
- **Authentication:** Google Sign-In (Firebase Auth)
- **Deployment:** Firebase CLI (Hosting, Functions, Firestore Rules)
- **Design:** Material Design with custom SVG bunny icons (mood-based variants)
- **State Management:** RxJS Observables with reactive Firestore streams

## 📁 Project Structure

```
UVbunny-app/
├── .github/              # GitHub Actions workflows (CI/CD)
├── backend/
│   ├── firestore.rules   # Firestore security rules
│   └── functions/        # Cloud Functions (Node 20, TypeScript)
│       ├── src/
│       │   ├── index.ts  # Function definitions
│       │   └── paths.ts  # Firestore path utilities
│       └── package.json
├── frontend/             # Angular 20 application
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/     # Authentication components
│   │   │   ├── dashboard/# Dashboard with bunny cards
│   │   │   ├── bunny-details/ # Individual bunny view
│   │   │   ├── settings/ # Configuration page
│   │   │   ├── services/ # Angular services (reactive)
│   │   │   ├── shared/   # Shared utilities
│   │   │   └── types/    # TypeScript interfaces
│   │   ├── assets/       # SVG icons, images
│   │   └── environments/ # Environment configs (auto-generated)
│   ├── scripts/
│   │   └── generate-env.js # Environment file generator
│   ├── .env.example       # Environment template
│   ├── serve.sh          # Local development script
│   └── package.json
├── scripts/
│   ├── deploy.sh         # Deployment script
│   └── destroy.sh        # Cleanup script
├── memory/               # Product documentation and notes
├── firebase.json         # Firebase configuration
├── .firebaserc           # Firebase project aliases
└── README.md
```

## ✨ Core Features

1. **Dashboard**
   - View all bunnies in a responsive grid layout
   - See happiness levels with color-coded progress bars
   - Display average happiness across all bunnies
   - Add new bunnies with color selection
   - Mood-based SVG icons (sad, average, happy)

2. **Bunny Details**
   - Give carrots to bunnies (1-50 at a time)
   - View event feed with pagination
   - See happiness trends over time
   - Real-time updates via Firestore streams

3. **Configuration Page**
   - Adjust "Points per Carrot" (1-10) with Material slider
   - Real-time impact preview
   - Retroactive happiness recalculation
   - Save configuration to Firestore

4. **Authentication**
   - Google Sign-In via Firebase Auth
   - Redirect-based authentication (works with Firebase Hosting)
   - User-specific data isolation

## 🚀 Prerequisites

Before you begin, ensure you have:

- **Node.js 20.19.0+ or 22.12.0+** (check with `node --version`)
  - ⚠️ **Important:** Angular 20 requires Node.js 20.19.0+ or 22.12.0+
  - If you're using Node.js 18 or earlier, upgrade using:
    ```bash
    # Using nvm (recommended)
    nvm install 20
    nvm use 20
    
    # Or download from https://nodejs.org/
    ```
- **npm** (comes with Node.js)
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Firebase Account** with Blaze Plan (required for Cloud Functions)
- **Java (OpenJDK)** for Firebase Emulators (see `INSTALL_JAVA.md`)

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd UVbunny-app
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend functions dependencies
cd ../backend/functions
npm install
cd ../..
```

### 3. Configure Environment Files

The project uses `.env` files for Firebase configuration. Environment TypeScript files are auto-generated from these.

```bash
cd frontend

# Copy example files
cp .env.example .env
cp .env.example .env.dev
cp .env.example .env.production

# Edit each file with your Firebase configuration
# See frontend/ENV_SETUP.md for details
```

Each `.env` file should contain:

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

### 4. Generate Environment Files

```bash
cd frontend
npm run generate-env
```

This generates `environment*.ts` files from your `.env` files.

### 5. Configure Firebase

```bash
# Login to Firebase
firebase login

# Set your Firebase project
firebase use uvbunny-app-477814-afe6d

# Or use your own project ID
firebase use your-project-id
```

## 🏃 Running the Application

### Local Development (with Firebase Emulators)

#### Option 1: Using serve.sh (Recommended)

```bash
cd frontend
./serve.sh          # Uses .env (local with emulators)
./serve.sh local    # Same as above
./serve.sh dev      # Uses .env.dev (live Firebase)
```

The script will:
1. Check/create `.env` file
2. Generate environment files
3. Install dependencies if needed
4. Start Angular dev server

#### Option 2: Manual Steps

**Terminal 1: Start Firebase Emulators**

```bash
# From project root
firebase emulators:start
```

This starts:
- Firestore emulator: `http://localhost:8080`
- Functions emulator: `http://localhost:5001`
- Auth emulator: `http://localhost:9099`
- Emulator UI: `http://localhost:4000`

**Terminal 2: Start Frontend**

```bash
cd frontend

# Generate environment files (if not done)
npm run generate-env:local

# Start development server
npm start
# or
npm run start:local
```

The app will be available at `http://localhost:4200`

### Development with Live Firebase

```bash
cd frontend

# Generate from .env.dev
npm run generate-env:dev

# Start with dev configuration
npm run start:dev
```

## 🔨 Building the Application

### Build for Production

```bash
cd frontend

# Generate environment files from .env.production
npm run generate-env:prod

# Build production bundle
npm run build:prod
```

Output: `frontend/dist/uvbunny-app/`

### Build for Development

```bash
cd frontend

# Generate environment files
npm run generate-env:dev

# Build development bundle
npm run build:dev
```

### Build for Local Testing

```bash
cd frontend

# Generate environment files
npm run generate-env:local

# Build local bundle
npm run build:local
```

### Build Backend Functions

```bash
cd backend/functions

# Install dependencies (if needed)
npm install

# Build TypeScript
npm run build
```

Output: `backend/functions/lib/`

## 🚀 Deployment

### Quick Deploy (Using Scripts)

The project includes deployment scripts that handle building and deploying everything:

#### Basic Usage

```bash
# Deploy everything to dev environment (default)
./scripts/deploy.sh dev

# Deploy everything to production
./scripts/deploy.sh prod

# Show help and all available options
./scripts/deploy.sh --help
```

#### Deployment Options

**Frontend-Only Deployment:**
```bash
# Deploy only frontend (skip functions and rules) - faster for UI updates
./scripts/deploy.sh dev --frontend-only
./scripts/deploy.sh prod --frontend-only

# Short form
./scripts/deploy.sh dev -f
```

**Deploy to Preview Channel:**
```bash
# Deploy to a preview channel (creates preview URL)
./scripts/deploy.sh dev --channel preview-123
./scripts/deploy.sh prod --channel staging

# Short form
./scripts/deploy.sh dev -c preview-123
```

**Deploy to Channel with Expiration:**
```bash
# Deploy to channel with expiration duration (max 30d)
./scripts/deploy.sh dev --channel preview-123 --expires 7d
./scripts/deploy.sh prod --channel staging --expires 14d

# Short form
./scripts/deploy.sh dev -c preview-123 -e 30d
```

**Combined Options:**
```bash
# Deploy only frontend to a preview channel
./scripts/deploy.sh dev --frontend-only --channel feature-branch

# Deploy to channel with expiration (frontend-only)
./scripts/deploy.sh prod -f -c staging -e 30d
```

#### What the Script Does

The deployment script will:
1. ✅ Check Node.js version (requires 20+)
2. ✅ Build Cloud Functions (TypeScript → JavaScript) - *skipped if `--frontend-only`*
3. ✅ Check/create `.env.dev` or `.env.production`
4. ✅ Generate environment files from `.env` file
5. ✅ Build Frontend (production-optimized)
6. ✅ Deploy Functions, Hosting, and Firestore Rules - *or only Hosting if `--frontend-only`*
7. ✅ Display deployment URLs (including channel URL if applicable)

#### Channel URLs

When deploying to a channel, you'll get a preview URL:
- **Channel URL**: `https://uvbunny-app-477814-afe6d--{channel-name}.web.app`
- **Main URL**: `https://uvbunny-app-477814-afe6d.web.app` (unchanged)

Channels are perfect for:
- Feature branch previews
- Staging environments
- Client reviews
- Testing before production

### Manual Deployment

#### Deploy Everything

```bash
firebase deploy --project uvbunny-app-477814-afe6d
```

#### Deploy Individual Services

**Deploy Cloud Functions:**

```bash
cd backend/functions
npm install
npm run build
cd ../..
firebase deploy --only functions --project uvbunny-app-477814-afe6d
```

**Deploy Frontend:**

```bash
cd frontend
npm install
npm run generate-env:prod  # Generate from .env.production
npm run build:prod
cd ..
firebase deploy --only hosting --project uvbunny-app-477814-afe6d
```

**Deploy Firestore Rules:**

```bash
firebase deploy --only firestore:rules --project uvbunny-app-477814-afe6d
```

### Destroy Resources

```bash
# Destroy dev environment (with confirmation)
./scripts/destroy.sh dev

# Destroy with auto-confirm
./scripts/destroy.sh dev --confirm
```

## 🔧 Development Workflow

### Environment Configuration

The project supports three environments:

- **Local** (`.env`): Firebase Emulators, development mode
- **Dev** (`.env.dev`): Live Firebase, development mode
- **Production** (`.env.production`): Live Firebase, production mode

See `frontend/ENV_SETUP.md` for detailed environment configuration.

### Available Scripts

**Frontend:**

```bash
cd frontend

# Development
npm start              # Start dev server (uses .env)
npm run start:local    # Start with emulators
npm run start:dev      # Start with live Firebase
npm run start:prod     # Start production build locally

# Building
npm run build          # Production build
npm run build:local    # Local build
npm run build:dev      # Dev build
npm run build:prod     # Production build

# Environment generation
npm run generate-env        # Generate all environments
npm run generate-env:local # Generate local
npm run generate-env:dev   # Generate dev
npm run generate-env:prod  # Generate production

# Other
npm test              # Run tests
npm run lint          # Lint code
```

**Backend:**

```bash
cd backend/functions

npm install           # Install dependencies
npm run build         # Build TypeScript
npm run serve         # Serve locally (with emulators)
```

### Code Structure

- **Services**: Reactive services using RxJS and AngularFire
  - `BunniesService`: Manages bunnies with reactive happiness calculation
  - `ConfigService`: Manages user configuration (points per carrot)
  - `BunnyDetailsService`: Handles carrot events and event feed
  - `AuthService`: Google Sign-In authentication

- **Components**: Standalone Angular components
  - `DashboardComponent`: Main bunny grid view
  - `BunnyDetailsComponent`: Individual bunny view
  - `SettingsComponent`: Configuration page
  - `LoginComponent`: Authentication

- **Types**: TypeScript interfaces in `frontend/src/app/types/`

## 📚 Additional Documentation

- `DEPLOYMENT.md` - Detailed deployment guide
- `LOCAL_DEVELOPMENT.md` - Local development setup
- `QUICK_START.md` - Quick reference guide
- `SECURITY.md` - Security notes about Firebase keys
- `INSTALL_JAVA.md` - Java installation for emulators
- `frontend/ENV_SETUP.md` - Environment configuration guide
- `frontend/ENVIRONMENTS.md` - Environment details

## 🔒 Security

Firebase API keys in environment files are **public client-side keys** and are safe to commit. Security is enforced through:

- Firebase Security Rules (Firestore)
- Firebase App Check (optional)
- Domain restrictions on API keys

See `SECURITY.md` for more details.

## 🐛 Troubleshooting

### Environment files not updating

```bash
cd frontend
npm run generate-env
# Restart dev server
```

### Missing .env file

```bash
cd frontend
cp .env.example .env
# Edit .env with your configuration
npm run generate-env
```

### Node.js version issues

```bash
# Check version
node --version

# Use nvm to switch to Node 20
nvm install 20
nvm use 20
```

### Firebase emulators not starting

- Ensure Java is installed (see `INSTALL_JAVA.md`)
- Check if ports 4000, 5001, 8080, 9099 are available

### Build errors

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with emulators
5. Submit a pull request

---

**Happy bunny tracking! 🐇🥕**
