#!/bin/bash

# Miamente Platform - Development Startup Script
echo "🚀 Starting Miamente Platform Development Environment"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "⚠️  Warning: Node.js version is $NODE_VERSION. Recommended: Node.js 20+"
fi

echo "✅ Node.js version: $(node --version)"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Installing..."
    npm install -g firebase-tools
fi

echo "✅ Firebase CLI version: $(firebase --version)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
fi

if [ ! -d "apps/web/node_modules" ]; then
    echo "📦 Installing web app dependencies..."
    cd apps/web && npm install && cd ../..
fi

if [ ! -d "functions/node_modules" ]; then
    echo "📦 Installing functions dependencies..."
    cd functions && npm install && cd ..
fi

# Check if .env.local exists
if [ ! -f "apps/web/.env.local" ]; then
    echo "⚠️  .env.local not found. Creating from example..."
    cp apps/web/.env.example apps/web/.env.local
    echo "📝 Please edit apps/web/.env.local with your Firebase configuration"
fi

echo ""
echo "🎯 Available Commands:"
echo "====================="
echo "1. Start Web App Only:"
echo "   cd apps/web && npm run dev"
echo ""
echo "2. Start Firebase Emulators:"
echo "   firebase emulators:start --project=demo-test"
echo ""
echo "3. Start Both (Web App + Emulators):"
echo "   ./dev-start.sh full"
echo ""
echo "4. Run Tests:"
echo "   npm run test"
echo ""
echo "5. Run E2E Tests:"
echo "   npm run test:e2e"
echo ""

if [ "$1" = "full" ]; then
    echo "🚀 Starting Full Development Environment..."
    echo ""
    
    # Start Firebase emulators in background
    echo "🔥 Starting Firebase Emulators..."
    firebase emulators:start --project=demo-test &
    FIREBASE_PID=$!
    
    # Wait for emulators to start
    echo "⏳ Waiting for emulators to start..."
    sleep 10
    
    # Start web app
    echo "🌐 Starting Web Application..."
    cd apps/web && npm run dev &
    WEB_PID=$!
    
    echo ""
    echo "✅ Development Environment Started!"
    echo "=================================="
    echo "🌐 Web App: http://localhost:3000"
    echo "🔥 Firebase Emulator UI: http://localhost:4000"
    echo "📊 Firestore: http://localhost:8080"
    echo "🔐 Auth: http://localhost:9099"
    echo "☁️  Storage: http://localhost:9199"
    echo "⚡ Functions: http://localhost:5001"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Wait for user to stop
    wait
else
    echo "💡 To start the full development environment, run: ./dev-start.sh full"
fi
