import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

import { getFirebaseFirestore } from "./firebase";

export interface FeatureFlag {
  id: string;
  key: string;
  enabled: boolean;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFeatureFlagRequest {
  key: string;
  enabled: boolean;
  description: string;
}

/**
 * Get all feature flags
 */
export async function getFeatureFlags(): Promise<FeatureFlag[]> {
  const firestore = getFirebaseFirestore();

  try {
    const flagsSnapshot = await getDocs(collection(firestore, "feature_flags"));

    return flagsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        key: data.key,
        enabled: data.enabled,
        description: data.description,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    });
  } catch (error) {
    console.error("Error fetching feature flags:", error);
    throw new Error("Failed to fetch feature flags");
  }
}

/**
 * Get a specific feature flag by key
 */
export async function getFeatureFlag(key: string): Promise<FeatureFlag | null> {
  const firestore = getFirebaseFirestore();

  try {
    const flagQuery = query(collection(firestore, "feature_flags"), where("key", "==", key));
    const flagSnapshot = await getDocs(flagQuery);

    if (flagSnapshot.empty) {
      return null;
    }

    const doc = flagSnapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      key: data.key,
      enabled: data.enabled,
      description: data.description,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  } catch (error) {
    console.error("Error fetching feature flag:", error);
    throw new Error("Failed to fetch feature flag");
  }
}

/**
 * Check if a feature flag is enabled
 */
export async function isFeatureEnabled(key: string): Promise<boolean> {
  try {
    const flag = await getFeatureFlag(key);
    return flag?.enabled || false;
  } catch (error) {
    console.error("Error checking feature flag:", error);
    return false; // Default to disabled if there's an error
  }
}

/**
 * Create a new feature flag
 */
export async function createFeatureFlag(
  flagData: CreateFeatureFlagRequest,
): Promise<{ success: boolean; flagId?: string; error?: string }> {
  const firestore = getFirebaseFirestore();

  try {
    // Check if flag with this key already exists
    const existingFlag = await getFeatureFlag(flagData.key);
    if (existingFlag) {
      return {
        success: false,
        error: "A feature flag with this key already exists",
      };
    }

    const flagRef = doc(collection(firestore, "feature_flags"));
    const now = new Date();

    await setDoc(flagRef, {
      key: flagData.key,
      enabled: flagData.enabled,
      description: flagData.description,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      flagId: flagRef.id,
    };
  } catch (error) {
    console.error("Error creating feature flag:", error);
    return {
      success: false,
      error: "Failed to create feature flag",
    };
  }
}

/**
 * Update a feature flag
 */
export async function updateFeatureFlag(
  flagId: string,
  updates: Partial<Pick<FeatureFlag, "enabled" | "description">>,
): Promise<{ success: boolean; error?: string }> {
  const firestore = getFirebaseFirestore();

  try {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (updates.enabled !== undefined) {
      updateData.enabled = updates.enabled;
    }

    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }

    await updateDoc(doc(firestore, "feature_flags", flagId), updateData);

    return { success: true };
  } catch (error) {
    console.error("Error updating feature flag:", error);
    return {
      success: false,
      error: "Failed to update feature flag",
    };
  }
}

/**
 * Toggle a feature flag
 */
export async function toggleFeatureFlag(
  flagId: string,
): Promise<{ success: boolean; error?: string }> {
  const firestore = getFirebaseFirestore();

  try {
    const flagDoc = await getDoc(doc(firestore, "feature_flags", flagId));

    if (!flagDoc.exists()) {
      return {
        success: false,
        error: "Feature flag not found",
      };
    }

    const currentEnabled = flagDoc.data()?.enabled || false;

    await updateDoc(doc(firestore, "feature_flags", flagId), {
      enabled: !currentEnabled,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error toggling feature flag:", error);
    return {
      success: false,
      error: "Failed to toggle feature flag",
    };
  }
}
