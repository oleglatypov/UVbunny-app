#!/bin/bash

set -e

# Parse arguments
ENVIRONMENT=""
FRONTEND_ONLY=false
CHANNEL=""
EXPIRE_DATE=""
PROJECT_ID="uvbunny-app-477814-afe6d"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    dev|prod)
      ENVIRONMENT="$1"
      shift
      ;;
    --frontend-only|-f)
      FRONTEND_ONLY=true
      shift
      ;;
    --channel|-c)
      CHANNEL="$2"
      shift 2
      ;;
    --expires|-e)
      EXPIRE_DATE="$2"
      shift 2
      ;;
    --help|-h)
      echo "Usage: $0 [dev|prod] [OPTIONS]"
      echo ""
      echo "Environments:"
      echo "  dev          Deploy to development environment (default)"
      echo "  prod         Deploy to production environment"
      echo ""
      echo "Options:"
      echo "  --frontend-only, -f    Deploy only frontend (skip functions and rules)"
      echo "  --channel, -c CHANNEL  Deploy to a specific hosting channel (preview channel)"
      echo "  --expires, -e DATE      Set expiration date for channel (format: YYYY-MM-DD or +7d for 7 days)"
      echo "  --help, -h             Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0 dev                                    # Deploy everything to dev"
      echo "  $0 prod --frontend-only                   # Deploy only frontend to prod"
      echo "  $0 dev --channel preview-123              # Deploy to preview channel"
      echo "  $0 prod --channel staging --expires +14d   # Deploy to staging channel, expires in 14 days"
      exit 0
      ;;
    *)
      echo "❌ Error: Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Set default environment if not provided
if [ -z "$ENVIRONMENT" ]; then
  ENVIRONMENT="dev"
fi

echo "🚀 Deploying UVbunny-app to ${ENVIRONMENT}..."
if [ "$FRONTEND_ONLY" = true ]; then
  echo "📦 Frontend-only deployment"
fi
if [ -n "$CHANNEL" ]; then
  echo "📺 Deploying to channel: ${CHANNEL}"
  if [ -n "$EXPIRE_DATE" ]; then
    echo "⏰ Channel expiration: ${EXPIRE_DATE}"
  fi
fi

# Navigate to project root (parent of scripts directory)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Validate environment
if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "prod" ]; then
    echo "❌ Error: Environment must be 'dev' or 'prod'"
    echo "Use --help for usage information"
    exit 1
fi

# Validate channel expiration format if provided
if [ -n "$EXPIRE_DATE" ] && [ -z "$CHANNEL" ]; then
    echo "❌ Error: --expires requires --channel to be specified"
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

# 1. Build Backend Functions (skip if frontend-only)
if [ "$FRONTEND_ONLY" = false ]; then
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
else
    echo ""
    echo "⏭️  Skipping Cloud Functions build (frontend-only deployment)"
fi

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

# Build deployment command
DEPLOY_CMD="firebase deploy --project \"${PROJECT_ID}\" --force"

# Add deployment targets based on flags
if [ "$FRONTEND_ONLY" = true ]; then
    DEPLOY_CMD="$DEPLOY_CMD --only hosting"
else
    DEPLOY_CMD="$DEPLOY_CMD --only functions,hosting,firestore:rules"
fi

# Add channel if specified
if [ -n "$CHANNEL" ]; then
    DEPLOY_CMD="$DEPLOY_CMD --channel \"${CHANNEL}\""
    
    # Add expiration if specified
    if [ -n "$EXPIRE_DATE" ]; then
        DEPLOY_CMD="$DEPLOY_CMD --expires \"${EXPIRE_DATE}\""
    fi
fi

# Execute deployment
echo "  Executing: $DEPLOY_CMD"
eval $DEPLOY_CMD

# 4. Get deployment URLs
echo ""
echo "✅ Deployment complete!"
echo ""

# Display hosting URL based on channel
if [ -n "$CHANNEL" ]; then
    echo "📺 Channel URL     : https://${PROJECT_ID}--${CHANNEL}.web.app"
    if [ -n "$EXPIRE_DATE" ]; then
        echo "⏰ Expires          : ${EXPIRE_DATE}"
    fi
    echo ""
fi

echo "🌐 Hosting URL     : https://${PROJECT_ID}.web.app"
echo "🔗 Hosting URL     : https://${PROJECT_ID}.firebaseapp.com"

if [ "$FRONTEND_ONLY" = false ]; then
    echo "📡 Functions       : https://console.firebase.google.com/project/${PROJECT_ID}/functions"
    echo "🗄️  Firestore       : https://console.firebase.google.com/project/${PROJECT_ID}/firestore"
fi

echo "⚙️  Console         : https://console.firebase.google.com/project/${PROJECT_ID}/overview"

# List deployed functions (only if not frontend-only)
if [ "$FRONTEND_ONLY" = false ]; then
    echo ""
    echo "📋 Deployed Functions:"
    firebase functions:list --project "${PROJECT_ID}" 2>/dev/null || echo "  (No functions deployed)"
fi

echo ""
echo "🎉 All done!"

