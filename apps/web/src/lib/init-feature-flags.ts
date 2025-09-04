/**
 * Initialize default feature flags in Firestore
 * This script should be run once to set up the initial feature flags
 */

import { getFirebaseFirestore } from './firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

const DEFAULT_FEATURE_FLAGS = [
  {
    key: 'payments_enabled',
    name: 'Sistema de Pagos',
    description: 'Habilita el sistema de pagos en la plataforma',
    enabled: false,
  },
  {
    key: 'payments_mock_auto_approve',
    name: 'Auto-aprobación de Pagos Mock',
    description: 'Aprobar automáticamente los pagos de prueba',
    enabled: true,
  },
  {
    key: 'user_registration_enabled',
    name: 'Registro de Usuarios',
    description: 'Permitir el registro de nuevos usuarios',
    enabled: true,
  },
  {
    key: 'professional_verification_enabled',
    name: 'Verificación de Profesionales',
    description: 'Sistema de verificación para profesionales',
    enabled: true,
  },
  {
    key: 'admin_dashboard_enabled',
    name: 'Panel de Administración',
    description: 'Habilitar el panel de administración',
    enabled: true,
  },
  {
    key: 'email_notifications_enabled',
    name: 'Notificaciones por Email',
    description: 'Enviar notificaciones por correo electrónico',
    enabled: true,
  },
  {
    key: 'wompi_integration_enabled',
    name: 'Integración Wompi',
    description: 'Habilitar integración con Wompi para pagos',
    enabled: false,
  },
  {
    key: 'stripe_integration_enabled',
    name: 'Integración Stripe',
    description: 'Habilitar integración con Stripe para pagos',
    enabled: false,
  },
  {
    key: 'jitsi_integration_enabled',
    name: 'Integración Jitsi',
    description: 'Habilitar integración con Jitsi para videollamadas',
    enabled: true,
  },
  {
    key: 'debug_mode_enabled',
    name: 'Modo Debug',
    description: 'Habilitar modo de depuración',
    enabled: false,
  },
];

export async function initializeFeatureFlags(): Promise<void> {
  try {
    const db = getFirebaseFirestore();
    const featureFlagsRef = collection(db, 'feature_flags');
    
    // Check if feature flags already exist
    const existingFlags = await getDocs(featureFlagsRef);
    
    if (existingFlags.empty) {
      console.log('Initializing feature flags...');
      
      const now = new Date().toISOString();
      
      for (const flag of DEFAULT_FEATURE_FLAGS) {
        await addDoc(featureFlagsRef, {
          ...flag,
          createdAt: now,
          updatedAt: now,
        });
      }
      
      console.log('Feature flags initialized successfully!');
    } else {
      console.log('Feature flags already exist, skipping initialization.');
    }
  } catch (error) {
    console.error('Error initializing feature flags:', error);
    throw error;
  }
}

// Function to check if a specific feature flag exists
export async function featureFlagExists(key: string): Promise<boolean> {
  try {
    const db = getFirebaseFirestore();
    const featureFlagsRef = collection(db, 'feature_flags');
    const q = query(featureFlagsRef, where('key', '==', key));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking feature flag existence:', error);
    return false;
  }
}
