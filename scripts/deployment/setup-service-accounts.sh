#!/bin/bash

# Service Account Setup Script
# This script helps create and configure service accounts for deployment

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
SERVICE_ACCOUNT_NAME="miamente-deploy"

echo -e "${BLUE}🔐 Setting up Service Accounts for Miamente MVP${NC}\n"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Google Cloud CLI is not installed. Please install it first:${NC}"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${YELLOW}⚠️  Please authenticate with Google Cloud first:${NC}"
    echo "gcloud auth login"
    exit 1
fi

# Function to create service account for a project
create_service_account() {
    local project_id=$1
    local project_name=$2
    
    echo -e "${YELLOW}Creating service account for ${project_name} (${project_id})...${NC}"
    
    # Set project
    gcloud config set project $project_id
    
    # Create service account
    if gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
        --display-name="Miamente Deploy Service Account" \
        --description="Service account for Miamente deployments" \
        --project=$project_id 2>/dev/null; then
        echo -e "${GREEN}✅ Service account created successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Service account may already exist${NC}"
    fi
    
    # Assign roles
    echo "  Assigning roles..."
    local service_account_email="${SERVICE_ACCOUNT_NAME}@${project_id}.iam.gserviceaccount.com"
    
    # Firebase Admin role
    gcloud projects add-iam-policy-binding $project_id \
        --member="serviceAccount:${service_account_email}" \
        --role="roles/firebase.admin" || echo "  Firebase Admin role may already be assigned"
    
    # Cloud Functions Admin
    gcloud projects add-iam-policy-binding $project_id \
        --member="serviceAccount:${service_account_email}" \
        --role="roles/cloudfunctions.admin" || echo "  Cloud Functions Admin role may already be assigned"
    
    # Firebase Hosting Admin
    gcloud projects add-iam-policy-binding $project_id \
        --member="serviceAccount:${service_account_email}" \
        --role="roles/firebasehosting.admin" || echo "  Firebase Hosting Admin role may already be assigned"
    
    # Firestore Service Agent
    gcloud projects add-iam-policy-binding $project_id \
        --member="serviceAccount:${service_account_email}" \
        --role="roles/datastore.serviceAgent" || echo "  Firestore Service Agent role may already be assigned"
    
    # Storage Admin
    gcloud projects add-iam-policy-binding $project_id \
        --member="serviceAccount:${service_account_email}" \
        --role="roles/storage.admin" || echo "  Storage Admin role may already be assigned"
    
    # Create and download key
    echo "  Creating service account key..."
    mkdir -p secrets
    gcloud iam service-accounts keys create secrets/${project_id}-service-account.json \
        --iam-account=${service_account_email} \
        --project=$project_id
    
    echo -e "${GREEN}✅ Service account configured for ${project_name}${NC}"
    echo -e "${BLUE}  Key saved to: secrets/${project_id}-service-account.json${NC}\n"
}

# Create service accounts for both projects
create_service_account $STAGING_PROJECT "Staging"
create_service_account $PROD_PROJECT "Production"

# Generate Firebase CI token
echo -e "${YELLOW}Generating Firebase CI token...${NC}"
if command -v firebase &> /dev/null; then
    echo "Please run the following command to generate a Firebase CI token:"
    echo -e "${BLUE}firebase login:ci${NC}"
    echo "Then add the token to GitHub secrets as FIREBASE_TOKEN"
else
    echo -e "${YELLOW}⚠️  Firebase CLI not found. Please install it and run 'firebase login:ci'${NC}"
fi

echo -e "\n${BLUE}📋 Next steps:${NC}"
echo "1. Add service account JSON files to GitHub secrets:"
echo "   - FIREBASE_SERVICE_ACCOUNT_STAGING (staging key content)"
echo "   - FIREBASE_SERVICE_ACCOUNT (production key content)"
echo "2. Add FIREBASE_TOKEN to GitHub secrets"
echo "3. Add other required secrets (SENDGRID_API_KEY, WOMPI_SECRET, etc.)"

echo -e "\n${GREEN}🎉 Service accounts setup completed!${NC}"
echo -e "${YELLOW}⚠️  Remember to add the generated keys to GitHub secrets${NC}"
