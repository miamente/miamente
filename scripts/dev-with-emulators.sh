#!/bin/bash

# Script to start development environment with Firebase emulators and web app

set -e

echo "🚀 Starting development environment with Firebase emulators..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "firebase.json" ]; then
    echo "❌ firebase.json not found. Please run this script from the project root."
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo "🧹 Cleaning up..."
    pkill -f "firebase emulators" || true
    pkill -f "npm run dev" || true
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup EXIT INT TERM

echo "🔥 Starting Firebase emulators..."
firebase emulators:start --project=demo-miamente --config=firebase.dev.json &
EMULATOR_PID=$!

# Wait for emulators to start
echo "⏳ Waiting for emulators to start..."
sleep 15

# Check if emulators are running
if ! curl -s http://localhost:4000 > /dev/null; then
    echo "❌ Emulators failed to start"
    exit 1
fi

echo "✅ Emulators are running at http://localhost:4000"

# Start the web application
echo "🌐 Starting web application..."
cd apps/web
npm run dev &
WEB_PID=$!

# Wait for web app to start
echo "⏳ Waiting for web application to start..."
sleep 10

echo "🎉 Development environment is ready!"
echo "📱 Web app: http://localhost:3000"
echo "🔥 Emulator UI: http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait
