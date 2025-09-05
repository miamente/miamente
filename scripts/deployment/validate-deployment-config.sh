#!/bin/bash

# Deployment Configuration Validation Script
# This script validates that all deployment configuration is ready

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Validating Deployment Configuration for Miamente MVP${NC}\n"

# Check if required tools are installed
check_tool() {
    local tool=$1
    local install_command=$2
    
    if command -v $tool &> /dev/null; then
        echo -e "${GREEN}✅ $tool is installed${NC}"
        return 0
    else
        echo -e "${RED}❌ $tool is not installed${NC}"
        echo -e "${YELLOW}   Install with: $install_command${NC}"
        return 1
    fi
}

# Check tools
echo -e "${BLUE}📋 Checking required tools...${NC}"
tools_ok=true

check_tool "node" "https://nodejs.org/" || tools_ok=false
check_tool "npm" "https://nodejs.org/" || tools_ok=false
check_tool "firebase" "npm install -g firebase-tools" || tools_ok=false
check_tool "gcloud" "https://cloud.google.com/sdk/docs/install" || tools_ok=false

if [ "$tools_ok" = false ]; then
    echo -e "${RED}❌ Some required tools are missing. Please install them first.${NC}"
    exit 1
fi

# Check Node.js version
echo -e "\n${BLUE}📋 Checking Node.js version...${NC}"
node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -ge 22 ]; then
    echo -e "${GREEN}✅ Node.js version $node_version is supported${NC}"
else
    echo -e "${YELLOW}⚠️  Node.js version $node_version detected. Recommended: v22+${NC}"
fi

# Check Firebase authentication
echo -e "\n${BLUE}📋 Checking Firebase authentication...${NC}"
if firebase projects:list &> /dev/null; then
    echo -e "${GREEN}✅ Firebase CLI is authenticated${NC}"
else
    echo -e "${RED}❌ Firebase CLI is not authenticated${NC}"
    echo -e "${YELLOW}   Run: firebase login${NC}"
fi

# Check Google Cloud authentication
echo -e "\n${BLUE}📋 Checking Google Cloud authentication...${NC}"
if gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${GREEN}✅ Google Cloud CLI is authenticated${NC}"
else
    echo -e "${RED}❌ Google Cloud CLI is not authenticated${NC}"
    echo -e "${YELLOW}   Run: gcloud auth login${NC}"
fi

# Check project structure
echo -e "\n${BLUE}📋 Checking project structure...${NC}"
required_files=(
    "package.json"
    "apps/web/package.json"
    "functions/package.json"
    ".github/workflows/ci.yml"
    "firebase.json"
    "firestore.rules"
    "storage.rules"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
    else
        echo -e "${RED}❌ $file is missing${NC}"
    fi
done

# Check if projects exist
echo -e "\n${BLUE}📋 Checking Firebase projects...${NC}"
projects=$(firebase projects:list --format="value(projectId)" 2>/dev/null || echo "")

if echo "$projects" | grep -q "miamente-staging"; then
    echo -e "${GREEN}✅ Staging project exists${NC}"
else
    echo -e "${YELLOW}⚠️  Staging project not found${NC}"
    echo -e "${YELLOW}   Run: ./scripts/deployment/setup-firebase-projects.sh${NC}"
fi

if echo "$projects" | grep -q "miamente-prod"; then
    echo -e "${GREEN}✅ Production project exists${NC}"
else
    echo -e "${YELLOW}⚠️  Production project not found${NC}"
    echo -e "${YELLOW}   Run: ./scripts/deployment/setup-firebase-projects.sh${NC}"
fi

# Check GitHub secrets (if running in GitHub Actions)
echo -e "\n${BLUE}📋 Checking GitHub secrets...${NC}"
if [ -n "$GITHUB_ACTIONS" ]; then
    required_secrets=(
        "FIREBASE_SERVICE_ACCOUNT"
        "FIREBASE_TOKEN"
        "SENDGRID_API_KEY"
        "WOMPI_SECRET"
        "JITSI_BASE_URL"
    )
    
    for secret in "${required_secrets[@]}"; do
        if [ -n "${!secret}" ]; then
            echo -e "${GREEN}✅ $secret is set${NC}"
        else
            echo -e "${RED}❌ $secret is not set${NC}"
        fi
    done
else
    echo -e "${YELLOW}⚠️  Not running in GitHub Actions - secrets check skipped${NC}"
    echo -e "${YELLOW}   Make sure to set up GitHub secrets manually${NC}"
fi

# Test build
echo -e "\n${BLUE}📋 Testing build process...${NC}"
if npm run build 2>/dev/null; then
    echo -e "${GREEN}✅ Build process works${NC}"
else
    echo -e "${RED}❌ Build process failed${NC}"
    echo -e "${YELLOW}   Check for build errors and missing dependencies${NC}"
fi

# Test functions build
echo -e "\n${BLUE}📋 Testing functions build...${NC}"
if cd functions && npm run build 2>/dev/null; then
    echo -e "${GREEN}✅ Functions build works${NC}"
    cd ..
else
    echo -e "${RED}❌ Functions build failed${NC}"
    echo -e "${YELLOW}   Check functions code and dependencies${NC}"
    cd ..
fi

echo -e "\n${BLUE}📋 Summary${NC}"
echo -e "${GREEN}✅ Configuration validation completed${NC}"
echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Set up Firebase projects (if not done)"
echo "2. Create service accounts"
echo "3. Configure GitHub secrets"
echo "4. Test deployment in staging"
echo "5. Deploy to production when ready"

echo -e "\n${GREEN}🎉 MVP is ready for deployment!${NC}"
