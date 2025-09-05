import "./firebase-admin";
/**
 * Cleanup job to release held slots that haven't been paid for within the timeout period
 * This runs every 5 minutes to check for held slots older than 15 minutes
 */
export declare function cleanupHeldSlots(): Promise<void>;
/**
 * Manual cleanup function for testing or emergency use
 */
export declare function manualCleanupHeldSlots(): Promise<{
    cleaned: number;
}>;
//# sourceMappingURL=cleanup.d.ts.map