#!/bin/bash

# Miamente Rollback Script
# Usage: ./scripts/rollback.sh [staging|production] [version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=""
VERSION=""
PROJECT_ID=""
DRY_RUN=false

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS] ENVIRONMENT [VERSION]"
    echo ""
    echo "ENVIRONMENT:"
    echo "  staging     Rollback staging environment"
    echo "  production  Rollback production environment"
    echo ""
    echo "VERSION:"
    echo "  Optional. If not specified, will rollback to previous version"
    echo ""
    echo "OPTIONS:"
    echo "  -d, --dry-run    Show what would be done without executing"
    echo "  -h, --help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 staging                    # Rollback staging to previous version"
    echo "  $0 production v1.0.0         # Rollback production to v1.0.0"
    echo "  $0 --dry-run staging         # Show what would be rolled back"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        staging|production)
            ENVIRONMENT="$1"
            shift
            ;;
        v*)
            VERSION="$1"
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ -z "$ENVIRONMENT" ]]; then
    print_error "Environment is required"
    show_usage
    exit 1
fi

# Set project ID based on environment
if [[ "$ENVIRONMENT" == "staging" ]]; then
    PROJECT_ID="miamente-staging"
elif [[ "$ENVIRONMENT" == "production" ]]; then
    PROJECT_ID="miamente-prod"
else
    print_error "Invalid environment: $ENVIRONMENT"
    exit 1
fi

print_status "Starting rollback for $ENVIRONMENT environment (Project: $PROJECT_ID)"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    print_error "Not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

# Function to rollback hosting
rollback_hosting() {
    print_status "Rolling back Firebase Hosting..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        print_warning "DRY RUN: Would rollback hosting for project $PROJECT_ID"
        return 0
    fi
    
    # List recent releases
    print_status "Recent hosting releases:"
    firebase hosting:releases --project "$PROJECT_ID" --limit 5
    
    if [[ -n "$VERSION" ]]; then
        print_status "Rolling back to version: $VERSION"
        firebase hosting:rollback "$VERSION" --project "$PROJECT_ID"
    else
        print_status "Rolling back to previous version..."
        firebase hosting:rollback --project "$PROJECT_ID"
    fi
    
    print_success "Hosting rollback completed"
}

# Function to rollback functions
rollback_functions() {
    print_status "Rolling back Firebase Functions..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        print_warning "DRY RUN: Would rollback functions for project $PROJECT_ID"
        return 0
    fi
    
    # List current functions
    print_status "Current functions:"
    firebase functions:list --project "$PROJECT_ID"
    
    # Deploy previous version from git
    if [[ -n "$VERSION" ]]; then
        print_status "Checking out version: $VERSION"
        git checkout "$VERSION"
    else
        print_status "Checking out previous commit..."
        git checkout HEAD~1
    fi
    
    # Build and deploy functions
    print_status "Building functions..."
    cd functions
    npm ci
    npm run build
    
    print_status "Deploying functions..."
    firebase deploy --only functions --project "$PROJECT_ID"
    
    # Return to original commit
    git checkout -
    cd ..
    
    print_success "Functions rollback completed"
}

# Function to rollback security rules
rollback_rules() {
    print_status "Rolling back Firestore and Storage rules..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        print_warning "DRY RUN: Would rollback security rules for project $PROJECT_ID"
        return 0
    fi
    
    # Checkout previous version of rules
    if [[ -n "$VERSION" ]]; then
        print_status "Checking out rules from version: $VERSION"
        git checkout "$VERSION" -- firestore.rules storage.rules
    else
        print_status "Checking out previous rules..."
        git checkout HEAD~1 -- firestore.rules storage.rules
    fi
    
    # Deploy rules
    print_status "Deploying Firestore rules..."
    firebase deploy --only firestore:rules --project "$PROJECT_ID"
    
    print_status "Deploying Storage rules..."
    firebase deploy --only storage --project "$PROJECT_ID"
    
    # Restore current rules
    git checkout HEAD -- firestore.rules storage.rules
    
    print_success "Security rules rollback completed"
}

# Function to verify rollback
verify_rollback() {
    print_status "Verifying rollback..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        print_warning "DRY RUN: Would verify rollback for project $PROJECT_ID"
        return 0
    fi
    
    # Get the hosting URL
    if [[ "$ENVIRONMENT" == "staging" ]]; then
        URL="https://miamente-staging.web.app"
    else
        URL="https://miamente-prod.web.app"
    fi
    
    print_status "Checking if $URL is accessible..."
    
    # Check if the site is accessible
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL" || echo "000")
    
    if [[ "$HTTP_STATUS" == "200" ]]; then
        print_success "Rollback verification successful - Site is accessible"
    else
        print_error "Rollback verification failed - Site returned HTTP $HTTP_STATUS"
        return 1
    fi
}

# Function to show rollback summary
show_summary() {
    echo ""
    print_status "Rollback Summary:"
    echo "  Environment: $ENVIRONMENT"
    echo "  Project ID: $PROJECT_ID"
    echo "  Version: ${VERSION:-"Previous version"}"
    echo "  Dry Run: $DRY_RUN"
    echo ""
    
    if [[ "$DRY_RUN" == "true" ]]; then
        print_warning "This was a dry run. No actual changes were made."
        echo "To execute the rollback, run the command without --dry-run"
    else
        print_success "Rollback completed successfully!"
        echo ""
        echo "Next steps:"
        echo "  1. Verify the application is working correctly"
        echo "  2. Check error logs in Firebase Console"
        echo "  3. Notify the team about the rollback"
        echo "  4. Investigate the issue that caused the rollback"
    fi
}

# Main execution
main() {
    print_status "Starting rollback process..."
    
    # Confirm rollback (unless dry run)
    if [[ "$DRY_RUN" == "false" ]]; then
        echo ""
        print_warning "This will rollback the $ENVIRONMENT environment"
        if [[ -n "$VERSION" ]]; then
            echo "Target version: $VERSION"
        else
            echo "Target: Previous version"
        fi
        echo ""
        read -p "Are you sure you want to continue? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Rollback cancelled"
            exit 0
        fi
    fi
    
    # Execute rollback steps
    rollback_hosting
    rollback_functions
    rollback_rules
    verify_rollback
    
    show_summary
}

# Run main function
main
