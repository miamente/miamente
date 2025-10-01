#!/bin/bash

# Railway Monitor Script
# This script helps monitor Railway deployments and services

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

# Show help
show_help() {
    echo "Railway Monitor Script"
    echo "===================="
    echo ""
    echo "Usage: $0 [COMMAND] [ENVIRONMENT]"
    echo ""
    echo "Commands:"
    echo "  status     - Show status of all services"
    echo "  logs       - Show logs for services"
    echo "  health     - Check health of services"
    echo "  metrics    - Show metrics"
    echo "  restart    - Restart services"
    echo "  help       - Show this help"
    echo ""
    echo "Environments:"
    echo "  development, staging, production"
    echo ""
    echo "Examples:"
    echo "  $0 status development"
    echo "  $0 logs staging"
    echo "  $0 health production"
    echo "  $0 metrics"
}

# Show status
show_status() {
    local environment=${1:-"development"}
    
    print_status "Showing status for $environment environment..."
    railway environment set $environment
    railway status
}

# Show logs
show_logs() {
    local environment=${1:-"development"}
    local service=${2:-""}
    
    print_status "Showing logs for $environment environment..."
    railway environment set $environment
    
    if [ -n "$service" ]; then
        railway logs --service $service --follow
    else
        railway logs --follow
    fi
}

# Check health
check_health() {
    local environment=${1:-"development"}
    
    print_status "Checking health for $environment environment..."
    
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
    print_status "Checking backend health: $backend_url/health"
    if curl -f "$backend_url/health" > /dev/null 2>&1; then
        print_success "✅ Backend is healthy"
    else
        print_error "❌ Backend health check failed"
    fi
    
    # Check frontend health
    print_status "Checking frontend health: $frontend_url/api/health"
    if curl -f "$frontend_url/api/health" > /dev/null 2>&1; then
        print_success "✅ Frontend is healthy"
    else
        print_error "❌ Frontend health check failed"
    fi
    
    # Check API docs
    print_status "Checking API docs: $backend_url/docs"
    if curl -f "$backend_url/docs" > /dev/null 2>&1; then
        print_success "✅ API docs are accessible"
    else
        print_warning "⚠️  API docs check failed"
    fi
}

# Show metrics
show_metrics() {
    local environment=${1:-"development"}
    
    print_status "Showing metrics for $environment environment..."
    railway environment set $environment
    railway metrics
}

# Restart services
restart_services() {
    local environment=${1:-"development"}
    local service=${2:-""}
    
    print_status "Restarting services for $environment environment..."
    railway environment set $environment
    
    if [ -n "$service" ]; then
        railway restart $service
    else
        railway restart
    fi
    
    print_success "Services restarted"
}

# Connect to database
connect_database() {
    local environment=${1:-"development"}
    
    print_status "Connecting to database for $environment environment..."
    railway environment set $environment
    railway connect Postgres
}

# Show environment info
show_environment_info() {
    local environment=${1:-"development"}
    
    print_status "Environment information for $environment:"
    echo ""
    
    case $environment in
        "development")
            echo "🌐 Frontend: https://miamente-frontend-dev.railway.app"
            echo "🔧 Backend:  https://miamente-backend-dev.railway.app"
            echo "📊 API Docs: https://miamente-backend-dev.railway.app/docs"
            echo "🗄️  Database: Railway PostgreSQL"
            ;;
        "staging")
            echo "🌐 Frontend: https://miamente-frontend-staging.railway.app"
            echo "🔧 Backend:  https://miamente-backend-staging.railway.app"
            echo "📊 API Docs: https://miamente-backend-staging.railway.app/docs"
            echo "🗄️  Database: Railway PostgreSQL"
            ;;
        "production")
            echo "🌐 Frontend: https://miamente.com"
            echo "🔧 Backend:  https://miamente-backend.railway.app"
            echo "📊 API Docs: https://miamente-backend.railway.app/docs"
            echo "🗄️  Database: Railway PostgreSQL"
            ;;
    esac
}

# Main execution
main() {
    local command=${1:-"help"}
    local environment=${2:-"development"}
    
    case $command in
        "status")
            show_status $environment
            ;;
        "logs")
            show_logs $environment $3
            ;;
        "health")
            check_health $environment
            ;;
        "metrics")
            show_metrics $environment
            ;;
        "restart")
            restart_services $environment $3
            ;;
        "database")
            connect_database $environment
            ;;
        "info")
            show_environment_info $environment
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Run main function
main "$@"
