#!/bin/bash

# Script to run Firebase Functions tests with emulators
# This script starts the Firebase emulators, runs the tests, and then stops the emulators

set -e

echo "🚀 Starting Firebase Functions tests with emulators..."

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
    echo "🧹 Cleaning up emulators..."
    pkill -f "firebase emulators" || true
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup EXIT INT TERM

echo "🔥 Starting Firebase emulators..."
firebase emulators:start --project=miamente-test --only functions,firestore,auth &
EMULATOR_PID=$!

# Wait for emulators to start
echo "⏳ Waiting for emulators to start..."
sleep 10

# Check if emulators are running
if ! curl -s http://localhost:4000 > /dev/null; then
    echo "❌ Emulators failed to start"
    exit 1
fi

echo "✅ Emulators are running"

# Run the tests
echo "🧪 Running Firebase Functions tests..."
cd functions
npm test

echo "✅ Tests completed successfully!"
