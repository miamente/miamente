# Version Rollback Response Playbook

## 🚨 Severity: CRITICAL

**Impact**: Application instability, user experience degradation
**Response Time**: 10 minutes
**Resolution Time**: 30 minutes

## 📋 Initial Assessment

### Symptoms

- [ ] Application crashes or errors
- [ ] Performance degradation
- [ ] Feature malfunctions
- [ ] Database connection issues
- [ ] Authentication failures
- [ ] Payment processing errors

### Quick Checks

1. **Check Deployment Status**

   ```bash
   # Check recent deployments
   firebase hosting:releases

   # Check function deployments
   firebase functions:list

   # Check current version
   git log --oneline -5
   ```

2. **Check Application Health**

   ```bash
   # Check application logs
   firebase functions:log --limit 50

   # Check error rates
   grep -i "error\|exception\|crash" /path/to/logs
   ```

3. **Verify Rollback Target**
   - Identify last known good version
   - Check deployment history
   - Verify rollback compatibility

## 🔧 Immediate Response

### Step 1: Acknowledge Incident (5 minutes)

- [ ] Create incident ticket
- [ ] Notify team via Slack: `@channel Critical issue detected - initiating rollback`
- [ ] Update status page
- [ ] Begin user communication

### Step 2: Assess Impact (10 minutes)

- [ ] Determine affected features
- [ ] Check user impact
- [ ] Identify rollback target version
- [ ] Prepare rollback plan

### Step 3: Execute Rollback (15 minutes)

- [ ] Stop new deployments
- [ ] Execute rollback procedures
- [ ] Verify application stability
- [ ] Monitor system health

## 🛠️ Rollback Procedures

### Firebase Hosting Rollback

1. **List Available Releases**

   ```bash
   # List all releases
   firebase hosting:releases

   # Get release details
   firebase hosting:releases:list --limit 10
   ```

2. **Rollback to Previous Version**

   ```bash
   # Rollback to specific release
   firebase hosting:releases:rollback [RELEASE_ID]

   # Or rollback to previous release
   firebase hosting:releases:rollback --previous
   ```

3. **Verify Rollback**

   ```bash
   # Check current release
   firebase hosting:releases:list --limit 1

   # Test application
   curl -I https://miamente-prod.web.app
   ```

### Firebase Functions Rollback

1. **List Function Versions**

   ```bash
   # List all functions
   firebase functions:list

   # Check function logs
   firebase functions:log --only [FUNCTION_NAME]
   ```

2. **Rollback Functions**

   ```bash
   # Rollback specific function
   firebase functions:rollback [FUNCTION_NAME] --version [VERSION]

   # Or deploy previous version
   git checkout [PREVIOUS_COMMIT]
   firebase deploy --only functions:[FUNCTION_NAME]
   ```

3. **Verify Function Health**

   ```bash
   # Test function endpoints
   curl -X POST https://us-central1-miamente-prod.cloudfunctions.net/[FUNCTION_NAME]

   # Check function logs
   firebase functions:log --only [FUNCTION_NAME] --limit 10
   ```

### Database Rollback (if needed)

1. **Check Database Changes**

   ```bash
   # Check recent database changes
   firebase firestore:export gs://miamente-prod.appspot.com/backup-$(date +%Y%m%d-%H%M%S)
   ```

2. **Restore from Backup**

   ```bash
   # List available backups
   gsutil ls gs://miamente-prod.appspot.com/backups/

   # Restore from backup
   firebase firestore:import gs://miamente-prod.appspot.com/backups/[BACKUP_PATH]
   ```

### Git Rollback

1. **Identify Rollback Target**

   ```bash
   # Check commit history
   git log --oneline -10

   # Check specific commit
   git show [COMMIT_HASH]
   ```

2. **Execute Git Rollback**

   ```bash
   # Create rollback branch
   git checkout -b rollback-$(date +%Y%m%d-%H%M%S)

   # Reset to previous commit
   git reset --hard [PREVIOUS_COMMIT]

   # Force push rollback
   git push origin rollback-$(date +%Y%m%d-%H%M%S) --force
   ```

## 🔄 Automated Rollback

### GitHub Actions Rollback

1. **Trigger Rollback Workflow**

   ```bash
   # Use GitHub CLI to trigger rollback
   gh workflow run rollback.yml --ref main
   ```

2. **Monitor Rollback Progress**
   - Check GitHub Actions dashboard
   - Monitor deployment logs
   - Verify rollback completion

### Firebase Rollback Script

```bash
#!/bin/bash
# rollback.sh - Automated rollback script

set -e

echo "🚨 Starting automated rollback..."

# Get previous release
PREVIOUS_RELEASE=$(firebase hosting:releases:list --limit 2 | tail -1 | awk '{print $1}')

echo "📦 Rolling back to release: $PREVIOUS_RELEASE"

# Rollback hosting
firebase hosting:releases:rollback $PREVIOUS_RELEASE

# Rollback functions if needed
if [ "$ROLLBACK_FUNCTIONS" = "true" ]; then
    echo "🔧 Rolling back functions..."
    git checkout HEAD~1
    firebase deploy --only functions
fi

# Verify rollback
echo "✅ Verifying rollback..."
curl -f https://miamente-prod.web.app > /dev/null

echo "🎉 Rollback completed successfully!"
```

## 📊 Post-Rollback Actions

### Immediate (Within 30 minutes)

- [ ] Verify application stability
- [ ] Check all critical functions
- [ ] Monitor error rates
- [ ] Send resolution notification

### Short-term (Within 2 hours)

- [ ] Investigate root cause
- [ ] Fix issues in development
- [ ] Test fixes thoroughly
- [ ] Prepare for re-deployment

### Long-term (Within 24 hours)

- [ ] Conduct post-mortem
- [ ] Update deployment procedures
- [ ] Implement additional safeguards
- [ ] Plan re-deployment strategy

## 🚨 Escalation Procedures

### Level 1: Development Team (0-15 minutes)

- Initial assessment and rollback execution
- Basic troubleshooting
- User communication

### Level 2: DevOps Team (15-30 minutes)

- Advanced rollback procedures
- Infrastructure issues
- Service coordination

### Level 3: Management (30+ minutes)

- Business impact assessment
- External communication
- Resource allocation decisions

## 📞 Contact Information

### Internal Contacts

- **On-call Developer**: [Phone] [Email]
- **DevOps Engineer**: [Phone] [Email]
- **Product Manager**: [Phone] [Email]

### External Contacts

- **Firebase Support**: firebase-support@google.com
- **GitHub Support**: support@github.com
- **Hosting Provider**: [Provider Contact]

## 📋 Communication Templates

### User Communication

```
Subject: Service Update - Issue Resolved

We experienced a technical issue that affected our service. Our team has
successfully resolved the issue and the service is now operating normally.

We apologize for any inconvenience and thank you for your patience.

If you continue to experience any issues, please contact us at:
- Email: support@miamente.com
- Phone: +57 1 234-5678
```

### Team Communication

```
🔄 ROLLBACK: Version Rollback Executed
Status: Completed
Impact: [Impact description]
Duration: [Duration]

Rollback Details:
- Target Version: [Version]
- Rollback Method: [Method]
- Affected Components: [Components]

Next Steps:
- Investigate root cause
- Fix issues in development
- Plan re-deployment
```

## 🔍 Monitoring & Alerts

### Key Metrics to Monitor

- Application error rates
- Response times
- User session success rates
- Database connection health
- Function execution success rates

### Alert Thresholds

- Error rate > 1%
- Response time > 5 seconds
- User session failure > 5%
- Database connection failure > 1%

### Dashboard Links

- [Firebase Console](https://console.firebase.google.com)
- [GitHub Actions](https://github.com/miamente/platform/actions)
- [Application Monitoring](https://monitoring.miamente.com)

## 🛡️ Prevention Measures

### Pre-Deployment Checks

- [ ] Comprehensive testing
- [ ] Staging environment validation
- [ ] Database migration testing
- [ ] Performance testing

### Deployment Safeguards

- [ ] Blue-green deployments
- [ ] Canary releases
- [ ] Automated rollback triggers
- [ ] Health check validation

### Monitoring Setup

- [ ] Real-time error monitoring
- [ ] Performance monitoring
- [ ] User experience tracking
- [ ] Automated alerting

---

**Last Updated**: [Current Date]
**Next Review**: [Next Review Date]
**Version**: 1.0.0
