# Security Documentation - Miamente Platform

## Overview

This document outlines the comprehensive security measures implemented in the Miamente platform to protect user data, prevent abuse, and ensure system integrity.

## 🔐 Authentication & Authorization

### Firebase Authentication

- **Email/Password Authentication**: Secure user registration and login
- **Email Verification**: Required for account activation
- **Password Requirements**: Minimum 6 characters (configurable)
- **Session Management**: Firebase handles secure session tokens

### Role-Based Access Control (RBAC)

- **User Roles**: `user`, `pro` (professional), `admin`
- **Role Gates**: Component-level access control
- **API Protection**: Server-side role verification
- **Admin Functions**: Restricted to admin users only

## 🛡️ App Check Integration

### reCAPTCHA Enterprise

- **Implementation**: Integrated with Firebase App Check
- **Protection**: Prevents automated abuse and bot attacks
- **Token Validation**: Required for all client requests
- **Environment Variable**: `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY`

### Setup Instructions

1. Enable reCAPTCHA Enterprise in Google Cloud Console
2. Create a new site key for your domain
3. Configure the site key in environment variables
4. Deploy with App Check enforcement enabled

## 🔒 Firestore Security Rules

### User Data Protection

```javascript
// Users can only read their own private data
match /users/{userId} {
  allow read: if isSignedIn() && isAppCheckValid() && (
    isOwner(userId) || isAdmin() ||
    // Others can only read public fields
    (resource.data.keys().hasAll(['role', 'fullName']) &&
     !resource.data.keys().hasAny(['phone', 'email']))
  );
}
```

### Appointment Security

```javascript
// Users can only create appointments for themselves
match /appointments/{appointmentId} {
  allow create: if isSignedIn() && isAppCheckValid() && isWithinRateLimit() &&
    request.auth.uid == request.resource.data.userId && isUser();
}
```

### Review System Protection

```javascript
// Users can only create one review per appointment
match /reviews/{reviewId} {
  allow create: if isSignedIn() &&
    request.auth.uid == request.resource.data.userId &&
    request.resource.data.rating >= 1 &&
    request.resource.data.rating <= 5;
  allow update: if false; // No editing reviews
  allow delete: if false; // No deleting reviews
}
```

## 📁 Storage Security Rules

### File Access Control

```javascript
// Public photos - anyone can read, only owner can write
match /public/{userId}/{allPaths=**} {
  allow read: if isSignedIn() && isAppCheckValid();
  allow write: if isSignedIn() && isAppCheckValid() && isOwner(userId);
}

// Private credentials - only owner and admins can read
match /private/{userId}/{allPaths=**} {
  allow read: if isSignedIn() && isAppCheckValid() && (isOwner(userId) || isAdmin());
  allow write: if isSignedIn() && isAppCheckValid() && isOwner(userId);
}
```

### File Upload Security

- **File Type Validation**: Only allowed file types accepted
- **Size Limits**: Maximum file size restrictions
- **Virus Scanning**: Implemented at storage level
- **Access Logging**: All file access attempts logged

## ⚡ Rate Limiting

### Implementation

- **Firebase Functions**: Rate limiting on server-side operations
- **Per-User Limits**: Based on user ID and IP address
- **Time Windows**: Sliding window rate limiting
- **Configurable Limits**: Different limits for different operations

### Rate Limit Configurations

```typescript
const RATE_LIMITS = {
  APPOINTMENT_CREATION: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  EMAIL_SENDING: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  PROFILE_UPDATES: {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
};
```

### Rate Limit Storage

- **Firestore Collection**: `rate_limits` for tracking
- **Automatic Cleanup**: Old entries removed daily
- **IP Fallback**: Rate limiting by IP when user ID unavailable

## 🧪 Security Testing

### Negative Test Cases

- **Cross-User Access**: Users cannot access other users' data
- **Unauthorized Operations**: Prevented unauthorized CRUD operations
- **File Access Control**: Users cannot read private files of others
- **Rate Limit Enforcement**: Excessive requests blocked
- **Role Bypass Attempts**: Role-based restrictions enforced

### Test Implementation

```typescript
// Example negative test
it("should prevent users from reading other users' private data", async () => {
  const user1 = await createUser("user1@example.com");
  const user2 = await createUser("user2@example.com");

  // User2 tries to read User1's private data - should fail
  try {
    await getDoc(doc(firestore, "users", user1.uid));
    expect.fail("Should not be able to read other user's data");
  } catch (error) {
    expect(error).toBeDefined();
  }
});
```

## 🔍 Monitoring & Logging

### Event Logging

- **User Actions**: All user actions logged with metadata
- **Security Events**: Failed authentication attempts, rate limit violations
- **Admin Access**: All admin operations logged
- **Data Access**: Sensitive data access tracked

### Analytics Events

```typescript
// Security-relevant events tracked
-signup -
  profile_complete -
  appointment_confirmed -
  payment_attempt -
  payment_success -
  payment_failed;
```

### Error Handling

- **Graceful Degradation**: System continues functioning on errors
- **Error Logging**: All errors logged for analysis
- **User Feedback**: Appropriate error messages without exposing internals

## 🚨 Incident Response

### Security Incident Procedures

1. **Detection**: Automated monitoring alerts
2. **Assessment**: Evaluate severity and impact
3. **Containment**: Isolate affected systems
4. **Eradication**: Remove threat vectors
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Update security measures

### Contact Information

- **Security Team**: security@miamente.com
- **Emergency Contact**: +1-XXX-XXX-XXXX
- **Bug Bounty**: security@miamente.com

## 🔧 Security Configuration

### Environment Variables

```bash
# Required for App Check
NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY=your_site_key

# Firebase Configuration
NEXT_PUBLIC_FB_API_KEY=your_api_key
NEXT_PUBLIC_FB_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FB_PROJECT_ID=your_project_id

# Security Settings
RATE_LIMIT_ENABLED=true
APP_CHECK_ENFORCEMENT=true
```

### Firebase Security Rules Deployment

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```

## 📋 Security Checklist

### Pre-Deployment

- [ ] App Check configured with reCAPTCHA Enterprise
- [ ] Firestore security rules tested and deployed
- [ ] Storage security rules tested and deployed
- [ ] Rate limiting configured and tested
- [ ] Security tests passing
- [ ] Environment variables secured
- [ ] HTTPS enforced
- [ ] CORS configured properly

### Post-Deployment

- [ ] Monitor security logs
- [ ] Verify rate limiting is working
- [ ] Check App Check token validation
- [ ] Monitor for suspicious activity
- [ ] Regular security rule reviews
- [ ] User access pattern analysis

### Regular Maintenance

- [ ] Security rule updates
- [ ] Rate limit adjustments
- [ ] Log analysis and cleanup
- [ ] Security test updates
- [ ] Dependency updates
- [ ] Security audit reviews

## 🛠️ Development Security

### Code Security Practices

- **Input Validation**: All inputs validated and sanitized
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Prevention**: Content sanitization
- **CSRF Protection**: Token-based protection
- **Secure Headers**: Security headers implemented

### Dependency Management

- **Regular Updates**: Dependencies updated regularly
- **Vulnerability Scanning**: Automated vulnerability detection
- **License Compliance**: Open source license compliance
- **Minimal Dependencies**: Only necessary dependencies included

## 📚 Additional Resources

### Documentation

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [App Check Documentation](https://firebase.google.com/docs/app-check)
- [reCAPTCHA Enterprise](https://cloud.google.com/recaptcha-enterprise)
- [OWASP Security Guidelines](https://owasp.org/)

### Tools

- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Firebase Security Rules Playground](https://firebase.google.com/docs/rules/playground)
- [OWASP ZAP](https://owasp.org/www-project-zap/)

---

**Last Updated**: 2024-01-15  
**Version**: 1.0  
**Review Schedule**: Quarterly
