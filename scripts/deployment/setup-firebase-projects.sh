#!/bin/bash

# Firebase Projects Setup Script
# This script creates and configures Firebase projects for staging and production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STAGING_PROJECT="miamente-staging"
PROD_PROJECT="miamente-prod"
REGION="us-central1"

echo -e "${BLUE}🚀 Setting up Firebase projects for Miamente MVP${NC}\n"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI is not installed. Please install it first:${NC}"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Please login to Firebase first:${NC}"
    echo "firebase login"
    exit 1
fi

echo -e "${BLUE}📦 Creating Firebase projects...${NC}"

# Create staging project
echo -e "${YELLOW}Creating staging project: ${STAGING_PROJECT}${NC}"
if firebase projects:create $STAGING_PROJECT --display-name "Miamente Staging" 2>/dev/null; then
    echo -e "${GREEN}✅ Staging project created successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Staging project may already exist${NC}"
fi

# Create production project
echo -e "${YELLOW}Creating production project: ${PROD_PROJECT}${NC}"
if firebase projects:create $PROD_PROJECT --display-name "Miamente Production" 2>/dev/null; then
    echo -e "${GREEN}✅ Production project created successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Production project may already exist${NC}"
fi

echo -e "\n${BLUE}🔧 Configuring Firebase services...${NC}"

# Function to configure a project
configure_project() {
    local project_id=$1
    local project_name=$2
    
    echo -e "${YELLOW}Configuring ${project_name} (${project_id})...${NC}"
    
    # Set project
    firebase use $project_id --add
    
    # Enable services
    echo "  Enabling Authentication..."
    firebase auth:enable --project $project_id || echo "  Auth may already be enabled"
    
    echo "  Enabling Firestore..."
    firebase firestore:enable --project $project_id || echo "  Firestore may already be enabled"
    
    echo "  Enabling Storage..."
    firebase storage:enable --project $project_id || echo "  Storage may already be enabled"
    
    echo "  Enabling Functions..."
    firebase functions:enable --project $project_id || echo "  Functions may already be enabled"
    
    echo "  Enabling Hosting..."
    firebase hosting:enable --project $project_id || echo "  Hosting may already be enabled"
    
    # Create Firestore database
    echo "  Creating Firestore database..."
    firebase firestore:databases:create --project $project_id --location $REGION || echo "  Database may already exist"
    
    echo -e "${GREEN}✅ ${project_name} configured successfully${NC}\n"
}

# Configure both projects
configure_project $STAGING_PROJECT "Staging"
configure_project $PROD_PROJECT "Production"

echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Go to Firebase Console and configure Authentication providers"
echo "2. Set up custom domains (optional)"
echo "3. Configure security rules"
echo "4. Create service accounts"
echo "5. Set up GitHub secrets"

echo -e "\n${GREEN}🎉 Firebase projects setup completed!${NC}"
echo -e "${BLUE}Staging: https://console.firebase.google.com/project/${STAGING_PROJECT}${NC}"
echo -e "${BLUE}Production: https://console.firebase.google.com/project/${PROD_PROJECT}${NC}"
