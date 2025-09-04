# Email Configuration Guide

This document outlines the email setup for the Miamente platform using SendGrid and proper email authentication.

## SendGrid Configuration

### 1. Environment Variables

Set the following environment variables in your Firebase Functions:

```bash
# SendGrid API Key
SENDGRID_API_KEY=your_sendgrid_api_key_here

# From email address (must be verified in SendGrid)
SENDGRID_FROM_EMAIL=noreply@miamente.com

# Optional: Custom Jitsi base URL
JITSI_BASE_URL=https://meet.jit.si
```

### 2. SendGrid Setup

1. **Create SendGrid Account**: Sign up at [sendgrid.com](https://sendgrid.com)
2. **Generate API Key**:
   - Go to Settings > API Keys
   - Create a new API key with "Full Access" permissions
   - Copy the key and set it as `SENDGRID_API_KEY`

3. **Verify Sender Identity**:
   - Go to Settings > Sender Authentication
   - Choose "Single Sender Verification" for testing
   - For production, use "Domain Authentication" (recommended)

## Email Authentication (DKIM/SPF)

### Domain Authentication (Recommended for Production)

1. **Domain Verification**:
   - In SendGrid, go to Settings > Sender Authentication
   - Click "Authenticate Your Domain"
   - Enter your domain (e.g., `miamente.com`)

2. **DNS Records to Add**:

   **SPF Record** (TXT):

   ```
   v=spf1 include:sendgrid.net ~all
   ```

   **DKIM Records** (CNAME):

   ```
   s1._domainkey.miamente.com → s1.domainkey.u1234567.wl123.sendgrid.net
   s2._domainkey.miamente.com → s2.domainkey.u1234567.wl123.sendgrid.net
   ```

   **DMARC Record** (TXT):

   ```
   v=DMARC1; p=quarantine; rua=mailto:dmarc@miamente.com
   ```

3. **Verification Process**:
   - Add the DNS records to your domain's DNS settings
   - Wait for DNS propagation (up to 48 hours)
   - Verify in SendGrid dashboard

### Single Sender Verification (For Testing)

1. **Add Sender**:
   - Go to Settings > Sender Authentication
   - Click "Verify a Single Sender"
   - Add email address (e.g., `noreply@miamente.com`)

2. **Verify Email**:
   - Check the verification email sent to the address
   - Click the verification link

## Email Templates

The platform includes three main email templates:

### 1. Confirmation Email

- **Trigger**: When payment is confirmed
- **Content**: Appointment details, Jitsi link, preparation instructions
- **Subject**: "Confirmación de cita - [Date/Time]"

### 2. Reminder Emails

- **Trigger**: 24 hours and 1 hour before appointment
- **Content**: Reminder with Jitsi link and preparation tips
- **Subject**: "Recordatorio: Tu cita es [time] - [Date/Time]"

### 3. Post-Session Email

- **Trigger**: After appointment completion
- **Content**: Thank you message and next steps
- **Subject**: "Gracias por tu sesión - Miamente"

## Email Delivery Best Practices

### 1. Reputation Management

- Use consistent "From" addresses
- Maintain low bounce rates (< 2%)
- Monitor spam complaints (< 0.1%)
- Use double opt-in for subscriptions

### 2. Content Guidelines

- Avoid spam trigger words
- Use proper HTML structure
- Include unsubscribe links
- Test emails across different clients

### 3. Monitoring

- Set up SendGrid webhooks for delivery events
- Monitor bounce and complaint rates
- Track open and click rates
- Set up alerts for delivery issues

## Testing

### 1. Local Testing

```bash
# Start Firebase emulators
npm run emulators

# Test email function
curl -X POST http://localhost:5001/demo-miamente/us-central1/sendEmail \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "to": "test@example.com",
      "subject": "Test Email",
      "html": "<h1>Test</h1>"
    }
  }'
```

### 2. Production Testing

- Use SendGrid's email testing tools
- Send test emails to different email providers
- Verify DKIM/SPF authentication
- Check spam folder placement

## Troubleshooting

### Common Issues

1. **Emails going to spam**:
   - Check SPF/DKIM configuration
   - Review email content for spam triggers
   - Warm up IP reputation gradually

2. **Authentication errors**:
   - Verify API key permissions
   - Check sender verification status
   - Ensure domain authentication is complete

3. **Delivery failures**:
   - Check bounce handling
   - Verify recipient email addresses
   - Monitor SendGrid activity feed

### Support Resources

- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Email Authentication Guide](https://sendgrid.com/docs/ui/account-and-settings/how-to-set-up-domain-authentication/)
- [Firebase Functions Email Guide](https://firebase.google.com/docs/functions/email)

## Security Considerations

1. **API Key Security**:
   - Store API keys in Firebase Functions environment variables
   - Never commit API keys to version control
   - Rotate keys regularly

2. **Email Content**:
   - Sanitize user input in email templates
   - Use HTTPS for all links
   - Implement rate limiting for email functions

3. **Privacy Compliance**:
   - Include unsubscribe mechanisms
   - Respect user preferences
   - Comply with GDPR/CAN-SPAM regulations
