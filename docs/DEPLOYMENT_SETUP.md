# 🚀 Deployment Setup Guide

This guide explains how to set up Firebase projects, configure GitHub secrets, and manage deployments for the Miamente platform.

## 📋 Prerequisites

- Firebase CLI installed (`npm install -g firebase-tools`)
- Google Cloud Console access
- GitHub repository admin access
- Node.js 20+ installed

## 🏗️ Firebase Project Setup

### 1. Create Firebase Projects

Create two Firebase projects for staging and production:

```bash
# Login to Firebase
firebase login

# Create staging project
firebase projects:create miamente-staging

# Create production project
firebase projects:create miamente-prod
```

### 2. Configure Firebase Projects

For each project (staging and production), configure the following services:

#### Enable Required Services

```bash
# Enable Authentication
firebase auth:enable --project miamente-staging
firebase auth:enable --project miamente-prod

# Enable Firestore
firebase firestore:enable --project miamente-staging
firebase firestore:enable --project miamente-prod

# Enable Storage
firebase storage:enable --project miamente-staging
firebase storage:enable --project miamente-prod

# Enable Functions
firebase functions:enable --project miamente-staging
firebase functions:enable --project miamente-prod

# Enable Hosting
firebase hosting:enable --project miamente-staging
firebase hosting:enable --project miamente-prod
```

#### Configure Authentication Providers

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication > Sign-in method**
4. Enable **Email/Password** authentication
5. Optionally enable **Google** authentication

#### Set up Firestore Database

1. Go to **Firestore Database**
2. Create database in **production mode**
3. Choose a location (recommended: `us-central1`)

#### Configure Storage

1. Go to **Storage**
2. Start in **production mode**
3. Choose the same location as Firestore

#### Set up Hosting

1. Go to **Hosting**
2. Add a custom domain (optional)
3. Configure SSL certificates

### 3. Create Service Account

#### Generate Service Account Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to **IAM & Admin > Service Accounts**
4. Click **Create Service Account**
5. Fill in the details:
   - **Name**: `miamente-deploy`
   - **Description**: `Service account for Miamente deployments`
6. Click **Create and Continue**
7. Assign roles:
   - `Firebase Admin`
   - `Cloud Functions Admin`
   - `Firebase Hosting Admin`
   - `Firestore Service Agent`
   - `Storage Admin`
8. Click **Done**
9. Click on the created service account
10. Go to **Keys** tab
11. Click **Add Key > Create new key**
12. Choose **JSON** format
13. Download the JSON file

#### Generate Firebase Token

```bash
# Login and generate token
firebase login:ci

# This will output a token like: 1//0G...
# Save this token for GitHub secrets
```

## 🔐 GitHub Secrets Configuration

### Required Secrets

Navigate to your GitHub repository: **Settings > Secrets and variables > Actions**

#### Firebase Secrets

| Secret Name                | Description                                | Example                            |
| -------------------------- | ------------------------------------------ | ---------------------------------- |
| `FIREBASE_SERVICE_ACCOUNT` | Service account JSON (entire file content) | `{"type": "service_account", ...}` |
| `FIREBASE_TOKEN`           | Firebase CI token                          | `1//0G...`                         |

#### Application Secrets

| Secret Name        | Description                  | Example               |
| ------------------ | ---------------------------- | --------------------- |
| `SENDGRID_API_KEY` | SendGrid API key for emails  | `SG.abc123...`        |
| `WOMPI_SECRET`     | Wompi payment gateway secret | `prv_test_...`        |
| `JITSI_BASE_URL`   | Jitsi Meet base URL          | `https://meet.jit.si` |

#### Public Environment Variables

| Variable Name                               | Description                       | Example                            |
| ------------------------------------------- | --------------------------------- | ---------------------------------- |
| `NEXT_PUBLIC_FB_API_KEY`                    | Firebase API key                  | `AIza...`                          |
| `NEXT_PUBLIC_FB_AUTH_DOMAIN`                | Firebase auth domain              | `miamente-staging.firebaseapp.com` |
| `NEXT_PUBLIC_FB_PROJECT_ID`                 | Firebase project ID               | `miamente-staging`                 |
| `NEXT_PUBLIC_FB_STORAGE_BUCKET`             | Firebase storage bucket           | `miamente-staging.appspot.com`     |
| `NEXT_PUBLIC_FB_MESSAGING_SENDER_ID`        | Firebase messaging sender ID      | `123456789`                        |
| `NEXT_PUBLIC_FB_APP_ID`                     | Firebase app ID                   | `1:123456789:web:abc123`           |
| `NEXT_PUBLIC_FB_MEASUREMENT_ID`             | Firebase analytics measurement ID | `G-ABC123`                         |
| `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY` | reCAPTCHA Enterprise site key     | `6Lc...`                           |

### How to Add Secrets

1. Go to your GitHub repository
2. Click **Settings** tab
3. Click **Secrets and variables** > **Actions**
4. Click **New repository secret**
5. Enter the secret name and value
6. Click **Add secret**

### How to Add Variables

1. Go to **Secrets and variables** > **Actions**
2. Click **Variables** tab
3. Click **New repository variable**
4. Enter the variable name and value
5. Click **Add variable**

## 🚀 Deployment Workflows

### Automatic Deployments

#### Staging Deployment

- **Trigger**: Push to `dev` branch
- **Target**: `miamente-staging` project
- **URL**: `https://miamente-staging.web.app`

#### Production Deployment

- **Trigger**: Push tag `v*` (e.g., `v1.0.0`)
- **Target**: `miamente-prod` project
- **URL**: `https://miamente-prod.web.app`

### Manual Deployments

#### Manual Staging Deployment

```bash
# Go to Actions tab in GitHub
# Click "Deploy to Firebase" workflow
# Click "Run workflow"
# Select "staging" environment
# Click "Run workflow"
```

#### Manual Production Deployment

```bash
# Go to Actions tab in GitHub
# Click "Deploy to Firebase" workflow
# Click "Run workflow"
# Select "production" environment
# Click "Run workflow"
```

### Creating Releases

#### Create and Deploy a Release

```bash
# Create a new tag
git tag v1.0.0
git push origin v1.0.0

# This will automatically:
# 1. Deploy to production
# 2. Create a GitHub release
# 3. Send notifications
```

## 🔄 Rollback Procedures

### Rollback Firebase Hosting

#### Method 1: Using Firebase CLI

```bash
# List previous deployments
firebase hosting:releases --project miamente-prod

# Rollback to specific release
firebase hosting:rollback <release-id> --project miamente-prod
```

#### Method 2: Using GitHub Actions

```bash
# Go to Actions tab
# Find the last successful deployment
# Click "Re-run jobs"
# This will redeploy the previous version
```

### Rollback Firebase Functions

```bash
# List function versions
firebase functions:list --project miamente-prod

# Deploy previous version
firebase deploy --only functions --project miamente-prod
```

### Rollback Firestore/Storage Rules

```bash
# Revert to previous rules
git checkout HEAD~1 -- firestore.rules storage.rules
firebase deploy --only firestore:rules,storage --project miamente-prod
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Service Account Permissions

**Error**: `Permission denied`
**Solution**: Ensure service account has all required roles:

- Firebase Admin
- Cloud Functions Admin
- Firebase Hosting Admin
- Firestore Service Agent
- Storage Admin

#### 2. Firebase Token Expired

**Error**: `Firebase token expired`
**Solution**: Generate new token:

```bash
firebase login:ci
# Update FIREBASE_TOKEN secret in GitHub
```

#### 3. Build Failures

**Error**: Build fails during deployment
**Solution**: Check environment variables are set correctly:

- Verify all `NEXT_PUBLIC_*` variables are configured
- Ensure secrets are properly formatted

#### 4. Functions Deployment Fails

**Error**: Functions deployment timeout
**Solution**:

- Check function code for errors
- Verify all dependencies are installed
- Check function timeout settings

### Debug Commands

#### Check Firebase Project Status

```bash
firebase projects:list
firebase use --add
```

#### Verify Service Account

```bash
gcloud auth activate-service-account --key-file=service-account.json
gcloud projects list
```

#### Test Local Deployment

```bash
# Test staging build
npm run build
firebase serve --project miamente-staging

# Test production build
NODE_ENV=production npm run build
firebase serve --project miamente-prod
```

## 📊 Monitoring Deployments

### GitHub Actions Dashboard

- Go to **Actions** tab in your repository
- View deployment history and logs
- Monitor deployment status

### Firebase Console

- Check **Hosting** for web app status
- Check **Functions** for function status
- Check **Firestore** for database status
- Check **Storage** for file storage status

### Deployment URLs

#### Staging Environment

- **Web App**: https://miamente-staging.web.app
- **Functions**: https://us-central1-miamente-staging.cloudfunctions.net
- **Console**: https://console.firebase.google.com/project/miamente-staging

#### Production Environment

- **Web App**: https://miamente-prod.web.app
- **Functions**: https://us-central1-miamente-prod.cloudfunctions.net
- **Console**: https://console.firebase.google.com/project/miamente-prod

## 🔒 Security Best Practices

### Service Account Security

- Store service account JSON securely
- Rotate service account keys regularly
- Use least privilege principle
- Monitor service account usage

### Environment Variables

- Never commit secrets to repository
- Use GitHub secrets for sensitive data
- Use GitHub variables for public configuration
- Regularly rotate API keys

### Firebase Security Rules

- Test rules in staging before production
- Use Firebase emulator for local testing
- Implement proper access controls
- Monitor rule violations

## 📝 Deployment Checklist

### Pre-deployment

- [ ] All tests pass
- [ ] Code review completed
- [ ] Environment variables configured
- [ ] Secrets updated
- [ ] Firebase projects configured

### During Deployment

- [ ] Monitor deployment logs
- [ ] Verify all services deploy successfully
- [ ] Check for any errors or warnings
- [ ] Test critical functionality

### Post-deployment

- [ ] Verify web app loads correctly
- [ ] Test authentication flow
- [ ] Verify functions are accessible
- [ ] Check database connectivity
- [ ] Monitor error logs
- [ ] Update documentation if needed

## 🆘 Emergency Procedures

### Emergency Rollback

```bash
# Quick rollback to previous version
git checkout HEAD~1
git push origin main --force

# Or use Firebase CLI
firebase hosting:rollback --project miamente-prod
```

### Contact Information

- **Development Team**: dev@miamente.com
- **DevOps Team**: devops@miamente.com
- **Emergency**: +57 (1) XXX-XXXX

---

For additional support, please refer to:

- [Firebase Documentation](https://firebase.google.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Project README](../README.md)
