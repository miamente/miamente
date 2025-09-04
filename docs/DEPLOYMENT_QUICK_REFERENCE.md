# 🚀 Deployment Quick Reference

## 📋 Prerequisites Checklist

- [ ] Firebase projects created (`miamente-staging`, `miamente-prod`)
- [ ] Service account created and JSON downloaded
- [ ] GitHub secrets configured
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] User logged in to Firebase (`firebase login`)

## 🔐 Required GitHub Secrets

### Firebase Secrets

```
FIREBASE_SERVICE_ACCOUNT    # Service account JSON (entire file)
FIREBASE_TOKEN             # Firebase CI token
```

### Application Secrets

```
SENDGRID_API_KEY          # SendGrid API key
WOMPI_SECRET              # Wompi payment secret
JITSI_BASE_URL            # Jitsi Meet base URL
```

### Public Variables (GitHub Variables, not secrets)

```
NEXT_PUBLIC_FB_API_KEY
NEXT_PUBLIC_FB_AUTH_DOMAIN
NEXT_PUBLIC_FB_PROJECT_ID
NEXT_PUBLIC_FB_STORAGE_BUCKET
NEXT_PUBLIC_FB_MESSAGING_SENDER_ID
NEXT_PUBLIC_FB_APP_ID
NEXT_PUBLIC_FB_MEASUREMENT_ID
NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY
```

## 🚀 Deployment Commands

### Automatic Deployments

#### Staging (Push to dev branch)

```bash
git checkout dev
git push origin dev
# Automatically deploys to miamente-staging
```

#### Production (Create release tag)

```bash
git tag v1.0.0
git push origin v1.0.0
# Automatically deploys to miamente-prod
```

### Manual Deployments

#### Via GitHub Actions

1. Go to **Actions** tab
2. Click **"Deploy to Firebase"**
3. Click **"Run workflow"**
4. Select environment (staging/production)
5. Click **"Run workflow"**

#### Via Firebase CLI (Local)

```bash
# Staging
firebase use miamente-staging
firebase deploy

# Production
firebase use miamente-prod
firebase deploy
```

## 🔄 Rollback Commands

### Emergency Rollback (GitHub Actions)

1. Go to **Actions** tab
2. Click **"Emergency Rollback"**
3. Click **"Run workflow"**
4. Select environment
5. Enter version (optional)
6. Type **"ROLLBACK"** to confirm
7. Click **"Run workflow"**

### Local Rollback Script

```bash
# Rollback staging to previous version
./scripts/rollback.sh staging

# Rollback production to specific version
./scripts/rollback.sh production v1.0.0

# Dry run (see what would be done)
./scripts/rollback.sh --dry-run staging
```

### Manual Rollback (Firebase CLI)

```bash
# List recent releases
firebase hosting:releases --project miamente-prod

# Rollback hosting
firebase hosting:rollback <release-id> --project miamente-prod

# Rollback functions
git checkout v1.0.0
cd functions && npm run build
firebase deploy --only functions --project miamente-prod
```

## 🌐 Deployment URLs

### Staging Environment

- **Web App**: https://miamente-staging.web.app
- **Functions**: https://us-central1-miamente-staging.cloudfunctions.net
- **Console**: https://console.firebase.google.com/project/miamente-staging

### Production Environment

- **Web App**: https://miamente-prod.web.app
- **Functions**: https://us-central1-miamente-prod.cloudfunctions.net
- **Console**: https://console.firebase.google.com/project/miamente-prod

## 🔍 Verification Commands

### Check Deployment Status

```bash
# Check hosting
curl -I https://miamente-staging.web.app

# Check functions
firebase functions:list --project miamente-staging

# Check project status
firebase projects:list
```

### Local Testing

```bash
# Test staging build
npm run build
firebase serve --project miamente-staging

# Test production build
NODE_ENV=production npm run build
firebase serve --project miamente-prod
```

## 🛠️ Troubleshooting

### Common Issues

#### Service Account Permissions

```bash
# Check service account
gcloud auth activate-service-account --key-file=service-account.json
gcloud projects list
```

#### Firebase Token Expired

```bash
# Generate new token
firebase login:ci
# Update FIREBASE_TOKEN in GitHub secrets
```

#### Build Failures

```bash
# Check environment variables
echo $NEXT_PUBLIC_FB_PROJECT_ID

# Test build locally
npm run build
```

#### Functions Deployment Issues

```bash
# Check function logs
firebase functions:log --project miamente-staging

# Test functions locally
firebase emulators:start --only functions
```

## 📊 Monitoring

### GitHub Actions

- **CI/CD Pipeline**: https://github.com/[owner]/[repo]/actions/workflows/ci.yml
- **Deploy Workflow**: https://github.com/[owner]/[repo]/actions/workflows/deploy.yml
- **Rollback Workflow**: https://github.com/[owner]/[repo]/actions/workflows/rollback.yml

### Firebase Console

- **Staging**: https://console.firebase.google.com/project/miamente-staging
- **Production**: https://console.firebase.google.com/project/miamente-prod

### Logs

```bash
# Hosting logs
firebase hosting:channel:open --project miamente-staging

# Functions logs
firebase functions:log --project miamente-staging

# Firestore logs
# Check in Firebase Console > Firestore > Usage tab
```

## 🆘 Emergency Contacts

- **Development Team**: dev@miamente.com
- **DevOps Team**: devops@miamente.com
- **Emergency**: +57 (1) XXX-XXXX

## 📚 Additional Resources

- [Complete Deployment Setup Guide](DEPLOYMENT_SETUP.md)
- [Firebase Documentation](https://firebase.google.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Project README](../README.md)
