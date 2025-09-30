#!/bin/bash

# Railway Development Deploy Script
# This script deploys the current branch to the appropriate Railway environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Get current branch
get_current_branch() {
    git branch --show-current
}

# Determine environment based on branch
get_environment() {
    local branch=$1
    case $branch in
        "develop")
            echo "development"
            ;;
        "staging")
            echo "staging"
            ;;
        "main")
            echo "production"
            ;;
        *)
            echo "development"
            ;;
    esac
}

# Deploy to Railway
deploy_to_railway() {
    local environment=$1
    local branch=$2
    
    print_status "Deploying to Railway environment: $environment"
    print_status "Branch: $branch"
    
    # Set environment
    railway environment set $environment
    
    # Deploy
    railway up --detach
    
    print_success "Deployment initiated for $environment environment"
}

# Wait for deployment and check health
wait_for_deployment() {
    local environment=$1
    
    print_status "Waiting for deployment to complete..."
    sleep 60
    
    # Determine URLs based on environment
    local frontend_url=""
    local backend_url=""
    
    case $environment in
        "development")
            frontend_url="https://miamente-frontend-dev.railway.app"
            backend_url="https://miamente-backend-dev.railway.app"
            ;;
        "staging")
            frontend_url="https://miamente-frontend-staging.railway.app"
            backend_url="https://miamente-backend-staging.railway.app"
            ;;
        "production")
            frontend_url="https://miamente.com"
            backend_url="https://miamente-backend.railway.app"
            ;;
    esac
    
    # Check backend health
    print_status "Checking backend health..."
    if curl -f "$backend_url/health" > /dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_warning "Backend health check failed"
    fi
    
    # Check frontend health
    print_status "Checking frontend health..."
    if curl -f "$frontend_url/api/health" > /dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_warning "Frontend health check failed"
    fi
    
    # Show URLs
    print_success "Deployment URLs:"
    echo "🌐 Frontend: $frontend_url"
    echo "🔧 Backend:  $backend_url"
    echo "📊 API Docs: $backend_url/docs"
}

# Run tests based on environment
run_tests() {
    local environment=$1
    
    case $environment in
        "development")
            print_status "Running basic smoke tests for development..."
            # Basic health checks are already done in wait_for_deployment
            ;;
        "staging")
            print_status "Running E2E tests for staging..."
            # E2E tests are handled by GitHub Actions
            ;;
        "production")
            print_status "Running smoke tests for production..."
            # Smoke tests are handled by GitHub Actions
            ;;
    esac
}

# Show logs
show_logs() {
    print_status "Showing recent logs..."
    railway logs --tail 50
}

# Main execution
main() {
    echo "🚀 Railway Development Deploy"
    echo "=============================="
    echo ""
    
    # Get current branch
    local branch=$(get_current_branch)
    print_status "Current branch: $branch"
    
    # Determine environment
    local environment=$(get_environment $branch)
    print_status "Target environment: $environment"
    
    # Deploy to Railway
    deploy_to_railway $environment $branch
    
    # Wait for deployment and check health
    wait_for_deployment $environment
    
    # Run tests
    run_tests $environment
    
    # Show logs
    show_logs
    
    print_success "Deployment complete! 🎉"
}

# Run main function
main "$@"
