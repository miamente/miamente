# High Latency Troubleshooting Playbook

## 🚨 Severity: MEDIUM-HIGH

**Impact**: Poor user experience, potential user abandonment
**Response Time**: 20 minutes
**Resolution Time**: 2 hours

## 📋 Initial Assessment

### Symptoms

- [ ] Page load times > 5 seconds
- [ ] API response times > 2 seconds
- [ ] Database query timeouts
- [ ] Slow image loading
- [ ] Delayed user interactions
- [ ] High server response times

### Quick Checks

1. **Check Application Performance**

   ```bash
   # Check Firebase Functions performance
   firebase functions:log --only performance

   # Check hosting performance
   curl -w "@curl-format.txt" -o /dev/null -s https://miamente-prod.web.app
   ```

2. **Check Database Performance**

   ```bash
   # Check Firestore performance
   firebase firestore:indexes

   # Check for slow queries
   grep -i "slow\|timeout\|performance" /path/to/logs
   ```

3. **Check External Services**
   - Wompi API response times
   - SendGrid API performance
   - Jitsi service status
   - CDN performance

## 🔧 Immediate Response

### Step 1: Acknowledge Incident (10 minutes)

- [ ] Create incident ticket
- [ ] Notify team via Slack: `@channel High latency detected - investigating`
- [ ] Check performance monitoring dashboards
- [ ] Begin user communication

### Step 2: Assess Scope (20 minutes)

- [ ] Identify affected endpoints
- [ ] Check geographic impact
- [ ] Review performance metrics
- [ ] Determine root cause

### Step 3: Implement Mitigation (60 minutes)

- [ ] Enable performance optimizations
- [ ] Implement caching strategies
- [ ] Scale resources if needed
- [ ] Monitor improvement

## 🛠️ Troubleshooting Steps

### Application Performance Issues

1. **Check Function Performance**

   ```bash
   # Check function execution times
   firebase functions:log --only [FUNCTION_NAME] --limit 20

   # Check for memory issues
   grep -i "memory\|timeout\|error" /path/to/function-logs
   ```

2. **Analyze Code Performance**

   ```javascript
   // Check for inefficient queries
   const { performance } = require("perf_hooks");

   const start = performance.now();
   // Your code here
   const end = performance.now();
   console.log(`Execution time: ${end - start} milliseconds`);
   ```

3. **Check Database Queries**

   ```javascript
   // Optimize Firestore queries
   // Bad: Multiple queries
   const users = await db.collection("users").get();
   const professionals = await db.collection("professionals").get();

   // Good: Single query with proper indexing
   const appointments = await db
     .collection("appointments")
     .where("userId", "==", userId)
     .where("status", "==", "confirmed")
     .orderBy("date")
     .limit(10)
     .get();
   ```

### Database Performance Issues

1. **Check Index Usage**

   ```bash
   # List current indexes
   firebase firestore:indexes

   # Check for missing indexes
   firebase firestore:indexes --check
   ```

2. **Optimize Queries**

   ```javascript
   // Use composite indexes for complex queries
   const query = db
     .collection("appointments")
     .where("professionalId", "==", professionalId)
     .where("date", ">=", startDate)
     .where("date", "<=", endDate)
     .where("status", "==", "available")
     .orderBy("date")
     .orderBy("time");
   ```

3. **Implement Caching**

   ```javascript
   // Use Redis or in-memory caching
   const cache = new Map();

   async function getCachedData(key, fetchFunction) {
     if (cache.has(key)) {
       return cache.get(key);
     }

     const data = await fetchFunction();
     cache.set(key, data);
     return data;
   }
   ```

### External Service Issues

1. **Check API Response Times**

   ```bash
   # Test Wompi API
   curl -w "@curl-format.txt" -o /dev/null -s https://production.wompi.co/v1/transactions

   # Test SendGrid API
   curl -w "@curl-format.txt" -o /dev/null -s https://api.sendgrid.com/v3/mail/send
   ```

2. **Implement Timeout Handling**

   ```javascript
   // Set appropriate timeouts
   const axios = require("axios");

   const apiClient = axios.create({
     timeout: 10000, // 10 seconds
     retry: 3,
     retryDelay: 1000,
   });
   ```

3. **Add Circuit Breaker Pattern**

   ```javascript
   class CircuitBreaker {
     constructor(threshold = 5, timeout = 60000) {
       this.threshold = threshold;
       this.timeout = timeout;
       this.failureCount = 0;
       this.lastFailureTime = null;
       this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
     }

     async execute(fn) {
       if (this.state === "OPEN") {
         if (Date.now() - this.lastFailureTime > this.timeout) {
           this.state = "HALF_OPEN";
         } else {
           throw new Error("Circuit breaker is OPEN");
         }
       }

       try {
         const result = await fn();
         this.onSuccess();
         return result;
       } catch (error) {
         this.onFailure();
         throw error;
       }
     }
   }
   ```

### CDN and Static Assets

1. **Check CDN Performance**

   ```bash
   # Test CDN response times
   curl -w "@curl-format.txt" -o /dev/null -s https://cdn.miamente.com/assets/app.js

   # Check cache headers
   curl -I https://miamente-prod.web.app
   ```

2. **Optimize Static Assets**

   ```javascript
   // Enable compression
   const compression = require("compression");
   app.use(compression());

   // Set cache headers
   app.use(
     express.static("public", {
       maxAge: "1y",
       etag: true,
       lastModified: true,
     }),
   );
   ```

3. **Implement Image Optimization**

   ```javascript
   // Use WebP format for images
   const sharp = require("sharp");

   async function optimizeImage(input, output) {
     await sharp(input).webp({ quality: 80 }).resize(800, 600, { fit: "inside" }).toFile(output);
   }
   ```

## 🔄 Recovery Procedures

### Immediate Optimizations

1. **Enable Caching**

   ```javascript
   // Implement Redis caching
   const redis = require("redis");
   const client = redis.createClient();

   async function getCachedData(key, fetchFunction) {
     const cached = await client.get(key);
     if (cached) {
       return JSON.parse(cached);
     }

     const data = await fetchFunction();
     await client.setex(key, 3600, JSON.stringify(data)); // 1 hour cache
     return data;
   }
   ```

2. **Optimize Database Queries**

   ```javascript
   // Use batch operations
   const batch = db.batch();

   appointments.forEach((appointment) => {
     const ref = db.collection("appointments").doc();
     batch.set(ref, appointment);
   });

   await batch.commit();
   ```

3. **Implement Connection Pooling**

   ```javascript
   // Use connection pooling for external APIs
   const { Pool } = require("pg");

   const pool = new Pool({
     max: 20,
     idleTimeoutMillis: 30000,
     connectionTimeoutMillis: 2000,
   });
   ```

### Scaling Solutions

1. **Scale Firebase Functions**

   ```bash
   # Increase function memory
   firebase functions:config:set functions.memory=1GB

   # Deploy with increased resources
   firebase deploy --only functions
   ```

2. **Implement Load Balancing**

   ```javascript
   // Use load balancing for external APIs
   const endpoints = ["https://api1.wompi.co", "https://api2.wompi.co", "https://api3.wompi.co"];

   async function callWithLoadBalancing(data) {
     for (const endpoint of endpoints) {
       try {
         return await axios.post(`${endpoint}/v1/transactions`, data);
       } catch (error) {
         console.log(`Endpoint ${endpoint} failed, trying next...`);
       }
     }
     throw new Error("All endpoints failed");
   }
   ```

3. **Implement Database Sharding**
   ```javascript
   // Shard data by user ID
   function getShard(userId) {
     const hash = userId.split("").reduce((a, b) => {
       a = (a << 5) - a + b.charCodeAt(0);
       return a & a;
     }, 0);
     return Math.abs(hash) % 3; // 3 shards
   }
   ```

## 📊 Post-Incident Actions

### Immediate (Within 2 hours)

- [ ] Verify performance improvements
- [ ] Monitor response times
- [ ] Check user experience metrics
- [ ] Send resolution notification

### Short-term (Within 24 hours)

- [ ] Review performance metrics
- [ ] Identify optimization opportunities
- [ ] Implement additional improvements
- [ ] Update monitoring alerts

### Long-term (Within 1 week)

- [ ] Conduct performance review
- [ ] Implement performance testing
- [ ] Update architecture documentation
- [ ] Plan capacity scaling

## 🚨 Escalation Procedures

### Level 1: Development Team (0-60 minutes)

- Initial assessment and basic optimizations
- Code-level performance improvements
- Database query optimization

### Level 2: DevOps Team (60-120 minutes)

- Infrastructure scaling
- CDN optimization
- External service coordination

### Level 3: Management (120+ minutes)

- Business impact assessment
- Resource allocation decisions
- Architecture review

## 📞 Contact Information

### Internal Contacts

- **On-call Developer**: [Phone] [Email]
- **DevOps Engineer**: [Phone] [Email]
- **Performance Engineer**: [Phone] [Email]

### External Contacts

- **Firebase Support**: firebase-support@google.com
- **CDN Provider**: [CDN Provider Contact]
- **Hosting Provider**: [Hosting Provider Contact]

## 📋 Communication Templates

### User Communication

```
Subject: Performance Improvements - Service Update

We've identified and resolved performance issues that were affecting our service.
The application should now load faster and provide a better user experience.

We continuously monitor our performance and will continue to make improvements
to ensure the best possible experience for our users.

Thank you for your patience and for using Miamente.
```

### Team Communication

```
⚡ INCIDENT: High Latency Resolved
Status: Resolved
Impact: Slow page loads and API responses
Duration: [Duration]

Root Cause: [Root cause]
Resolution: [Resolution steps]

Performance Improvements:
- Page load time: [Before] → [After]
- API response time: [Before] → [After]
- Database query time: [Before] → [After]

Next Steps:
- Monitor performance metrics
- Implement additional optimizations
- Update performance monitoring
```

## 🔍 Monitoring & Alerts

### Key Metrics to Monitor

- Page load time
- API response time
- Database query time
- Function execution time
- CDN performance
- User experience metrics

### Alert Thresholds

- Page load time > 5 seconds
- API response time > 2 seconds
- Database query time > 1 second
- Function execution time > 10 seconds
- Error rate > 1%

### Dashboard Links

- [Firebase Console](https://console.firebase.google.com)
- [Performance Monitoring](https://monitoring.miamente.com)
- [CDN Dashboard](https://cdn.miamente.com)
- [Application Performance](https://apm.miamente.com)

## 🛡️ Prevention Measures

### Performance Testing

- [ ] Load testing before deployment
- [ ] Performance regression testing
- [ ] Database query optimization
- [ ] CDN configuration validation

### Monitoring Setup

- [ ] Real-time performance monitoring
- [ ] Automated performance alerts
- [ ] User experience tracking
- [ ] Capacity planning metrics

### Optimization Practices

- [ ] Code performance reviews
- [ ] Database query optimization
- [ ] Caching strategy implementation
- [ ] CDN optimization

---

**Last Updated**: [Current Date]
**Next Review**: [Next Review Date]
**Version**: 1.0.0
