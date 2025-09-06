#!/bin/bash

# Auto Rollback System for Miamente MVP
# Monitors deployments and automatically rolls back on failures

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PRODUCTION_PROJECT="miamente-prod"
STAGING_PROJECT="miamente-staging"
PRODUCTION_URL="https://miamente-prod.web.app"
STAGING_URL="https://miamente-staging.web.app"
ROLLBACK_LOG="logs/rollback.log"
HEALTH_CHECK_INTERVAL=30
MAX_FAILURES=3
ROLLBACK_TIMEOUT=300

# Create logs directory
mkdir -p logs

# Function to log with timestamp
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a $ROLLBACK_LOG
}

# Function to check deployment health
check_health() {
    local url=$1
    local project=$2
    
    log "INFO" "Checking health for $project at $url"
    
    # Check HTTP status
    local http_status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url")
    
    if [ "$http_status" = "200" ]; then
        # Additional checks for critical endpoints
        local critical_endpoints=("/" "/login" "/register" "/professionals")
        local failed_endpoints=0
        
        for endpoint in "${critical_endpoints[@]}"; do
            local endpoint_status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url$endpoint")
            if [ "$endpoint_status" != "200" ]; then
                log "WARN" "Critical endpoint $endpoint returned status $endpoint_status"
                ((failed_endpoints++))
            fi
        done
        
        if [ $failed_endpoints -eq 0 ]; then
            log "SUCCESS" "$project is healthy"
            return 0
        else
            log "WARN" "$project has $failed_endpoints failed critical endpoints"
            return 1
        fi
    else
        log "ERROR" "$project returned HTTP status $http_status"
        return 1
    fi
}

# Function to get last successful deployment
get_last_successful_deployment() {
    local project=$1
    
    log "INFO" "Getting last successful deployment for $project"
    
    # Get last 10 deployments
    local deployments=$(firebase hosting:releases --project $project --limit 10 --format json 2>/dev/null || echo "[]")
    
    # Find first successful deployment
    local successful_deployment=$(echo "$deployments" | jq -r '.[] | select(.status == "DEPLOYED") | .id' | head -1)
    
    if [ -n "$successful_deployment" ] && [ "$successful_deployment" != "null" ]; then
        log "SUCCESS" "Found successful deployment: $successful_deployment"
        echo "$successful_deployment"
    else
        log "ERROR" "No successful deployments found for $project"
        return 1
    fi
}

# Function to rollback hosting
rollback_hosting() {
    local project=$1
    local deployment_id=$2
    
    log "INFO" "Rolling back hosting for $project to deployment $deployment_id"
    
    if firebase hosting:rollback $deployment_id --project $project --token $FIREBASE_TOKEN; then
        log "SUCCESS" "Hosting rollback successful for $project"
        return 0
    else
        log "ERROR" "Hosting rollback failed for $project"
        return 1
    fi
}

# Function to rollback functions
rollback_functions() {
    local project=$1
    
    log "INFO" "Rolling back functions for $project"
    
    # Get the previous version of functions
    local function_versions=$(firebase functions:list --project $project --format json 2>/dev/null || echo "[]")
    local previous_version=$(echo "$function_versions" | jq -r '.[1].version // empty')
    
    if [ -n "$previous_version" ]; then
        log "INFO" "Rolling back functions to version $previous_version"
        
        # Deploy the previous version
        if firebase deploy --only functions --project $project --token $FIREBASE_TOKEN; then
            log "SUCCESS" "Functions rollback successful for $project"
            return 0
        else
            log "ERROR" "Functions rollback failed for $project"
            return 1
        fi
    else
        log "WARN" "No previous function version found for $project"
        return 0
    fi
}

# Function to create rollback point
create_rollback_point() {
    local project=$1
    local commit_sha=$2
    
    log "INFO" "Creating rollback point for $project at commit $commit_sha"
    
    # Create a rollback tag
    local rollback_tag="rollback-$(date '+%Y%m%d-%H%M%S')"
    
    if git tag $rollback_tag $commit_sha 2>/dev/null; then
        log "SUCCESS" "Rollback point created: $rollback_tag"
        echo "$rollback_tag"
    else
        log "WARN" "Failed to create rollback point, but continuing"
        echo "rollback-$(date '+%Y%m%d-%H%M%S')"
    fi
}

# Function to notify team
notify_team() {
    local message=$1
    local severity=$2
    
    log "NOTIFY" "Sending notification: $message"
    
    # Create GitHub issue for rollback
    if [ -n "$GITHUB_TOKEN" ]; then
        local issue_title="🚨 Auto Rollback - $severity"
        local issue_body="
## Auto Rollback Executed

**Message**: $message
**Timestamp**: $(date '+%Y-%m-%d %H:%M:%S')
**Severity**: $severity
**Commit**: $GITHUB_SHA
**Actor**: $GITHUB_ACTOR

## Next Steps

1. Verify the rollback was successful
2. Investigate the root cause
3. Create a fix and test in staging
4. Plan re-deployment

## Monitoring

- [ ] Health check passed
- [ ] Critical endpoints responding
- [ ] Functions operational
- [ ] Database accessible
        "
        
        # Create issue using GitHub API
        curl -X POST \
          -H "Authorization: token $GITHUB_TOKEN" \
          -H "Accept: application/vnd.github.v3+json" \
          "https://api.github.com/repos/$GITHUB_REPOSITORY/issues" \
          -d "{\"title\":\"$issue_title\",\"body\":\"$issue_body\",\"labels\":[\"rollback\",\"$severity\"]}" \
          2>/dev/null || log "WARN" "Failed to create GitHub issue"
    fi
    
    # Log notification
    echo "🚨 ROLLBACK NOTIFICATION: $message"
}

# Function to execute rollback
execute_rollback() {
    local environment=$1
    local reason=$2
    
    log "CRITICAL" "Executing auto rollback for $environment - Reason: $reason"
    
    # Set project and URL based on environment
    local project
    local url
    if [ "$environment" = "production" ]; then
        project=$PRODUCTION_PROJECT
        url=$PRODUCTION_URL
    elif [ "$environment" = "staging" ]; then
        project=$STAGING_PROJECT
        url=$STAGING_URL
    else
        log "ERROR" "Invalid environment: $environment"
        return 1
    fi
    
    # Get last successful deployment
    local target_deployment=$(get_last_successful_deployment $project)
    if [ $? -ne 0 ]; then
        log "ERROR" "Could not find target deployment for rollback"
        notify_team "CRITICAL: Auto rollback failed - no target deployment found for $environment" "critical"
        return 1
    fi
    
    # Create rollback point
    local rollback_point=$(create_rollback_point $project $target_deployment)
    
    # Execute rollback
    log "INFO" "Starting rollback process for $environment"
    
    # Rollback hosting
    if rollback_hosting $project $target_deployment; then
        log "SUCCESS" "Hosting rollback completed for $environment"
    else
        log "ERROR" "Hosting rollback failed for $environment"
        notify_team "CRITICAL: Hosting rollback failed for $environment" "critical"
        return 1
    fi
    
    # Rollback functions
    if rollback_functions $project; then
        log "SUCCESS" "Functions rollback completed for $environment"
    else
        log "WARN" "Functions rollback failed for $environment, but hosting rollback succeeded"
    fi
    
    # Wait for rollback to propagate
    log "INFO" "Waiting for rollback to propagate..."
    sleep 30
    
    # Verify rollback
    local verification_attempts=0
    local max_verification_attempts=10
    
    while [ $verification_attempts -lt $max_verification_attempts ]; do
        if check_health $url $project; then
            log "SUCCESS" "Rollback verification successful for $environment"
            notify_team "SUCCESS: Auto rollback completed for $environment to $target_deployment" "success"
            return 0
        else
            ((verification_attempts++))
            log "WARN" "Rollback verification failed (attempt $verification_attempts/$max_verification_attempts)"
            sleep 10
        fi
    done
    
    log "ERROR" "Rollback verification failed after $max_verification_attempts attempts"
    notify_team "CRITICAL: Rollback verification failed for $environment" "critical"
    return 1
}

# Function to monitor deployment
monitor_deployment() {
    local environment=$1
    local project
    local url
    
    if [ "$environment" = "production" ]; then
        project=$PRODUCTION_PROJECT
        url=$PRODUCTION_URL
    elif [ "$environment" = "staging" ]; then
        project=$STAGING_PROJECT
        url=$STAGING_URL
    else
        log "ERROR" "Invalid environment: $environment"
        return 1
    fi
    
    log "INFO" "Starting monitoring for $environment"
    
    local failure_count=0
    local last_success_time=$(date +%s)
    
    while true; do
        if check_health $url $project; then
            failure_count=0
            last_success_time=$(date +%s)
            log "SUCCESS" "$environment is healthy"
        else
            ((failure_count++))
            log "WARN" "$environment health check failed (attempt $failure_count/$MAX_FAILURES)"
            
            if [ $failure_count -ge $MAX_FAILURES ]; then
                local time_since_success=$(( $(date +%s) - last_success_time ))
                if [ $time_since_success -gt $ROLLBACK_TIMEOUT ]; then
                    log "CRITICAL" "Maximum failures reached for $environment, executing auto rollback"
                    execute_rollback $environment "Health check failures exceeded threshold"
                    break
                else
                    log "INFO" "Failures detected but within timeout window, continuing monitoring"
                    failure_count=0
                fi
            fi
        fi
        
        sleep $HEALTH_CHECK_INTERVAL
    done
}

# Main function
main() {
    local command=$1
    local environment=$2
    local reason=$3
    
    case "$command" in
        "monitor")
            if [ -z "$environment" ]; then
                log "ERROR" "Environment required for monitor command"
                exit 1
            fi
            monitor_deployment $environment
            ;;
        "rollback")
            if [ -z "$environment" ]; then
                log "ERROR" "Environment required for rollback command"
                exit 1
            fi
            execute_rollback $environment "${reason:-Manual rollback}"
            ;;
        "health")
            check_health $PRODUCTION_URL "production"
            check_health $STAGING_URL "staging"
            ;;
        *)
            echo "Usage: $0 {monitor|rollback|health} [environment] [reason]"
            echo "Examples:"
            echo "  $0 monitor production"
            echo "  $0 rollback staging 'Critical bug detected'"
            echo "  $0 health"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
