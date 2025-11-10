#!/bin/bash

set -e

# Check if environment parameter is provided
if [ $# -eq 0 ]; then
    echo "❌ Error: Environment parameter is required"
    echo "Usage: $0 <environment> [--confirm]"
    echo "Example: $0 dev"
    echo "Available environments: dev, prod"
    echo ""
    echo "⚠️  WARNING: This will delete all deployed resources!"
    echo "Add --confirm flag to proceed without confirmation prompt"
    exit 1
fi

ENVIRONMENT=$1
CONFIRM_FLAG=${2:-""}
PROJECT_ID="uvbunny-app-477814-afe6d"

# Validate environment
if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "prod" ]; then
    echo "❌ Error: Environment must be 'dev' or 'prod'"
    echo "Usage: $0 [dev|prod] [--confirm]"
    exit 1
fi

echo "🗑️  Preparing to destroy UVbunny-app ${ENVIRONMENT} infrastructure..."
echo ""

# Confirmation prompt (unless --confirm flag is provided)
if [ "$CONFIRM_FLAG" != "--confirm" ]; then
    echo "⚠️  WARNING: This will delete:"
    echo "   - All Cloud Functions"
    echo "   - Firebase Hosting site"
    echo "   - Firestore Security Rules (rules will be removed, but database will remain)"
    echo ""
    echo "📋 Project: ${PROJECT_ID}"
    echo "🌍 Environment: ${ENVIRONMENT}"
    echo ""
    read -p "Are you sure you want to continue? (type 'yes' to confirm): " confirmation
    if [ "$confirmation" != "yes" ]; then
        echo "❌ Destruction cancelled"
        exit 0
    fi
fi

# Navigate to project root
cd "$(dirname "$0")"

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
firebase use "${PROJECT_ID}" --quiet || {
    echo "❌ Error: Failed to set Firebase project"
    exit 1
}

# 1. Delete Cloud Functions
echo ""
echo "🔥 Deleting Cloud Functions..."

# List functions first
FUNCTIONS=$(firebase functions:list --project "${PROJECT_ID}" 2>/dev/null | grep -E "^\│" | grep -v "Function" | grep -v "─" | awk '{print $2}' | grep -v "^$" || true)

if [ -z "$FUNCTIONS" ]; then
    echo "  No functions found to delete"
else
    echo "  Found functions:"
    echo "$FUNCTIONS" | while read -r func; do
        if [ -n "$func" ]; then
            echo "    - $func"
        fi
    done
    
    echo ""
    echo "  Deleting all functions..."
    echo "$FUNCTIONS" | while read -r func; do
        if [ -n "$func" ]; then
            echo "    Deleting $func..."
            firebase functions:delete "$func" --project "${PROJECT_ID}" --region us-central1 --force 2>/dev/null || {
                echo "    ⚠️  Failed to delete $func (may not exist)"
            }
        fi
    done
fi

# 2. Delete Hosting Site (optional - comment out if you want to keep hosting)
echo ""
read -p "Do you want to delete the Firebase Hosting site? (type 'yes' to confirm): " delete_hosting
if [ "$delete_hosting" = "yes" ]; then
    echo "🔥 Deleting Firebase Hosting site..."
    firebase hosting:sites:delete "${PROJECT_ID}" --project "${PROJECT_ID}" --force 2>/dev/null || {
        echo "  ⚠️  Failed to delete hosting site (may require manual deletion in console)"
    }
else
    echo "  Skipping hosting site deletion"
fi

# 3. Note about Firestore Rules
echo ""
echo "📝 Note: Firestore Security Rules deployment will be removed,"
echo "   but the rules file (backend/firestore.rules) will remain in your codebase."
echo "   The Firestore database itself will NOT be deleted."
echo ""
echo "   To delete the Firestore database, you must do it manually in the Firebase Console:"
echo "   https://console.firebase.google.com/project/${PROJECT_ID}/firestore"

# 4. Note about Firestore Data
echo ""
echo "📝 Note: Firestore data will NOT be automatically deleted."
echo "   To delete all data, you must:"
echo "   1. Go to Firebase Console"
echo "   2. Navigate to Firestore Database"
echo "   3. Manually delete collections or use the console's delete database option"

# 5. Final summary
echo ""
echo "✅ Destruction process complete!"
echo ""
echo "📋 Summary:"
echo "   ✅ Cloud Functions: Deleted"
if [ "$delete_hosting" = "yes" ]; then
    echo "   ✅ Hosting Site: Deleted"
else
    echo "   ⏭️  Hosting Site: Preserved"
fi
echo "   ⏭️  Firestore Database: Preserved (must be deleted manually)"
echo "   ⏭️  Firestore Rules File: Preserved in codebase"
echo ""
echo "💡 Remaining resources can be managed via:"
echo "   https://console.firebase.google.com/project/${PROJECT_ID}/overview"

