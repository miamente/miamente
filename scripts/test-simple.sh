#!/bin/bash

# Script to run simple tests that don't require Firebase emulators

set -e

echo "🧪 Running simple tests..."

# Run web app simple tests
echo "📱 Testing web application..."
cd apps/web
npm test -- simple.test.tsx

# Run functions emulator tests (these don't require external emulators)
echo "⚡ Testing Firebase Functions emulator setup..."
cd ../../functions
npm test -- emulator.test.ts

echo "✅ Simple tests completed successfully!"
