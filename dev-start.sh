#!/bin/bash

# Miamente Platform - Development Startup Script
echo "🚀 Starting Miamente Platform Development Environment"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 22+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo "⚠️  Warning: Node.js version is $NODE_VERSION. Recommended: Node.js 22+"
fi

echo "✅ Node.js version: $(node --version)"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Installing..."
    npm install -g firebase-tools
fi

echo "✅ Firebase CLI version: $(firebase --version)"

# Check if development configuration exists
if [ ! -f "firebase.dev.json" ]; then
    echo "⚠️  firebase.dev.json not found. Creating from firebase.json..."
    cp firebase.json firebase.dev.json
    echo "📝 Development configuration created"
fi

if [ ! -f "firestore.dev.rules" ]; then
    echo "⚠️  firestore.dev.rules not found. Creating from firestore.rules..."
    cp firestore.rules firestore.dev.rules
    echo "📝 Development Firestore rules created"
fi

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
echo "   firebase emulators:start --project=demo-miamente --config=firebase.dev.json"
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

# Function to check if emulator is ready
check_emulator() {
    local port=$1
    local name=$2
    local max_attempts=${3:-30}
    
    for i in $(seq 1 $max_attempts); do
        if curl -s http://localhost:$port > /dev/null 2>&1; then
            echo "✅ $name emulator is ready (port $port)"
            return 0
        fi
        echo "   Attempt $i/$max_attempts: Waiting for $name emulator..."
        sleep 2
    done
    
    echo "❌ $name emulator failed to start on port $port"
    return 1
}

# Function to cleanup processes
cleanup_processes() {
    echo "🧹 Cleaning up processes..."
    if [ ! -z "$FIREBASE_PID" ]; then
        kill $FIREBASE_PID 2>/dev/null || true
    fi
    if [ ! -z "$WEB_PID" ]; then
        kill $WEB_PID 2>/dev/null || true
    fi
    pkill -f "firebase emulators" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
}

# Set up trap to cleanup on script exit
trap cleanup_processes EXIT INT TERM

if [ "$1" = "full" ]; then
    echo "🚀 Starting Full Development Environment..."
    echo ""
    
    # Start Firebase emulators in background
    echo "🔥 Starting Firebase Emulators..."
    firebase emulators:start --project=demo-miamente --config=firebase.dev.json &
    FIREBASE_PID=$!
    
    # Wait for emulators to start
    echo "⏳ Waiting for emulators to start..."
    sleep 15
    
    # Check if all emulators are ready
    echo "🔍 Checking if emulators are ready..."
    if check_emulator 4000 "Emulator UI" 15 && \
       check_emulator 9099 "Auth" 10 && \
       check_emulator 8080 "Firestore" 10 && \
       check_emulator 5001 "Functions" 10; then
        echo "🎉 All emulators are ready!"
    else
        echo "⚠️  Some emulators may not be ready, but continuing..."
    fi
    
    # Initialize test users with retry
    echo "👥 Creating test users..."
    USER_CREATION_SUCCESS=false
    for attempt in 1 2 3; do
        echo "   Attempt $attempt/3: Creating test users..."
        if node scripts/init-test-users.js; then
            echo "✅ Test users created successfully"
            USER_CREATION_SUCCESS=true
            break
        else
            echo "   ⚠️  Attempt $attempt failed, waiting 5 seconds..."
            sleep 5
        fi
    done
    
    if [ "$USER_CREATION_SUCCESS" = false ]; then
        echo "❌ Warning: Could not create test users after 3 attempts."
        echo "   You can create them manually by running:"
        echo "   node scripts/init-test-users.js"
        echo ""
        echo "   Or use the Firebase Auth emulator UI at http://localhost:4000/auth"
    fi
    
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
echo "📝 Development Notes:"
echo "- App Check is disabled in development mode"
echo "- Firestore rules are relaxed for development"
echo "- All Firebase services use emulators"
echo ""
echo "👥 Test Users Available:"
echo "- admin@miamente.com / admin123 (Admin)"
echo "- user@miamente.com / user123 (User)"
echo "- pro@miamente.com / pro123 (Professional)"
echo "- test@miamente.com / test123 (User)"
echo ""
echo "💡 Tips:"
echo "- If login fails with 'user-not-found', create users manually:"
echo "  node scripts/init-test-users.js"
echo "- Or use Firebase Auth UI: http://localhost:4000/auth"
echo "- Emulator data is reset when emulators restart"
    echo ""
    echo "Press Ctrl+C to stop all services"
    
    # Wait for user to stop
    wait
else
    echo "💡 To start the full development environment, run: ./dev-start.sh full"
fi
