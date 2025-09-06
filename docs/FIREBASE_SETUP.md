# Firebase Configuration Setup

## Problem Resolved

The issue with the Firestore connection loop was caused by missing Firebase configuration. The application was trying to connect to a project with ID `your_project_id` instead of the actual project ID.

## Solution

Create a `.env.local` file in the `apps/web/` directory with the following configuration:

```bash
# Firebase Configuration for Development
NEXT_PUBLIC_FB_API_KEY=demo-key
NEXT_PUBLIC_FB_AUTH_DOMAIN=demo-miamente.firebaseapp.com
NEXT_PUBLIC_FB_PROJECT_ID=demo-miamente
NEXT_PUBLIC_FB_STORAGE_BUCKET=demo-miamente.appspot.com
NEXT_PUBLIC_FB_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FB_APP_ID=1:123456789012:web:abcdef1234567890
NEXT_PUBLIC_FB_MEASUREMENT_ID=G-XXXXXXXXXX
NODE_ENV=development
```

## For Production

For production deployment, replace the demo values with your actual Firebase project configuration:

```bash
# Firebase Project Configuration
NEXT_PUBLIC_FB_API_KEY=your_actual_api_key
NEXT_PUBLIC_FB_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FB_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_FB_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FB_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FB_APP_ID=your_actual_app_id
NEXT_PUBLIC_FB_MEASUREMENT_ID=your_actual_measurement_id
```

## Firebase Emulators

The application is configured to automatically connect to Firebase emulators when running in development mode. Make sure the emulators are running:

```bash
firebase emulators:start --project=demo-miamente --config=firebase.dev.json
```

## Verification

After setting up the configuration:

1. Restart the Next.js development server
2. Navigate to `http://localhost:3000/login`
3. The Firestore connection loop should be resolved
4. Authentication should work properly with the emulators

## Troubleshooting

If you still see connection issues:

1. Verify that Firebase emulators are running on the correct ports
2. Check the browser console for any Firebase connection errors
3. Ensure the `.env.local` file is in the correct location (`apps/web/.env.local`)
4. Restart both the emulators and the Next.js server
