# Firestore Backup System

This document describes the comprehensive backup system for Miamente's Firestore database, including automated weekly backups, validation, and notification systems.

## Overview

The backup system provides:
- **Automated weekly backups** of all Firestore collections
- **JSON export** of collections with metadata
- **Firebase Storage upload** with organized folder structure
- **Backup validation** and integrity checks
- **Multi-channel notifications** (Slack, Email, GitHub)
- **Automatic cleanup** of old backups
- **Manual backup capabilities** via GitHub Actions

## Collections Backed Up

The following Firestore collections are included in each backup:

| Collection | Description | Critical Fields |
|------------|-------------|-----------------|
| `users` | User accounts and profiles | email, fullName, createdAt |
| `professionals` | Professional profiles | email, fullName, specialty, rateCents |
| `availability` | Professional availability slots | professionalId, date, time, duration |
| `appointments` | Booked appointments | userId, professionalId, date, time, status |
| `payments` | Payment transactions | appointmentId, amount, currency, status |
| `reviews` | User reviews and ratings | appointmentId, userId, professionalId, rating, comment |
| `event_log` | System event logs | eventType, timestamp, userId |
| `feature_flags` | Feature flag configurations | name, enabled, description |

## Backup Structure

### Storage Organization

Backups are stored in Firebase Storage with the following structure:

```
gs://PROJECT_ID.appspot.com/backups/
├── YYYY-MM-DD/
│   ├── HHMMSS/
│   │   ├── users.json
│   │   ├── professionals.json
│   │   ├── availability.json
│   │   ├── appointments.json
│   │   ├── payments.json
│   │   ├── reviews.json
│   │   ├── event_log.json
│   │   ├── feature_flags.json
│   │   └── metadata.json
```

### Backup ID Format

Backup IDs follow the format: `YYYY-MM-DD/HHMMSS`
- Example: `2024-01-15/143022` (January 15, 2024 at 14:30:22)

### JSON File Format

Each collection JSON file contains an array of documents with the following structure:

```json
[
  {
    "id": "document_id",
    "data": {
      // Document data fields
    },
    "createTime": "2024-01-15T14:30:22.000Z",
    "updateTime": "2024-01-15T14:30:22.000Z"
  }
]
```

### Metadata File

Each backup includes a `metadata.json` file with:

```json
{
  "backupId": "2024-01-15/143022",
  "projectId": "miamente-prod",
  "timestamp": "2024-01-15T14:30:22.000Z",
  "version": "1.0.0",
  "collections": ["users", "professionals", ...],
  "results": {
    "startTime": "2024-01-15T14:30:22.000Z",
    "endTime": "2024-01-15T14:35:45.000Z",
    "duration": 323000,
    "totalDocuments": 1250,
    "totalSize": "2.5 MB",
    "success": true,
    "errors": []
  },
  "environment": {
    "nodeVersion": "v20.10.0",
    "platform": "linux",
    "arch": "x64"
  }
}
```

## Scripts

### 1. Backup Script (`scripts/backup-firestore.js`)

Main backup script that exports collections and uploads to storage.

**Usage:**
```bash
# Production backup
npm run backup:firestore

# Staging backup
npm run backup:firestore:staging

# Dry run (no upload)
npm run backup:firestore:dry-run

# Custom project
node scripts/backup-firestore.js --project=miamente-prod
```

**Features:**
- Batch processing (500 documents per batch)
- Retry logic with exponential backoff
- Progress reporting
- Error handling and recovery
- Backup validation
- Automatic cleanup

### 2. Validation Script (`scripts/validate-backup.js`)

Validates backup integrity and completeness.

**Usage:**
```bash
# Validate specific backup
npm run backup:validate -- --backup-id=2024-01-15/143022

# Validate with custom project
node scripts/validate-backup.js --backup-id=2024-01-15/143022 --project=miamente-staging
```

**Validation Checks:**
- File existence and readability
- JSON validity
- Document count consistency
- Required field validation
- Data integrity checks
- Live data comparison

### 3. Notification Script (`scripts/backup-notifications.js`)

Sends notifications about backup status.

**Usage:**
```bash
# Send success notification
npm run backup:notify -- --status=success --backup-id=2024-01-15/143022

# Send failure notification
npm run backup:notify -- --status=failure --backup-id=2024-01-15/143022
```

**Notification Channels:**
- **Slack**: Webhook integration with detailed status
- **Email**: HTML email via SendGrid with full report
- **GitHub**: Commit status updates

## GitHub Actions

### Weekly Backup Workflow (`.github/workflows/backup-firestore.yml`)

Automated weekly backup execution every Sunday at 2:00 AM UTC.

**Triggers:**
- **Schedule**: `0 2 * * 0` (Every Sunday at 2:00 AM UTC)
- **Manual**: Via GitHub Actions UI with project selection

**Jobs:**
1. **Setup**: Environment preparation and dependency installation
2. **Backup**: Firestore export and storage upload
3. **Cleanup**: Remove old backups (30-day retention)
4. **Summary**: Generate comprehensive report
5. **Notifications**: Send status notifications

**Manual Execution:**
1. Go to GitHub Actions → "Weekly Firestore Backup"
2. Click "Run workflow"
3. Select project (miamente-prod or miamente-staging)
4. Optionally enable dry-run mode

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account key file | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `BACKUP_BUCKET` | Storage bucket for backups | No (defaults to project.appspot.com) |
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications | No |
| `SENDGRID_API_KEY` | SendGrid API key for emails | No |
| `GITHUB_TOKEN` | GitHub token for status updates | No |
| `BACKUP_NOTIFICATION_EMAIL` | Email for notifications | No |

### GitHub Secrets

Configure the following secrets in your GitHub repository:

| Secret | Description |
|--------|-------------|
| `FIREBASE_SERVICE_ACCOUNT` | Service account JSON (entire file content) |
| `SLACK_WEBHOOK_URL` | Slack webhook URL |
| `SENDGRID_API_KEY` | SendGrid API key |
| `GITHUB_TOKEN` | GitHub personal access token |
| `BACKUP_NOTIFICATION_EMAIL` | Email address for notifications |

### Service Account Permissions

The service account requires the following roles:
- **Firebase Admin** (for Firestore access)
- **Storage Admin** (for backup uploads)
- **Storage Object Admin** (for cleanup operations)

## Monitoring and Alerts

### Backup Status Monitoring

Monitor backup status through:
- **GitHub Actions**: Workflow execution history
- **Slack Notifications**: Real-time status updates
- **Email Reports**: Detailed backup summaries
- **Firebase Console**: Storage bucket contents

### Alert Conditions

Alerts are triggered for:
- Backup failures
- Validation errors
- Storage upload failures
- Missing collections
- Data integrity issues

### Recovery Procedures

In case of backup failures:

1. **Check GitHub Actions logs** for error details
2. **Verify service account permissions**
3. **Check Firebase project status**
4. **Run manual backup** if needed
5. **Contact DevOps team** for critical issues

## Backup Retention

### Automatic Cleanup

- **Retention Period**: 30 days (configurable)
- **Cleanup Schedule**: After each successful backup
- **Storage Optimization**: Automatic removal of old backups

### Manual Cleanup

```bash
# List all backups
gsutil ls gs://PROJECT_ID.appspot.com/backups/

# Delete specific backup
gsutil rm -r gs://PROJECT_ID.appspot.com/backups/YYYY-MM-DD/HHMMSS/

# Delete all backups older than 30 days
gsutil ls gs://PROJECT_ID.appspot.com/backups/ | while read line; do
  # Implementation depends on your cleanup needs
done
```

## Restore Procedures

### From Backup

To restore data from a backup:

1. **Download backup files** from Firebase Storage
2. **Validate backup integrity** using validation script
3. **Import collections** using Firebase Admin SDK
4. **Verify data consistency**

### Example Restore Script

```javascript
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs').promises;

async function restoreCollection(collectionName, backupPath) {
  const app = initializeApp({
    credential: cert(serviceAccount),
    projectId: 'target-project'
  });
  
  const db = getFirestore(app);
  const data = JSON.parse(await fs.readFile(`${backupPath}/${collectionName}.json`, 'utf8'));
  
  const batch = db.batch();
  data.forEach(doc => {
    const ref = db.collection(collectionName).doc(doc.id);
    batch.set(ref, doc.data);
  });
  
  await batch.commit();
  console.log(`Restored ${data.length} documents to ${collectionName}`);
}
```

## Troubleshooting

### Common Issues

**1. Permission Denied**
- Verify service account has required roles
- Check Firebase project access
- Ensure service account key is valid

**2. Storage Upload Failed**
- Check storage bucket permissions
- Verify bucket exists and is accessible
- Check network connectivity

**3. Collection Export Failed**
- Verify collection exists in Firestore
- Check for large collections (consider pagination)
- Review Firestore security rules

**4. Validation Errors**
- Check JSON file integrity
- Verify required fields in documents
- Compare with live data for consistency

### Debug Mode

Enable debug logging:

```bash
DEBUG=* node scripts/backup-firestore.js
```

### Log Analysis

Check logs for:
- Batch processing progress
- Error details and stack traces
- Performance metrics
- Storage upload status

## Best Practices

### Backup Strategy

1. **Regular Testing**: Test restore procedures monthly
2. **Cross-Region**: Consider cross-region backup replication
3. **Encryption**: Ensure backups are encrypted at rest
4. **Monitoring**: Set up comprehensive monitoring
5. **Documentation**: Keep restore procedures updated

### Performance Optimization

1. **Batch Size**: Adjust batch size based on document size
2. **Parallel Processing**: Consider parallel collection exports
3. **Compression**: Compress large backup files
4. **Incremental Backups**: Implement incremental backup strategy

### Security Considerations

1. **Access Control**: Limit backup access to authorized personnel
2. **Encryption**: Use encrypted storage for sensitive data
3. **Audit Logging**: Log all backup and restore operations
4. **Key Rotation**: Regularly rotate service account keys

## Support

For backup system support:
- **Documentation**: This file and inline code comments
- **GitHub Issues**: Report bugs and feature requests
- **DevOps Team**: devops@miamente.com
- **Emergency**: Use manual backup procedures

## Changelog

### Version 1.0.0
- Initial backup system implementation
- Weekly automated backups
- Multi-channel notifications
- Backup validation and integrity checks
- Automatic cleanup of old backups
- Comprehensive documentation
