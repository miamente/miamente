#!/bin/bash

# Branch Management Script for Miamente MVP
# Handles feature branches, releases, and hotfixes

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to log with timestamp
log() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[$timestamp] [$level] $message"
}

# Function to check if branch exists
branch_exists() {
    local branch=$1
    git show-ref --verify --quiet refs/heads/$branch
}

# Function to check if remote branch exists
remote_branch_exists() {
    local branch=$1
    git ls-remote --heads origin $branch | grep -q $branch
}

# Function to create feature branch
create_feature() {
    local feature_name=$1
    
    if [ -z "$feature_name" ]; then
        log "ERROR" "Feature name is required"
        echo "Usage: $0 feature <feature-name>"
        exit 1
    fi
    
    local branch_name="feature/$feature_name"
    
    log "INFO" "Creating feature branch: $branch_name"
    
    # Check if branch already exists
    if branch_exists $branch_name; then
        log "ERROR" "Feature branch $branch_name already exists"
        exit 1
    fi
    
    # Ensure we're on develop and up to date
    git checkout develop
    git pull origin develop
    
    # Create feature branch
    git checkout -b $branch_name
    
    log "SUCCESS" "Feature branch $branch_name created successfully"
    echo "Next steps:"
    echo "1. Make your changes"
    echo "2. git add . && git commit -m 'feat: your changes'"
    echo "3. git push origin $branch_name"
    echo "4. Create Pull Request to develop"
}

# Function to create release branch
create_release() {
    local version=$1
    
    if [ -z "$version" ]; then
        log "ERROR" "Version is required"
        echo "Usage: $0 release <version>"
        echo "Example: $0 release v1.1.0"
        exit 1
    fi
    
    local branch_name="release/$version"
    
    log "INFO" "Creating release branch: $branch_name"
    
    # Check if branch already exists
    if branch_exists $branch_name; then
        log "ERROR" "Release branch $branch_name already exists"
        exit 1
    fi
    
    # Ensure we're on develop and up to date
    git checkout develop
    git pull origin develop
    
    # Create release branch
    git checkout -b $branch_name
    
    # Update version in package.json
    log "INFO" "Updating version in package.json"
    npm version $version --no-git-tag-version
    
    # Commit version update
    git add package.json
    git commit -m "chore: bump version to $version"
    
    log "SUCCESS" "Release branch $branch_name created successfully"
    echo "Next steps:"
    echo "1. Test the release thoroughly"
    echo "2. Update CHANGELOG.md if needed"
    echo "3. git push origin $branch_name"
    echo "4. Create Pull Request to main"
    echo "5. After merge, create tag: git tag $version && git push origin $version"
}

# Function to create hotfix branch
create_hotfix() {
    local hotfix_name=$1
    
    if [ -z "$hotfix_name" ]; then
        log "ERROR" "Hotfix name is required"
        echo "Usage: $0 hotfix <hotfix-name>"
        echo "Example: $0 hotfix critical-security-fix"
        exit 1
    fi
    
    local branch_name="hotfix/$hotfix_name"
    
    log "INFO" "Creating hotfix branch: $branch_name"
    
    # Check if branch already exists
    if branch_exists $branch_name; then
        log "ERROR" "Hotfix branch $branch_name already exists"
        exit 1
    fi
    
    # Ensure we're on main and up to date
    git checkout main
    git pull origin main
    
    # Create hotfix branch
    git checkout -b $branch_name
    
    log "SUCCESS" "Hotfix branch $branch_name created successfully"
    echo "Next steps:"
    echo "1. Make your hotfix changes"
    echo "2. git add . && git commit -m 'fix: your hotfix'"
    echo "3. git push origin $branch_name"
    echo "4. Create Pull Request to main"
    echo "5. After merge, merge back to develop"
}

# Function to finish feature
finish_feature() {
    local feature_name=$1
    
    if [ -z "$feature_name" ]; then
        log "ERROR" "Feature name is required"
        echo "Usage: $0 finish-feature <feature-name>"
        exit 1
    fi
    
    local branch_name="feature/$feature_name"
    
    log "INFO" "Finishing feature branch: $branch_name"
    
    # Check if branch exists
    if ! branch_exists $branch_name; then
        log "ERROR" "Feature branch $branch_name does not exist"
        exit 1
    fi
    
    # Switch to feature branch
    git checkout $branch_name
    
    # Ensure branch is up to date
    git pull origin $branch_name
    
    # Switch to develop
    git checkout develop
    git pull origin develop
    
    # Merge feature branch
    git merge --no-ff $branch_name -m "feat: merge $feature_name"
    
    # Push develop
    git push origin develop
    
    # Delete feature branch
    git branch -d $branch_name
    git push origin --delete $branch_name
    
    log "SUCCESS" "Feature $feature_name finished and merged to develop"
}

# Function to finish release
finish_release() {
    local version=$1
    
    if [ -z "$version" ]; then
        log "ERROR" "Version is required"
        echo "Usage: $0 finish-release <version>"
        exit 1
    fi
    
    local branch_name="release/$version"
    
    log "INFO" "Finishing release branch: $branch_name"
    
    # Check if branch exists
    if ! branch_exists $branch_name; then
        log "ERROR" "Release branch $branch_name does not exist"
        exit 1
    fi
    
    # Switch to release branch
    git checkout $branch_name
    
    # Ensure branch is up to date
    git pull origin $branch_name
    
    # Switch to main
    git checkout main
    git pull origin main
    
    # Merge release branch
    git merge --no-ff $branch_name -m "release: $version"
    
    # Create tag
    git tag $version
    
    # Push main and tag
    git push origin main
    git push origin $version
    
    # Switch to develop
    git checkout develop
    git pull origin develop
    
    # Merge release branch to develop
    git merge --no-ff $branch_name -m "release: merge $version to develop"
    
    # Push develop
    git push origin develop
    
    # Delete release branch
    git branch -d $branch_name
    git push origin --delete $branch_name
    
    log "SUCCESS" "Release $version finished and deployed"
}

# Function to finish hotfix
finish_hotfix() {
    local hotfix_name=$1
    
    if [ -z "$hotfix_name" ]; then
        log "ERROR" "Hotfix name is required"
        echo "Usage: $0 finish-hotfix <hotfix-name>"
        exit 1
    fi
    
    local branch_name="hotfix/$hotfix_name"
    
    log "INFO" "Finishing hotfix branch: $branch_name"
    
    # Check if branch exists
    if ! branch_exists $branch_name; then
        log "ERROR" "Hotfix branch $branch_name does not exist"
        exit 1
    fi
    
    # Switch to hotfix branch
    git checkout $branch_name
    
    # Ensure branch is up to date
    git pull origin $branch_name
    
    # Switch to main
    git checkout main
    git pull origin main
    
    # Merge hotfix branch
    git merge --no-ff $branch_name -m "hotfix: $hotfix_name"
    
    # Push main
    git push origin main
    
    # Switch to develop
    git checkout develop
    git pull origin develop
    
    # Merge hotfix branch to develop
    git merge --no-ff $branch_name -m "hotfix: merge $hotfix_name to develop"
    
    # Push develop
    git push origin develop
    
    # Delete hotfix branch
    git branch -d $branch_name
    git push origin --delete $branch_name
    
    log "SUCCESS" "Hotfix $hotfix_name finished and deployed"
}

# Function to show branch status
show_status() {
    log "INFO" "Current branch status:"
    echo ""
    echo "Current branch: $(git branch --show-current)"
    echo ""
    echo "Local branches:"
    git branch -v
    echo ""
    echo "Remote branches:"
    git branch -r
    echo ""
    echo "Recent commits:"
    git log --oneline -10
}

# Main function
main() {
    local command=$1
    local name=$2
    
    case "$command" in
        "feature")
            create_feature "$name"
            ;;
        "release")
            create_release "$name"
            ;;
        "hotfix")
            create_hotfix "$name"
            ;;
        "finish-feature")
            finish_feature "$name"
            ;;
        "finish-release")
            finish_release "$name"
            ;;
        "finish-hotfix")
            finish_hotfix "$name"
            ;;
        "status")
            show_status
            ;;
        *)
            echo "Usage: $0 {feature|release|hotfix|finish-feature|finish-release|finish-hotfix|status} [name]"
            echo ""
            echo "Commands:"
            echo "  feature <name>           Create a new feature branch"
            echo "  release <version>        Create a new release branch"
            echo "  hotfix <name>            Create a new hotfix branch"
            echo "  finish-feature <name>    Finish and merge a feature branch"
            echo "  finish-release <version> Finish and deploy a release"
            echo "  finish-hotfix <name>     Finish and deploy a hotfix"
            echo "  status                   Show current branch status"
            echo ""
            echo "Examples:"
            echo "  $0 feature user-authentication"
            echo "  $0 release v1.1.0"
            echo "  $0 hotfix critical-bug"
            echo "  $0 finish-feature user-authentication"
            echo "  $0 finish-release v1.1.0"
            echo "  $0 finish-hotfix critical-bug"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
