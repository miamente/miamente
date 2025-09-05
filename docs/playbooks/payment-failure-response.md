# Payment Failure Response Playbook

## 🚨 Severity: HIGH

**Impact**: Users cannot complete bookings, revenue loss
**Response Time**: 15 minutes
**Resolution Time**: 2 hours

## 📋 Initial Assessment

### Symptoms

- [ ] Payment processing errors in logs
- [ ] Users reporting payment failures
- [ ] Wompi webhook failures
- [ ] Payment status not updating
- [ ] Booking confirmations not sent

### Quick Checks

1. **Check Wompi Dashboard**
   - Log into Wompi merchant dashboard
   - Verify API status and connectivity
   - Check for any service outages
   - Review recent transaction logs

2. **Check Application Logs**

   ```bash
   # Check Firebase Functions logs
   firebase functions:log --only payments

   # Check for payment-related errors
   grep -i "payment\|wompi\|error" /path/to/logs
   ```

3. **Verify Configuration**
   - Check Wompi API keys in environment variables
   - Verify webhook endpoints are accessible
   - Confirm payment gateway settings

## 🔧 Immediate Response

### Step 1: Acknowledge Incident (5 minutes)

- [ ] Create incident ticket
- [ ] Notify team via Slack: `@channel Payment processing issues detected`
- [ ] Update status page if applicable
- [ ] Begin user communication

### Step 2: Isolate Issue (10 minutes)

- [ ] Check Wompi service status
- [ ] Verify application connectivity
- [ ] Test payment flow manually
- [ ] Check webhook delivery

### Step 3: Implement Workaround (30 minutes)

- [ ] Enable maintenance mode for payments
- [ ] Display user-friendly error message
- [ ] Provide alternative contact methods
- [ ] Log all affected transactions

## 🛠️ Troubleshooting Steps

### Wompi API Issues

```bash
# Test API connectivity
curl -X POST https://production.wompi.co/v1/transactions \
  -H "Authorization: Bearer $WOMPI_PUBLIC_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Check webhook endpoint
curl -X POST https://your-app.com/api/webhooks/wompi \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

### Application Issues

1. **Check Environment Variables**

   ```bash
   # Verify Wompi configuration
   echo $WOMPI_PUBLIC_KEY
   echo $WOMPI_PRIVATE_KEY
   echo $WOMPI_WEBHOOK_SECRET
   ```

2. **Test Payment Function**

   ```javascript
   // Test payment processing locally
   const { processPayment } = require("./functions/src/payments");
   await processPayment({
     amount: 1000,
     currency: "COP",
     reference: "test-" + Date.now(),
   });
   ```

3. **Check Database**
   ```sql
   -- Check payment records
   SELECT * FROM payments
   WHERE created_at > NOW() - INTERVAL 1 HOUR
   AND status = 'failed';
   ```

### Webhook Issues

1. **Verify Webhook Configuration**
   - Check Wompi webhook URL in dashboard
   - Verify webhook secret matches
   - Test webhook endpoint accessibility

2. **Check Webhook Processing**
   ```javascript
   // Test webhook handler
   const { handleWompiWebhook } = require("./functions/src/webhooks");
   await handleWompiWebhook(mockWebhookData);
   ```

## 🔄 Recovery Procedures

### If Wompi Service is Down

1. **Wait for Service Restoration**
   - Monitor Wompi status page
   - Check for official communications
   - Estimate recovery time

2. **Implement Graceful Degradation**
   - Show maintenance message
   - Provide contact information
   - Queue failed transactions for retry

### If Application Issue

1. **Fix Configuration**
   - Update environment variables
   - Restart Firebase Functions
   - Test payment flow

2. **Deploy Fix**

   ```bash
   # Deploy updated functions
   firebase deploy --only functions:processPayment
   firebase deploy --only functions:handleWompiWebhook
   ```

3. **Verify Resolution**
   - Test payment with small amount
   - Check webhook delivery
   - Monitor error logs

## 📊 Post-Incident Actions

### Immediate (Within 1 hour)

- [ ] Verify all payment flows working
- [ ] Check for any stuck transactions
- [ ] Send resolution notification to users
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
- [ ] Review payment system architecture

## 🚨 Escalation Procedures

### Level 1: Development Team (0-30 minutes)

- Initial assessment and basic troubleshooting
- Implement workarounds
- User communication

### Level 2: DevOps Team (30-60 minutes)

- Infrastructure and configuration issues
- Service provider coordination
- Advanced troubleshooting

### Level 3: Management (60+ minutes)

- Business impact assessment
- External communication
- Resource allocation decisions

## 📞 Contact Information

### Internal Contacts

- **On-call Developer**: [Phone] [Email]
- **DevOps Engineer**: [Phone] [Email]
- **Product Manager**: [Phone] [Email]

### External Contacts

- **Wompi Support**: support@wompi.co
- **Wompi Emergency**: +57 1 123-4567
- **Firebase Support**: firebase-support@google.com

## 📋 Communication Templates

### User Communication

```
Subject: Payment Processing Temporarily Unavailable

We're currently experiencing issues with our payment processing system.
Our team is working to resolve this as quickly as possible.

For urgent bookings, please contact us directly at:
- Email: support@miamente.com
- Phone: +57 1 234-5678

We apologize for any inconvenience and will update you once the issue is resolved.

Thank you for your patience.
```

### Team Communication

```
🚨 INCIDENT: Payment Processing Failure
Status: Investigating
Impact: Users cannot complete bookings
ETA: [Estimated resolution time]

Current Status:
- Wompi API: [Status]
- Application: [Status]
- Webhooks: [Status]

Next Update: [Time]
```

## 🔍 Monitoring & Alerts

### Key Metrics to Monitor

- Payment success rate
- Webhook delivery rate
- API response times
- Error rates by endpoint

### Alert Thresholds

- Payment failure rate > 5%
- Webhook delivery failure > 10%
- API response time > 5 seconds
- Error rate > 1%

### Dashboard Links

- [Wompi Dashboard](https://dashboard.wompi.co)
- [Firebase Console](https://console.firebase.google.com)
- [Application Monitoring](https://monitoring.miamente.com)

---

**Last Updated**: [Current Date]
**Next Review**: [Next Review Date]
**Version**: 1.0.0
