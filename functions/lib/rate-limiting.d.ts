interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
    keyPrefix: string;
}
/**
 * Rate limiting configurations for different operations
 */
export declare const RATE_LIMITS: {
    readonly APPOINTMENT_CREATION: {
        readonly maxRequests: 5;
        readonly windowMs: number;
        readonly keyPrefix: "appointment_creation";
    };
    readonly EMAIL_SENDING: {
        readonly maxRequests: 10;
        readonly windowMs: number;
        readonly keyPrefix: "email_sending";
    };
    readonly PROFILE_UPDATES: {
        readonly maxRequests: 20;
        readonly windowMs: number;
        readonly keyPrefix: "profile_updates";
    };
    readonly SLOT_CREATION: {
        readonly maxRequests: 50;
        readonly windowMs: number;
        readonly keyPrefix: "slot_creation";
    };
};
/**
 * Check if a request is within rate limits
 */
export declare function checkRateLimit(userId: string, config: RateLimitConfig, ipAddress?: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
}>;
/**
 * Get rate limit status for a user
 */
export declare function getRateLimitStatus(userId: string, config: RateLimitConfig, ipAddress?: string): Promise<{
    count: number;
    remaining: number;
    resetTime: number;
}>;
/**
 * Clean up old rate limit entries
 */
export declare function cleanupRateLimits(): Promise<void>;
/**
 * Extract IP address from request
 */
export declare function getClientIP(request: {
    headers: Record<string, string>;
    connection?: {
        remoteAddress?: string;
    };
    socket?: {
        remoteAddress?: string;
    };
}): string;
export {};
//# sourceMappingURL=rate-limiting.d.ts.map