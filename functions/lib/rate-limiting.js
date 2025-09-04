"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMITS = void 0;
exports.checkRateLimit = checkRateLimit;
exports.getRateLimitStatus = getRateLimitStatus;
exports.cleanupRateLimits = cleanupRateLimits;
exports.getClientIP = getClientIP;
const firestore_1 = require("firebase-admin/firestore");
/**
 * Rate limiting configurations for different operations
 */
exports.RATE_LIMITS = {
    APPOINTMENT_CREATION: {
        maxRequests: 5,
        windowMs: 60 * 60 * 1000, // 1 hour
        keyPrefix: "appointment_creation",
    },
    EMAIL_SENDING: {
        maxRequests: 10,
        windowMs: 60 * 60 * 1000, // 1 hour
        keyPrefix: "email_sending",
    },
    PROFILE_UPDATES: {
        maxRequests: 20,
        windowMs: 60 * 60 * 1000, // 1 hour
        keyPrefix: "profile_updates",
    },
    SLOT_CREATION: {
        maxRequests: 50,
        windowMs: 60 * 60 * 1000, // 1 hour
        keyPrefix: "slot_creation",
    },
};
/**
 * Check if a request is within rate limits
 */
async function checkRateLimit(userId, config, ipAddress) {
    const firestore = (0, firestore_1.getFirestore)();
    const now = Date.now();
    const windowStart = Math.floor(now / config.windowMs) * config.windowMs;
    // Use IP address as fallback if userId is not available
    const key = userId || ipAddress || "anonymous";
    const rateLimitKey = `${config.keyPrefix}:${key}`;
    const rateLimitRef = firestore.collection("rate_limits").doc(rateLimitKey);
    try {
        const doc = await rateLimitRef.get();
        if (!doc.exists) {
            // First request in this window
            await rateLimitRef.set({
                count: 1,
                windowStart,
                lastRequest: now,
            });
            return {
                allowed: true,
                remaining: config.maxRequests - 1,
                resetTime: windowStart + config.windowMs,
            };
        }
        const data = doc.data();
        // Check if we're in a new window
        if (data.windowStart < windowStart) {
            // New window, reset counter
            await rateLimitRef.update({
                count: 1,
                windowStart,
                lastRequest: now,
            });
            return {
                allowed: true,
                remaining: config.maxRequests - 1,
                resetTime: windowStart + config.windowMs,
            };
        }
        // Check if within limits
        if (data.count >= config.maxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: windowStart + config.windowMs,
            };
        }
        // Increment counter
        await rateLimitRef.update({
            count: firestore_1.FieldValue.increment(1),
            lastRequest: now,
        });
        return {
            allowed: true,
            remaining: config.maxRequests - data.count - 1,
            resetTime: windowStart + config.windowMs,
        };
    }
    catch (error) {
        console.error("Rate limit check failed:", error);
        // On error, allow the request but log it
        return {
            allowed: true,
            remaining: config.maxRequests,
            resetTime: now + config.windowMs,
        };
    }
}
/**
 * Get rate limit status for a user
 */
async function getRateLimitStatus(userId, config, ipAddress) {
    const firestore = (0, firestore_1.getFirestore)();
    const now = Date.now();
    const windowStart = Math.floor(now / config.windowMs) * config.windowMs;
    const key = userId || ipAddress || "anonymous";
    const rateLimitKey = `${config.keyPrefix}:${key}`;
    const rateLimitRef = firestore.collection("rate_limits").doc(rateLimitKey);
    try {
        const doc = await rateLimitRef.get();
        if (!doc.exists) {
            return {
                count: 0,
                remaining: config.maxRequests,
                resetTime: windowStart + config.windowMs,
            };
        }
        const data = doc.data();
        // Check if we're in a new window
        if (data.windowStart < windowStart) {
            return {
                count: 0,
                remaining: config.maxRequests,
                resetTime: windowStart + config.windowMs,
            };
        }
        return {
            count: data.count,
            remaining: Math.max(0, config.maxRequests - data.count),
            resetTime: windowStart + config.windowMs,
        };
    }
    catch (error) {
        console.error("Rate limit status check failed:", error);
        return {
            count: 0,
            remaining: config.maxRequests,
            resetTime: now + config.windowMs,
        };
    }
}
/**
 * Clean up old rate limit entries
 */
async function cleanupRateLimits() {
    const firestore = (0, firestore_1.getFirestore)();
    const now = Date.now();
    const cutoffTime = now - 24 * 60 * 60 * 1000; // 24 hours ago
    try {
        const rateLimitsRef = firestore.collection("rate_limits");
        const snapshot = await rateLimitsRef.where("lastRequest", "<", cutoffTime).get();
        const batch = firestore.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`Cleaned up ${snapshot.size} old rate limit entries`);
    }
    catch (error) {
        console.error("Rate limit cleanup failed:", error);
    }
}
/**
 * Extract IP address from request
 */
function getClientIP(request) {
    const forwarded = request.headers["x-forwarded-for"];
    const realIP = request.headers["x-real-ip"];
    const remoteAddress = request.connection?.remoteAddress || request.socket?.remoteAddress;
    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }
    if (realIP) {
        return realIP;
    }
    if (remoteAddress) {
        return remoteAddress.replace(/^::ffff:/, ""); // Remove IPv6 prefix
    }
    return "unknown";
}
