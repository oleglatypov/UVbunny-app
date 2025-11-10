#!/bin/bash

# Local development server script
# This script generates environment files from .env and starts the Angular dev server

set -e

ENVIRONMENT=${1:-local}  # local | dev

echo "🚀 Starting UVbunny-app development server (${ENVIRONMENT})..."

# Navigate to frontend directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "Creating .env from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env file. Please update it with your Firebase configuration."
    else
        echo "❌ Error: .env.example not found. Please create .env file manually."
        exit 1
    fi
fi

# Generate environment files from .env
echo ""
echo "🔄 Generating environment files from .env files..."
npm run generate-env:${ENVIRONMENT} || {
    echo "❌ Error: Failed to generate environment files"
    exit 1
}

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Error: Node.js 20+ is required for Angular 20. Current version: $(node --version)"
    echo "Please install Node.js 20: nvm install 20 && nvm use 20"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the Angular dev server
echo ""
echo "🌐 Starting Angular development server..."
echo "   Environment: ${ENVIRONMENT}"
echo "   URL: http://localhost:4200"
echo ""

if [ "$ENVIRONMENT" = "local" ]; then
    npm run start:local
else
    npm run start:dev
fi

