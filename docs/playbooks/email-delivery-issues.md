# Email Delivery Issues Response Playbook

## 🚨 Severity: MEDIUM-HIGH
**Impact**: Users not receiving confirmations, reminders, or notifications
**Response Time**: 30 minutes
**Resolution Time**: 4 hours

## 📋 Initial Assessment

### Symptoms
- [ ] Users reporting missing emails
- [ ] High bounce rates in SendGrid
- [ ] Email delivery delays
- [ ] SPF/DKIM validation failures
- [ ] Emails going to spam folders
- [ ] Webhook delivery failures

### Quick Checks
1. **Check SendGrid Dashboard**
   - Log into SendGrid dashboard
   - Review delivery statistics
   - Check bounce and spam reports
   - Verify API key status

2. **Check DNS Records**
   ```bash
   # Check SPF record
   dig TXT miamente.com | grep spf
   
   # Check DKIM record
   dig TXT default._domainkey.miamente.com
   
   # Check DMARC record
   dig TXT _dmarc.miamente.com
   ```

3. **Check Application Logs**
   ```bash
   # Check email function logs
   firebase functions:log --only sendEmail
   
   # Check for email-related errors
   grep -i "email\|sendgrid\|bounce" /path/to/logs
   ```

## 🔧 Immediate Response

### Step 1: Acknowledge Incident (10 minutes)
- [ ] Create incident ticket
- [ ] Notify team via Slack: `@channel Email delivery issues detected`
- [ ] Check SendGrid status page
- [ ] Begin user communication

### Step 2: Assess Scope (20 minutes)
- [ ] Check which email types are affected
- [ ] Review bounce and spam reports
- [ ] Test email delivery manually
- [ ] Check DNS record status

### Step 3: Implement Workaround (60 minutes)
- [ ] Send manual notifications for critical emails
- [ ] Update email templates if needed
- [ ] Provide alternative communication methods
- [ ] Log all affected email deliveries

## 🛠️ Troubleshooting Steps

### SendGrid Issues
1. **Check API Status**
   ```bash
   # Test SendGrid API
   curl -X POST https://api.sendgrid.com/v3/mail/send \
     -H "Authorization: Bearer $SENDGRID_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"noreply@miamente.com"},"subject":"Test","content":[{"type":"text/plain","value":"Test email"}]}'
   ```

2. **Check Account Status**
   - Verify account is not suspended
   - Check for API key expiration
   - Review usage limits and quotas
   - Check for any policy violations

### DNS Configuration Issues
1. **SPF Record Problems**
   ```bash
   # Current SPF record should include:
   v=spf1 include:sendgrid.net ~all
   
   # Test SPF record
   dig TXT miamente.com
   ```

2. **DKIM Configuration**
   ```bash
   # Check DKIM record
   dig TXT s1._domainkey.miamente.com
   dig TXT s2._domainkey.miamente.com
   
   # Verify DKIM in SendGrid dashboard
   ```

3. **DMARC Policy**
   ```bash
   # Check DMARC record
   dig TXT _dmarc.miamente.com
   
   # Should be something like:
   v=DMARC1; p=quarantine; rua=mailto:dmarc@miamente.com
   ```

### Application Issues
1. **Check Email Function**
   ```javascript
   // Test email sending function
   const { sendEmail } = require('./functions/src/email');
   await sendEmail({
     to: 'test@example.com',
     subject: 'Test Email',
     html: '<p>Test email content</p>'
   });
   ```

2. **Verify Template Rendering**
   ```javascript
   // Test email template
   const { renderTemplate } = require('./functions/src/templates');
   const html = await renderTemplate('appointment-confirmation', {
     userName: 'Test User',
     appointmentDate: '2024-01-15',
     professionalName: 'Dr. Test'
   });
   ```

3. **Check Webhook Processing**
   ```javascript
   // Test SendGrid webhook
   const { handleSendGridWebhook } = require('./functions/src/webhooks');
   await handleSendGridWebhook(mockWebhookData);
   ```

## 🔄 Recovery Procedures

### If SendGrid Service is Down
1. **Wait for Service Restoration**
   - Monitor SendGrid status page
   - Check for official communications
   - Estimate recovery time

2. **Implement Alternative Email Service**
   - Configure backup email provider
   - Update email functions
   - Test delivery with backup service

### If DNS Issues
1. **Fix SPF Record**
   ```bash
   # Update SPF record in DNS
   v=spf1 include:sendgrid.net include:_spf.google.com ~all
   ```

2. **Fix DKIM Configuration**
   - Generate new DKIM keys in SendGrid
   - Update DNS records
   - Verify DKIM authentication

3. **Update DMARC Policy**
   ```bash
   # Update DMARC record
   v=DMARC1; p=quarantine; rua=mailto:dmarc@miamente.com; ruf=mailto:dmarc@miamente.com; fo=1
   ```

### If Application Issue
1. **Fix Email Function**
   - Update email sending logic
   - Fix template rendering issues
   - Correct webhook handling

2. **Deploy Fix**
   ```bash
   # Deploy updated functions
   firebase deploy --only functions:sendEmail
   firebase deploy --only functions:handleSendGridWebhook
   ```

3. **Verify Resolution**
   - Send test emails
   - Check delivery statistics
   - Monitor bounce rates

## 📊 Post-Incident Actions

### Immediate (Within 2 hours)
- [ ] Verify all email types working
- [ ] Check delivery statistics
- [ ] Send resolution notification
- [ ] Update team on resolution

### Short-term (Within 24 hours)
- [ ] Review incident timeline
- [ ] Identify root cause
- [ ] Implement preventive measures
- [ ] Update monitoring alerts

### Long-term (Within 1 week)
- [ ] Conduct post-mortem meeting
- [ ] Update runbooks and procedures
- [ ] Implement additional monitoring
- [ ] Review email system architecture

## 🚨 Escalation Procedures

### Level 1: Development Team (0-60 minutes)
- Initial assessment and basic troubleshooting
- DNS record verification
- Application fixes

### Level 2: DevOps Team (60-120 minutes)
- Infrastructure and configuration issues
- Service provider coordination
- Advanced troubleshooting

### Level 3: Management (120+ minutes)
- Business impact assessment
- External communication
- Resource allocation decisions

## 📞 Contact Information

### Internal Contacts
- **On-call Developer**: [Phone] [Email]
- **DevOps Engineer**: [Phone] [Email]
- **Product Manager**: [Phone] [Email]

### External Contacts
- **SendGrid Support**: support@sendgrid.com
- **SendGrid Emergency**: +1 555-123-4567
- **DNS Provider Support**: [Provider Contact]
- **Domain Registrar**: [Registrar Contact]

## 📋 Communication Templates

### User Communication
```
Subject: Email Delivery Issues - Resolved

We experienced temporary issues with our email delivery system that may have 
affected confirmation emails, reminders, and notifications.

The issue has been resolved and all emails are now being delivered normally.

If you're still missing any important emails, please contact us at:
- Email: support@miamente.com
- Phone: +57 1 234-5678

We apologize for any inconvenience and thank you for your patience.
```

### Team Communication
```
📧 INCIDENT: Email Delivery Issues
Status: Resolved
Impact: Users not receiving emails
Duration: [Duration]

Root Cause: [Root cause]
Resolution: [Resolution steps]

Next Steps:
- Monitor delivery statistics
- Review DNS configuration
- Update monitoring alerts
```

## 🔍 Monitoring & Alerts

### Key Metrics to Monitor
- Email delivery rate
- Bounce rate
- Spam complaint rate
- Open and click rates
- API response times

### Alert Thresholds
- Delivery rate < 95%
- Bounce rate > 5%
- Spam complaint rate > 0.1%
- API response time > 10 seconds

### Dashboard Links
- [SendGrid Dashboard](https://app.sendgrid.com)
- [DNS Checker](https://dnschecker.org)
- [Email Deliverability Tools](https://mail-tester.com)

## 🛡️ Prevention Measures

### Regular Checks
- [ ] Weekly DNS record verification
- [ ] Monthly email deliverability testing
- [ ] Quarterly SPF/DKIM/DMARC audit
- [ ] Annual email provider review

### Monitoring Setup
- [ ] Email delivery rate monitoring
- [ ] Bounce rate alerts
- [ ] Spam complaint monitoring
- [ ] API response time tracking

---

**Last Updated**: [Current Date]
**Next Review**: [Next Review Date]
**Version**: 1.0.0
