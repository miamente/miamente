# App Check Setup Guide

## Overview

Firebase App Check provides an additional layer of security by verifying that requests to your Firebase services are coming from your authentic app. This guide covers setting up App Check with reCAPTCHA Enterprise for the Miamente platform.

## Prerequisites

- Google Cloud Console access
- Firebase project with billing enabled
- Domain ownership verification

## Step 1: Enable reCAPTCHA Enterprise

1. **Go to Google Cloud Console**
   - Navigate to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your Firebase project

2. **Enable reCAPTCHA Enterprise API**
   - Go to "APIs & Services" > "Library"
   - Search for "reCAPTCHA Enterprise API"
   - Click "Enable"

3. **Create a reCAPTCHA Enterprise Key**
   - Go to "Security" > "reCAPTCHA Enterprise"
   - Click "Create Key"
   - Choose "Website" as the platform
   - Add your domains (e.g., `miamente.com`, `localhost` for development)
   - Choose "Score-based" for reCAPTCHA type
   - Click "Create"

4. **Note the Site Key**
   - Copy the generated site key
   - You'll need this for the environment variable

## Step 2: Configure Firebase App Check

1. **Enable App Check in Firebase Console**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Navigate to "App Check" in the left sidebar
   - Click "Get Started"

2. **Register your web app**
   - Click "Register app"
   - Choose "Web" platform
   - Enter your app nickname (e.g., "Miamente Web")
   - Click "Register app"

3. **Configure reCAPTCHA Enterprise provider**
   - In the App Check dashboard, click "Manage providers"
   - Click "reCAPTCHA Enterprise"
   - Enter your reCAPTCHA Enterprise site key
   - Click "Save"

## Step 3: Environment Configuration

1. **Add Environment Variable**

   ```bash
   # .env.local
   NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY=your_site_key_here
   ```

2. **Update Firebase Configuration**
   The App Check is already configured in `apps/web/src/lib/firebase.ts`:
   ```typescript
   if (typeof window !== "undefined") {
     // App Check - required with reCAPTCHA Enterprise
     const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY ?? "";
     if (siteKey) {
       initializeAppCheck(app, {
         provider: new ReCaptchaEnterpriseProvider(siteKey),
         isTokenAutoRefreshEnabled: true,
       });
     }
   }
   ```

## Step 4: Deploy and Enforce

1. **Deploy your application**

   ```bash
   npm run build
   npm run deploy
   ```

2. **Enable App Check Enforcement**
   - Go to Firebase Console > App Check
   - For each service (Firestore, Storage, Functions), click "Enforce"
   - This will require App Check tokens for all requests

## Step 5: Testing

1. **Test in Development**

   ```bash
   # Start the development server
   npm run dev

   # Check browser console for App Check initialization
   # Should see: "App Check initialized with reCAPTCHA Enterprise"
   ```

2. **Test App Check Token Generation**

   ```typescript
   import { getToken } from "firebase/app-check";

   const appCheck = getAppCheck();
   const token = await getToken(appCheck);
   console.log("App Check token:", token.token);
   ```

3. **Verify Enforcement**
   - Try making requests without App Check tokens
   - Should receive "App Check required" errors
   - With valid tokens, requests should succeed

## Troubleshooting

### Common Issues

1. **"App Check required" errors**
   - Verify the site key is correct
   - Check that the domain is registered in reCAPTCHA Enterprise
   - Ensure App Check is properly initialized

2. **reCAPTCHA not loading**
   - Check browser console for errors
   - Verify the site key format
   - Ensure the domain is whitelisted

3. **Token generation failures**
   - Check network connectivity
   - Verify reCAPTCHA Enterprise API is enabled
   - Check browser console for detailed errors

### Debug Mode

Enable debug mode for development:

```typescript
// In firebase.ts
if (process.env.NODE_ENV === "development") {
  // Enable debug mode
  import("firebase/app-check").then(({ initializeAppCheck }) => {
    initializeAppCheck(
      app,
      {
        provider: new ReCaptchaEnterpriseProvider(siteKey),
        isTokenAutoRefreshEnabled: true,
      },
      { debug: true },
    );
  });
}
```

## Production Considerations

1. **Domain Configuration**
   - Add all production domains to reCAPTCHA Enterprise
   - Remove localhost from production keys
   - Use separate keys for staging and production

2. **Monitoring**
   - Monitor App Check token generation success rates
   - Set up alerts for high failure rates
   - Track blocked requests

3. **Performance**
   - App Check tokens are cached and auto-refreshed
   - Minimal impact on application performance
   - Consider token refresh timing for optimal UX

## Security Best Practices

1. **Key Management**
   - Store site keys in environment variables
   - Never commit keys to version control
   - Rotate keys regularly

2. **Domain Validation**
   - Only add trusted domains to reCAPTCHA Enterprise
   - Regularly review and remove unused domains
   - Use separate keys for different environments

3. **Monitoring**
   - Monitor for unusual token generation patterns
   - Set up alerts for potential abuse
   - Regular security reviews

## Cost Considerations

- **reCAPTCHA Enterprise**: Pay-per-request pricing
- **App Check**: No additional cost beyond reCAPTCHA Enterprise
- **Monitoring**: Consider costs for high-volume applications

## Support

- **Firebase Support**: [Firebase Support](https://firebase.google.com/support)
- **reCAPTCHA Enterprise**: [Google Cloud Support](https://cloud.google.com/support)
- **Documentation**: [App Check Documentation](https://firebase.google.com/docs/app-check)

---

**Last Updated**: 2024-01-15  
**Version**: 1.0
