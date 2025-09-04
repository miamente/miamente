# Reminder System Setup Guide

This document outlines the setup and configuration of the automated reminder system for the Miamente platform.

## Overview

The reminder system consists of:

- **HTTPS Function**: `runReminders` - processes appointments and sends emails
- **GitHub Actions**: Automated cron job that calls the function every 5 minutes
- **Idempotency**: Prevents duplicate emails using `sent24h`/`sent1h` flags
- **Event Logging**: All reminder activities logged to `event_log` collection

## Firebase Function Configuration

### Environment Variables

Set the following environment variables in your Firebase Functions:

```bash
# SendGrid configuration (already configured)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@miamente.com

# Reminder system authentication
REMINDERS_AUTH_TOKEN=your_secure_random_token_here

# Optional: Custom Jitsi base URL
JITSI_BASE_URL=https://meet.jit.si
```

### Function Deployment

```bash
cd functions
npm run deploy
```

The function will be available at:

```
https://us-central1-your-project-id.cloudfunctions.net/runReminders
```

## GitHub Actions Setup

### Repository Secrets

Add the following secrets to your GitHub repository:

1. **REMINDERS_FUNCTION_URL**: The full URL of your deployed `runReminders` function
2. **REMINDERS_AUTH_TOKEN**: The same token used in Firebase Functions environment

### Setting up Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the exact names above

### Workflow Configuration

The workflow is configured to run every 5 minutes:

```yaml
schedule:
  - cron: "*/5 * * * *"
```

You can also trigger it manually from the GitHub Actions tab.

## How It Works

### Time Windows

The system uses precise time windows with ±5 minute tolerance:

- **24h Reminders**: `[now+24h-5m, now+24h+5m]`
- **1h Reminders**: `[now+1h-5m, now+1h+5m]`
- **Post-session**: Appointments completed in the last hour

### Idempotency

Each appointment has flags to prevent duplicate emails:

- `sent24h`: Set to `true` after 24h reminder is sent
- `sent1h`: Set to `true` after 1h reminder is sent

### Event Logging

All reminder activities are logged to the `event_log` collection:

```javascript
{
  eventType: "reminder_sent" | "post_session_email_sent",
  data: {
    appointmentId: string,
    type?: "24h" | "1h",
    userId: string,
    proId: string
  },
  timestamp: Timestamp,
  source: "reminders-https"
}
```

## Testing

### Local Testing

1. **Start Firebase Emulators**:

   ```bash
   npm run emulators
   ```

2. **Test the Function**:

   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:5001/your-project-id/us-central1/runReminders
   ```

3. **Run Tests**:
   ```bash
   cd apps/web
   npm test -- reminders.test.tsx
   ```

### Production Testing

1. **Manual Trigger**: Use GitHub Actions "Run workflow" button
2. **Check Logs**: Monitor Firebase Functions logs
3. **Verify Emails**: Check that emails are sent correctly
4. **Event Logs**: Verify entries in `event_log` collection

## Monitoring

### Firebase Functions Logs

Monitor the function execution:

```bash
firebase functions:log --only runReminders
```

### GitHub Actions Logs

Check workflow execution in the Actions tab of your repository.

### Event Log Queries

Query reminder events:

```javascript
// Get all reminder events
const reminderEvents = await db
  .collection("event_log")
  .where("eventType", "==", "reminder_sent")
  .orderBy("timestamp", "desc")
  .get();

// Get events for specific user
const userEvents = await db
  .collection("event_log")
  .where("eventType", "==", "reminder_sent")
  .where("data.userId", "==", userId)
  .get();
```

## Troubleshooting

### Common Issues

1. **Function Not Responding**:
   - Check Firebase Functions logs
   - Verify environment variables are set
   - Ensure function is deployed correctly

2. **GitHub Actions Failing**:
   - Verify repository secrets are set correctly
   - Check the Actions tab for error details
   - Ensure the function URL is accessible

3. **Duplicate Emails**:
   - Check that `sent24h`/`sent1h` flags are being set
   - Verify idempotency logic in the function
   - Review event logs for duplicate entries

4. **Missing Emails**:
   - Verify SendGrid configuration
   - Check appointment status (must be "paid" or "confirmed")
   - Ensure appointments are within time windows
   - Check user email addresses are valid

### Debug Mode

Enable debug logging by setting:

```bash
FIREBASE_FUNCTIONS_LOG_LEVEL=debug
```

### Performance Monitoring

Monitor function performance:

- Execution time (should be < 30 seconds)
- Memory usage
- Error rates
- Email delivery rates

## Security Considerations

1. **Authentication Token**:
   - Use a strong, random token
   - Rotate regularly
   - Never commit to version control

2. **Function Access**:
   - Only allow GET requests
   - Require Bearer token authentication
   - Log all access attempts

3. **Data Privacy**:
   - Only log necessary data
   - Follow GDPR compliance
   - Secure email content

## Scaling Considerations

1. **High Volume**:
   - Consider batch processing for large numbers of appointments
   - Monitor SendGrid rate limits
   - Implement retry logic for failed emails

2. **Geographic Distribution**:
   - Consider multiple function regions
   - Timezone-aware scheduling
   - Localized email templates

3. **Cost Optimization**:
   - Monitor function execution costs
   - Optimize database queries
   - Consider caching strategies

## Maintenance

### Regular Tasks

1. **Weekly**:
   - Review function logs for errors
   - Check email delivery rates
   - Monitor GitHub Actions execution

2. **Monthly**:
   - Rotate authentication tokens
   - Review and clean up old event logs
   - Update email templates if needed

3. **Quarterly**:
   - Review and update security practices
   - Analyze performance metrics
   - Update documentation

### Backup and Recovery

1. **Event Logs**: Regular exports for audit purposes
2. **Function Code**: Version control with Git
3. **Configuration**: Document all environment variables
4. **Secrets**: Secure backup of authentication tokens
