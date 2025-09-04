/**
 * Feature Flags Configuration
 * 
 * Centralized feature flag management for the Miamente platform.
 * In production, these would be managed through Firebase Remote Config
 * or a dedicated feature flag service.
 */

export interface FeatureFlags {
  // Payment System
  payments_enabled: boolean;
  payments_mock_auto_approve: boolean;
  
  // User Features
  user_registration_enabled: boolean;
  professional_verification_enabled: boolean;
  
  // Admin Features
  admin_dashboard_enabled: boolean;
  admin_analytics_enabled: boolean;
  
  // Communication
  email_notifications_enabled: boolean;
  sms_notifications_enabled: boolean;
  
  // Integrations
  wompi_integration_enabled: boolean;
  stripe_integration_enabled: boolean;
  jitsi_integration_enabled: boolean;
  
  // UI/UX
  dark_mode_enabled: boolean;
  advanced_search_enabled: boolean;
  
  // Development
  debug_mode_enabled: boolean;
  test_data_enabled: boolean;
}

/**
 * Default feature flags configuration
 * These are the fallback values when the remote config is not available
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  // Payment System
  payments_enabled: false,
  payments_mock_auto_approve: true,
  
  // User Features
  user_registration_enabled: true,
  professional_verification_enabled: true,
  
  // Admin Features
  admin_dashboard_enabled: true,
  admin_analytics_enabled: true,
  
  // Communication
  email_notifications_enabled: true,
  sms_notifications_enabled: false,
  
  // Integrations
  wompi_integration_enabled: false,
  stripe_integration_enabled: false,
  jitsi_integration_enabled: true,
  
  // UI/UX
  dark_mode_enabled: false,
  advanced_search_enabled: false,
  
  // Development
  debug_mode_enabled: false,
  test_data_enabled: false,
};

/**
 * Feature Flag Manager
 * Handles fetching and caching of feature flags
 */
export class FeatureFlagManager {
  private static instance: FeatureFlagManager | null = null;
  private flags: FeatureFlags = DEFAULT_FEATURE_FLAGS;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): FeatureFlagManager {
    if (!this.instance) {
      this.instance = new FeatureFlagManager();
    }
    return this.instance;
  }

  /**
   * Get a feature flag value
   * @param flagName - The name of the feature flag
   * @returns Promise with the flag value
   */
  async getFlag<K extends keyof FeatureFlags>(flagName: K): Promise<FeatureFlags[K]> {
    await this.ensureFlagsLoaded();
    return this.flags[flagName];
  }

  /**
   * Get multiple feature flags
   * @param flagNames - Array of flag names to get
   * @returns Promise with the flag values
   */
  async getFlags<K extends keyof FeatureFlags>(
    flagNames: K[]
  ): Promise<Pick<FeatureFlags, K>> {
    await this.ensureFlagsLoaded();
    
    const result = {} as Pick<FeatureFlags, K>;
    flagNames.forEach(flagName => {
      result[flagName] = this.flags[flagName];
    });
    
    return result;
  }

  /**
   * Get all feature flags
   * @returns Promise with all flag values
   */
  async getAllFlags(): Promise<FeatureFlags> {
    await this.ensureFlagsLoaded();
    return { ...this.flags };
  }

  /**
   * Check if flags need to be refreshed
   */
  private shouldRefreshFlags(): boolean {
    return Date.now() - this.lastFetch > this.CACHE_DURATION;
  }

  /**
   * Ensure flags are loaded and up to date
   */
  private async ensureFlagsLoaded(): Promise<void> {
    if (this.shouldRefreshFlags()) {
      await this.loadFlags();
    }
  }

  /**
   * Load feature flags from remote source
   */
  private async loadFlags(): Promise<void> {
    try {
      // In a real implementation, this would fetch from Firebase Remote Config
      // or your feature flag service
      console.log('[FeatureFlagManager] Loading feature flags...');
      
      // For now, we'll use the default flags
      // TODO: Implement actual remote config fetching
      /*
      const remoteConfig = getRemoteConfig();
      await fetchAndActivate(remoteConfig);
      
      const flags: FeatureFlags = {
        payments_enabled: remoteConfig.getBoolean('payments_enabled'),
        payments_mock_auto_approve: remoteConfig.getBoolean('payments_mock_auto_approve'),
        // ... other flags
      };
      
      this.flags = flags;
      */
      
      this.flags = DEFAULT_FEATURE_FLAGS;
      this.lastFetch = Date.now();
      
      console.log('[FeatureFlagManager] Feature flags loaded:', this.flags);
    } catch (error) {
      console.error('[FeatureFlagManager] Error loading feature flags:', error);
      // Fallback to default flags
      this.flags = DEFAULT_FEATURE_FLAGS;
      this.lastFetch = Date.now();
    }
  }

  /**
   * Force refresh of feature flags
   */
  async refreshFlags(): Promise<void> {
    this.lastFetch = 0;
    await this.loadFlags();
  }

  /**
   * Set feature flags (for testing purposes)
   */
  setFlags(flags: Partial<FeatureFlags>): void {
    this.flags = { ...this.flags, ...flags };
    this.lastFetch = Date.now();
  }

  /**
   * Reset to default flags
   */
  resetToDefaults(): void {
    this.flags = DEFAULT_FEATURE_FLAGS;
    this.lastFetch = Date.now();
  }
}

/**
 * Convenience functions for common feature flag checks
 */

/**
 * Check if payments are enabled
 */
export async function isPaymentsEnabled(): Promise<boolean> {
  const manager = FeatureFlagManager.getInstance();
  return await manager.getFlag('payments_enabled');
}

/**
 * Check if mock payments should auto-approve
 */
export async function isMockAutoApproveEnabled(): Promise<boolean> {
  const manager = FeatureFlagManager.getInstance();
  return await manager.getFlag('payments_mock_auto_approve');
}

/**
 * Check if user registration is enabled
 */
export async function isUserRegistrationEnabled(): Promise<boolean> {
  const manager = FeatureFlagManager.getInstance();
  return await manager.getFlag('user_registration_enabled');
}

/**
 * Check if professional verification is enabled
 */
export async function isProfessionalVerificationEnabled(): Promise<boolean> {
  const manager = FeatureFlagManager.getInstance();
  return await manager.getFlag('professional_verification_enabled');
}

/**
 * Check if admin dashboard is enabled
 */
export async function isAdminDashboardEnabled(): Promise<boolean> {
  const manager = FeatureFlagManager.getInstance();
  return await manager.getFlag('admin_dashboard_enabled');
}

/**
 * Check if email notifications are enabled
 */
export async function isEmailNotificationsEnabled(): Promise<boolean> {
  const manager = FeatureFlagManager.getInstance();
  return await manager.getFlag('email_notifications_enabled');
}

/**
 * Check if Wompi integration is enabled
 */
export async function isWompiIntegrationEnabled(): Promise<boolean> {
  const manager = FeatureFlagManager.getInstance();
  return await manager.getFlag('wompi_integration_enabled');
}

/**
 * Check if Stripe integration is enabled
 */
export async function isStripeIntegrationEnabled(): Promise<boolean> {
  const manager = FeatureFlagManager.getInstance();
  return await manager.getFlag('stripe_integration_enabled');
}

/**
 * Check if Jitsi integration is enabled
 */
export async function isJitsiIntegrationEnabled(): Promise<boolean> {
  const manager = FeatureFlagManager.getInstance();
  return await manager.getFlag('jitsi_integration_enabled');
}

/**
 * Check if debug mode is enabled
 */
export async function isDebugModeEnabled(): Promise<boolean> {
  const manager = FeatureFlagManager.getInstance();
  return await manager.getFlag('debug_mode_enabled');
}

/**
 * React hook for feature flags
 * Usage: const isEnabled = useFeatureFlag('payments_enabled');
 */
export function useFeatureFlag<K extends keyof FeatureFlags>(
  flagName: K
): FeatureFlags[K] | null {
  // This would be implemented as a React hook
  // For now, we'll return null to indicate it's not implemented
  console.warn('useFeatureFlag hook not implemented yet');
  return null;
}

/**
 * React hook for multiple feature flags
 * Usage: const flags = useFeatureFlags(['payments_enabled', 'debug_mode_enabled']);
 */
export function useFeatureFlags<K extends keyof FeatureFlags>(
  flagNames: K[]
): Pick<FeatureFlags, K> | null {
  // This would be implemented as a React hook
  // For now, we'll return null to indicate it's not implemented
  console.warn('useFeatureFlags hook not implemented yet');
  return null;
}

/**
 * Feature Flag Database Types
 */
export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  enabled: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeatureFlagRequest {
  key: string;
  name: string;
  description: string;
  enabled?: boolean;
}

export interface FeatureFlagResponse {
  success: boolean;
  data?: FeatureFlag;
  error?: string;
}

/**
 * Admin Functions for Feature Flag Management
 */

/**
 * Get all feature flags from Firestore
 */
export async function getFeatureFlags(): Promise<FeatureFlag[]> {
  try {
    const { getFirebaseFirestore } = await import('@/lib/firebase');
    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    
    const db = getFirebaseFirestore();
    const featureFlagsRef = collection(db, 'feature_flags');
    const q = query(featureFlagsRef, orderBy('createdAt', 'desc'));
    
    const snapshot = await getDocs(q);
    const flags: FeatureFlag[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      flags.push({
        id: doc.id,
        key: data.key,
        name: data.name,
        enabled: data.enabled,
        description: data.description,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    });
    
    return flags;
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    throw new Error('Failed to fetch feature flags');
  }
}

/**
 * Create a new feature flag
 */
export async function createFeatureFlag(request: CreateFeatureFlagRequest): Promise<FeatureFlagResponse> {
  try {
    const { getFirebaseFirestore } = await import('@/lib/firebase');
    const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
    
    const db = getFirebaseFirestore();
    const featureFlagsRef = collection(db, 'feature_flags');
    
    const now = new Date().toISOString();
    const newFlag = {
      key: request.key,
      name: request.name,
      description: request.description,
      enabled: request.enabled ?? false,
      createdAt: now,
      updatedAt: now,
    };
    
    const docRef = await addDoc(featureFlagsRef, newFlag);
    
    return {
      success: true,
      data: {
        id: docRef.id,
        ...newFlag,
      },
    };
  } catch (error) {
    console.error('Error creating feature flag:', error);
    return {
      success: false,
      error: 'Failed to create feature flag',
    };
  }
}

/**
 * Toggle a feature flag
 */
export async function toggleFeatureFlag(flagId: string): Promise<FeatureFlagResponse> {
  try {
    const { getFirebaseFirestore } = await import('@/lib/firebase');
    const { doc, updateDoc, getDoc } = await import('firebase/firestore');
    
    const db = getFirebaseFirestore();
    const flagRef = doc(db, 'feature_flags', flagId);
    
    // Get current state
    const flagDoc = await getDoc(flagRef);
    if (!flagDoc.exists()) {
      return {
        success: false,
        error: 'Feature flag not found',
      };
    }
    
    const currentData = flagDoc.data();
    const newEnabled = !currentData.enabled;
    
    await updateDoc(flagRef, {
      enabled: newEnabled,
      updatedAt: new Date().toISOString(),
    });
    
    return {
      success: true,
      data: {
        id: flagId,
        key: currentData.key,
        name: currentData.name,
        enabled: newEnabled,
        description: currentData.description,
        createdAt: currentData.createdAt,
        updatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error toggling feature flag:', error);
    return {
      success: false,
      error: 'Failed to toggle feature flag',
    };
  }
}

/**
 * Update a feature flag
 */
export async function updateFeatureFlag(flagId: string, updates: Partial<CreateFeatureFlagRequest>): Promise<FeatureFlagResponse> {
  try {
    const { getFirebaseFirestore } = await import('@/lib/firebase');
    const { doc, updateDoc } = await import('firebase/firestore');
    
    const db = getFirebaseFirestore();
    const flagRef = doc(db, 'feature_flags', flagId);
    
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await updateDoc(flagRef, updateData);
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error updating feature flag:', error);
    return {
      success: false,
      error: 'Failed to update feature flag',
    };
  }
}

/**
 * Delete a feature flag
 */
export async function deleteFeatureFlag(flagId: string): Promise<FeatureFlagResponse> {
  try {
    const { getFirebaseFirestore } = await import('@/lib/firebase');
    const { doc, deleteDoc } = await import('firebase/firestore');
    
    const db = getFirebaseFirestore();
    const flagRef = doc(db, 'feature_flags', flagId);
    
    await deleteDoc(flagRef);
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error deleting feature flag:', error);
    return {
      success: false,
      error: 'Failed to delete feature flag',
    };
  }
}