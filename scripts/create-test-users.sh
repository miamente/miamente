#!/bin/bash

# Script to create test users manually in Firebase Auth emulator
# Run this if dev-start.sh failed to create users

echo "👥 Creating test users in Firebase Auth emulator..."
echo "================================================="

# Check if Auth emulator is running
if ! curl -s http://localhost:9099 > /dev/null 2>&1; then
    echo "❌ Firebase Auth emulator is not running on port 9099"
    echo "Please start the emulators first:"
    echo "   firebase emulators:start --project=demo-miamente --config=firebase.dev.json"
    exit 1
fi

echo "✅ Auth emulator detected on port 9099"

# Try to create users with retry logic
SUCCESS=false
for attempt in 1 2 3; do
    echo ""
    echo "🔄 Attempt $attempt/3: Creating test users..."
    
    if node "$(dirname "$0")/init-test-users.js"; then
        echo "✅ Test users created successfully!"
        SUCCESS=true
        break
    else
        echo "❌ Attempt $attempt failed"
        if [ $attempt -lt 3 ]; then
            echo "⏳ Waiting 5 seconds before retry..."
            sleep 5
        fi
    fi
done

if [ "$SUCCESS" = false ]; then
    echo ""
    echo "❌ Failed to create test users after 3 attempts"
    echo "💡 You can create users manually using the Firebase Auth UI:"
    echo "   http://localhost:4000/auth"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   1. Ensure emulators are running: firebase emulators:start"
    echo "   2. Check Auth emulator status: curl http://localhost:9099"
    echo "   3. Try restarting the emulators"
    exit 1
fi

echo ""
echo "🎉 Test users are ready!"
echo "📝 Available credentials:"
echo "   - admin@miamente.com / admin123 (Admin)"
echo "   - user@miamente.com / user123 (User)"  
echo "   - pro@miamente.com / pro123 (Professional)"
echo "   - test@miamente.com / test123 (User)"
