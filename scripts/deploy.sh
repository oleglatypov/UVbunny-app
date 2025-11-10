#!/bin/bash

set -e

ENVIRONMENT=${1:-dev}  # dev | prod
PROJECT_ID="uvbunny-app-477814-afe6d"

echo "🚀 Deploying UVbunny-app to ${ENVIRONMENT}..."

# Navigate to project root (parent of scripts directory)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Validate environment
if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "prod" ]; then
    echo "❌ Error: Environment must be 'dev' or 'prod'"
    echo "Usage: $0 [dev|prod]"
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI is not installed"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Error: Not logged in to Firebase"
    echo "Run: firebase login"
    exit 1
fi

# Set Firebase project
echo "📋 Using Firebase project: ${PROJECT_ID}"
firebase use "${PROJECT_ID}" || {
    echo "❌ Error: Failed to set Firebase project"
    exit 1
}

# 1. Build Backend Functions
echo ""
echo "📦 Building Cloud Functions..."
cd backend/functions

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "⚠️  Warning: Node.js version is less than 20. Recommended: Node.js 20+"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "  Installing dependencies..."
    npm install
fi

# Build TypeScript
echo "  Building TypeScript..."
npm run build

cd ../..

# 2. Build Frontend
echo ""
echo "📦 Building Frontend..."

cd frontend

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Error: Node.js 20+ is required for Angular 20. Current version: $(node --version)"
    echo "Please install Node.js 20: nvm install 20 && nvm use 20"
    exit 1
fi

# Check if .env file exists for the environment
ENV_FILE=".env.production"
if [ "$ENVIRONMENT" = "dev" ]; then
    ENV_FILE=".env.dev"
fi

if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  Warning: ${ENV_FILE} not found"
    if [ -f ".env.example" ]; then
        echo "  Creating ${ENV_FILE} from .env.example..."
        cp .env.example "$ENV_FILE"
        echo "  ⚠️  Please update ${ENV_FILE} with your Firebase configuration before deploying."
    else
        echo "❌ Error: ${ENV_FILE} and .env.example not found"
        exit 1
    fi
fi

# Generate environment files from .env
echo "  Generating environment files from ${ENV_FILE}..."
npm run generate-env:${ENVIRONMENT} || {
    echo "❌ Error: Failed to generate environment files"
    exit 1
}

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "  Installing dependencies..."
    npm install
fi

# Always build for production when deploying to Firebase Hosting
# The ENVIRONMENT parameter is for other purposes (e.g., different Firebase projects)
# Frontend builds should always be production-optimized for hosting
echo "  Building for production (optimized for Firebase Hosting)..."
npm run build:prod

cd ..

# 3. Deploy to Firebase
echo ""
echo "🎯 Deploying to Firebase..."

# Deploy based on environment
if [ "$ENVIRONMENT" = "prod" ]; then
    echo "  Deploying Functions, Hosting, and Firestore Rules..."
    firebase deploy --project "${PROJECT_ID}" --force
else
    echo "  Deploying Functions, Hosting, and Firestore Rules (dev)..."
    firebase deploy --project "${PROJECT_ID}" --force
fi

# 4. Get deployment URLs
echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Hosting URL     : https://${PROJECT_ID}.web.app"
echo "🔗 Hosting URL     : https://${PROJECT_ID}.firebaseapp.com"
echo "📡 Functions       : https://console.firebase.google.com/project/${PROJECT_ID}/functions"
echo "🗄️  Firestore       : https://console.firebase.google.com/project/${PROJECT_ID}/firestore"
echo "⚙️  Console         : https://console.firebase.google.com/project/${PROJECT_ID}/overview"

# List deployed functions
echo ""
echo "📋 Deployed Functions:"
firebase functions:list --project "${PROJECT_ID}" 2>/dev/null || echo "  (No functions deployed)"

echo ""
echo "🎉 All done!"

