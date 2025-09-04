# 🚀 Miamente Platform - Development Guide

## 📋 Prerequisites

- **Node.js 20+** (you have 22.16.0 ✅)
- **npm** (you have 10.9.2 ✅)
- **Firebase CLI** (installed ✅)
- **Git** (installed ✅)

## 🛠️ Quick Start

### Option 1: Automated Setup
```bash
# Run the development startup script
./dev-start.sh full
```

### Option 2: Manual Setup

#### 1. Install Dependencies
```bash
# Root dependencies
npm install

# Web app dependencies
cd apps/web && npm install && cd ../..

# Functions dependencies
cd functions && npm install && cd ..
```

#### 2. Configure Environment Variables
```bash
# Copy example environment file
cp apps/web/.env.example apps/web/.env.local

# Edit the file with your Firebase configuration
nano apps/web/.env.local
```

#### 3. Start Development Environment

**Web App Only:**
```bash
cd apps/web
npm run dev
```

**Firebase Emulators Only:**
```bash
firebase emulators:start --project=demo-test
```

**Both (Recommended):**
```bash
# Terminal 1: Start Firebase Emulators
firebase emulators:start --project=demo-test

# Terminal 2: Start Web App
cd apps/web && npm run dev
```

## 🌐 Access Points

Once running, you can access:

- **🌐 Web Application**: http://localhost:3000
- **🔥 Firebase Emulator UI**: http://localhost:4000
- **📊 Firestore Database**: http://localhost:8080
- **🔐 Authentication**: http://localhost:9099
- **☁️ Storage**: http://localhost:9199
- **⚡ Cloud Functions**: http://localhost:5001

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Integration Tests
```bash
npm run test:integration
```

## 🔧 Available Functionalities

### ✅ Implemented Features

1. **🔐 Authentication System**
   - User registration and login
   - Email verification (simulated)
   - Role-based access control (User, Professional, Admin)

2. **👨‍⚕️ Professional Management**
   - Professional registration and verification
   - Profile management
   - Availability slot creation

3. **📅 Appointment Booking**
   - Slot browsing and booking
   - Payment processing (mock)
   - Appointment confirmation

4. **💳 Payment System**
   - Mock payment processing
   - Payment confirmation workflow
   - Admin payment management

5. **📧 Email System**
   - SendGrid integration
   - Confirmation emails
   - Reminder system (24h and 1h)

6. **👨‍💼 Admin Interface**
   - Professional verification
   - Payment management
   - Appointment oversight
   - Metrics dashboard

7. **📊 Analytics & Monitoring**
   - User behavior tracking
   - Payment analytics
   - System metrics

8. **🔄 Backup System**
   - Automated Firestore backups
   - Data validation
   - Multi-channel notifications

## 🎯 Testing Scenarios

### 1. User Registration Flow
1. Go to http://localhost:3000/register
2. Fill out registration form
3. Verify email (simulated)
4. Complete profile setup

### 2. Professional Onboarding
1. Register as professional
2. Complete verification process
3. Set up availability slots
4. Wait for admin approval

### 3. Appointment Booking
1. Browse available professionals
2. Select time slot
3. Complete booking process
4. Process payment (mock)
5. Receive confirmation

### 4. Admin Operations
1. Access admin dashboard
2. Verify professionals
3. Manage appointments
4. Process payments
5. View analytics

### 5. Email & Reminders
1. Trigger confirmation emails
2. Test reminder system
3. Verify email delivery

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Kill processes on specific ports
lsof -ti:3000 | xargs kill -9
lsof -ti:4000 | xargs kill -9
lsof -ti:8080 | xargs kill -9
```

**Firebase Authentication Issues:**
```bash
# Re-authenticate with Firebase
firebase logout
firebase login --no-localhost
```

**Environment Variables Not Loading:**
```bash
# Check if .env.local exists
ls -la apps/web/.env.local

# Restart the development server
cd apps/web && npm run dev
```

**Dependencies Issues:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
rm -rf apps/web/node_modules apps/web/package-lock.json
rm -rf functions/node_modules functions/package-lock.json
npm install
cd apps/web && npm install && cd ../..
cd functions && npm install && cd ..
```

## 📁 Project Structure

```
miamente_platform/
├── apps/web/                 # Next.js Web Application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── lib/            # Utilities and services
│   │   └── hooks/          # Custom React hooks
│   └── .env.local          # Environment variables
├── functions/               # Firebase Cloud Functions
│   ├── src/                # TypeScript source
│   └── lib/                # Compiled JavaScript
├── tests/                   # Test suites
│   ├── e2e/                # End-to-end tests
│   └── integration/        # Integration tests
├── scripts/                 # Utility scripts
├── .github/workflows/       # CI/CD workflows
└── docs/                   # Documentation
```

## 🔗 Useful Commands

```bash
# Development
./dev-start.sh full          # Start full development environment
npm run dev                  # Start web app only
npm run build                # Build for production
npm run lint                 # Run ESLint
npm run typecheck            # Run TypeScript checks

# Testing
npm run test                 # Run unit tests
npm run test:e2e             # Run E2E tests
npm run test:integration     # Run integration tests

# Firebase
firebase emulators:start     # Start emulators
firebase deploy              # Deploy to Firebase
firebase functions:log       # View function logs

# Database
firebase firestore:delete    # Clear Firestore data
firebase auth:export         # Export users
```

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the logs in the terminal
3. Check Firebase Emulator UI for database issues
4. Verify environment variables are set correctly

## 🎉 Happy Coding!

The Miamente platform is now ready for development. All major features are implemented and ready for testing!
