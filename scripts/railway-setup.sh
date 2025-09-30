#!/bin/bash

# Railway Development Environment Setup Script
# This script helps set up Railway environments for development

set -e

echo "🚀 Setting up Railway Development Environments..."

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

# Check if Railway CLI is installed
check_railway_cli() {
    if ! command -v railway &> /dev/null; then
        print_error "Railway CLI is not installed!"
        print_status "Installing Railway CLI..."
        npm install -g @railway/cli
    else
        print_success "Railway CLI is already installed"
    fi
}

# Login to Railway
login_railway() {
    print_status "Logging in to Railway..."
    railway login
    print_success "Logged in to Railway successfully"
}

# Create environments
create_environments() {
    print_status "Creating Railway environments..."
    
    # Create development environment
    print_status "Creating development environment..."
    railway environment create development || print_warning "Development environment might already exist"
    
    # Create staging environment
    print_status "Creating staging environment..."
    railway environment create staging || print_warning "Staging environment might already exist"
    
    # Create production environment
    print_status "Creating production environment..."
    railway environment create production || print_warning "Production environment might already exist"
    
    print_success "Environments created successfully"
}

# Set up development environment variables
setup_development_env() {
    print_status "Setting up development environment variables..."
    
    railway environment set development
    
    # Database
    railway variables set DATABASE_URL='${{Postgres.DATABASE_URL}}'
    
    # Security
    railway variables set SECRET_KEY='dev-secret-key-change-in-production'
    railway variables set JWT_ALGORITHM='HS256'
    railway variables set ACCESS_TOKEN_EXPIRE_MINUTES='10080'
    railway variables set REFRESH_TOKEN_EXPIRE_MINUTES='43200'
    
    # CORS (Development - Allow all)
    railway variables set BACKEND_CORS_ORIGINS='*'
    railway variables set ALLOWED_HOSTS='*'
    
    # Application
    railway variables set ENVIRONMENT='development'
    railway variables set DEBUG='true'
    railway variables set LOG_LEVEL='DEBUG'
    
    # Frontend
    railway variables set NEXT_PUBLIC_API_URL='https://miamente-backend-dev.railway.app'
    railway variables set NEXT_PUBLIC_ENVIRONMENT='development'
    
    # Server
    railway variables set SERVER_NAME='miamente-dev.railway.app'
    railway variables set SERVER_HOST='https://miamente-dev.railway.app'
    
    print_success "Development environment variables set"
}

# Set up staging environment variables
setup_staging_env() {
    print_status "Setting up staging environment variables..."
    
    railway environment set staging
    
    # Database
    railway variables set DATABASE_URL='${{Postgres.DATABASE_URL}}'
    
    # Security
    railway variables set SECRET_KEY='staging-secret-key-change-in-production'
    railway variables set JWT_ALGORITHM='HS256'
    railway variables set ACCESS_TOKEN_EXPIRE_MINUTES='10080'
    railway variables set REFRESH_TOKEN_EXPIRE_MINUTES='43200'
    
    # CORS (Staging - Specific URLs)
    railway variables set BACKEND_CORS_ORIGINS='https://miamente-staging.railway.app,https://miamente-frontend-staging.railway.app'
    railway variables set ALLOWED_HOSTS='miamente-staging.railway.app,miamente-backend-staging.railway.app'
    
    # Application
    railway variables set ENVIRONMENT='staging'
    railway variables set DEBUG='false'
    railway variables set LOG_LEVEL='INFO'
    
    # Frontend
    railway variables set NEXT_PUBLIC_API_URL='https://miamente-backend-staging.railway.app'
    railway variables set NEXT_PUBLIC_ENVIRONMENT='staging'
    
    # Server
    railway variables set SERVER_NAME='miamente-staging.railway.app'
    railway variables set SERVER_HOST='https://miamente-staging.railway.app'
    
    print_success "Staging environment variables set"
}

# Set up production environment variables
setup_production_env() {
    print_status "Setting up production environment variables..."
    
    railway environment set production
    
    # Database
    railway variables set DATABASE_URL='${{Postgres.DATABASE_URL}}'
    
    # Security
    railway variables set SECRET_KEY='production-secret-key-super-secure'
    railway variables set JWT_ALGORITHM='HS256'
    railway variables set ACCESS_TOKEN_EXPIRE_MINUTES='10080'
    railway variables set REFRESH_TOKEN_EXPIRE_MINUTES='43200'
    
    # CORS (Production - Specific URLs)
    railway variables set BACKEND_CORS_ORIGINS='https://miamente.com,https://www.miamente.com'
    railway variables set ALLOWED_HOSTS='miamente.com,www.miamente.com,miamente-backend.railway.app'
    
    # Application
    railway variables set ENVIRONMENT='production'
    railway variables set DEBUG='false'
    railway variables set LOG_LEVEL='WARNING'
    
    # Frontend
    railway variables set NEXT_PUBLIC_API_URL='https://miamente-backend.railway.app'
    railway variables set NEXT_PUBLIC_ENVIRONMENT='production'
    
    # Server
    railway variables set SERVER_NAME='miamente.com'
    railway variables set SERVER_HOST='https://miamente.com'
    
    print_success "Production environment variables set"
}

# Deploy to development
deploy_development() {
    print_status "Deploying to development environment..."
    
    railway environment set development
    railway up --detach
    
    print_success "Development deployment initiated"
    print_status "You can monitor the deployment with: railway logs --follow"
}

# Show environment URLs
show_urls() {
    print_success "Environment URLs:"
    echo ""
    echo "🌐 Development:"
    echo "   Frontend: https://miamente-frontend-dev.railway.app"
    echo "   Backend:  https://miamente-backend-dev.railway.app"
    echo "   API Docs: https://miamente-backend-dev.railway.app/docs"
    echo ""
    echo "🧪 Staging:"
    echo "   Frontend: https://miamente-frontend-staging.railway.app"
    echo "   Backend:  https://miamente-backend-staging.railway.app"
    echo "   API Docs: https://miamente-backend-staging.railway.app/docs"
    echo ""
    echo "🚀 Production:"
    echo "   Frontend: https://miamente.com"
    echo "   Backend:  https://miamente-backend.railway.app"
    echo "   API Docs: https://miamente-backend.railway.app/docs"
}

# Main execution
main() {
    echo "🎯 Railway Development Environment Setup"
    echo "========================================"
    echo ""
    
    # Check prerequisites
    check_railway_cli
    
    # Login to Railway
    login_railway
    
    # Create environments
    create_environments
    
    # Set up environment variables
    setup_development_env
    setup_staging_env
    setup_production_env
    
    # Deploy to development
    deploy_development
    
    # Show URLs
    show_urls
    
    echo ""
    print_success "Railway development environments setup complete! 🎉"
    echo ""
    print_status "Next steps:"
    echo "1. Monitor development deployment: railway logs --follow"
    echo "2. Test your application at the URLs above"
    echo "3. Push to staging branch to deploy to staging"
    echo "4. Push to main branch to deploy to production"
}

# Run main function
main "$@"
