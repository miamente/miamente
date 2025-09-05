"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== "default") __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupHeldSlots = cleanupHeldSlots;
exports.manualCleanupHeldSlots = manualCleanupHeldSlots;
require("./firebase-admin"); // Initialize Firebase Admin first
const admin = __importStar(require("firebase-admin"));
const v2_1 = require("firebase-functions/v2");
const db = admin.firestore();
/**
 * Cleanup job to release held slots that haven't been paid for within the timeout period
 * This runs every 5 minutes to check for held slots older than 15 minutes
 */
async function cleanupHeldSlots() {
  const HELD_TIMEOUT_MINUTES = 15;
  const timeoutDate = new Date(Date.now() - HELD_TIMEOUT_MINUTES * 60 * 1000);
  try {
    // Query for held slots older than the timeout
    const heldSlotsQuery = await db
      .collectionGroup("slots")
      .where("status", "==", "held")
      .where("updatedAt", "<", admin.firestore.Timestamp.fromDate(timeoutDate))
      .limit(100) // Process in batches
      .get();
    if (heldSlotsQuery.empty) {
      v2_1.logger.info("No held slots to cleanup");
      return;
    }
    v2_1.logger.info(`Found ${heldSlotsQuery.docs.length} held slots to cleanup`);
    // Use batch to update multiple slots
    const batch = db.batch();
    let cleanupCount = 0;
    for (const slotDoc of heldSlotsQuery.docs) {
      // Check if there's a corresponding appointment that's been paid
      const appointmentQuery = await db
        .collection("appointments")
        .where("slotId", "==", slotDoc.id)
        .where("paid", "==", true)
        .limit(1)
        .get();
      // Only release the slot if there's no paid appointment
      if (appointmentQuery.empty) {
        batch.update(slotDoc.ref, {
          status: "free",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        cleanupCount++;
        // Also cancel any pending appointments for this slot
        const pendingAppointmentsQuery = await db
          .collection("appointments")
          .where("slotId", "==", slotDoc.id)
          .where("status", "==", "pending_payment")
          .get();
        for (const appointmentDoc of pendingAppointmentsQuery.docs) {
          batch.update(appointmentDoc.ref, {
            status: "cancelled",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }
    }
    if (cleanupCount > 0) {
      await batch.commit();
      v2_1.logger.info(`Cleaned up ${cleanupCount} held slots`);
    }
  } catch (error) {
    v2_1.logger.error("Error in cleanup job:", error);
    throw error;
  }
}
/**
 * Manual cleanup function for testing or emergency use
 */
async function manualCleanupHeldSlots() {
  const HELD_TIMEOUT_MINUTES = 15;
  const timeoutDate = new Date(Date.now() - HELD_TIMEOUT_MINUTES * 60 * 1000);
  try {
    const heldSlotsQuery = await db
      .collectionGroup("slots")
      .where("status", "==", "held")
      .where("updatedAt", "<", admin.firestore.Timestamp.fromDate(timeoutDate))
      .get();
    let cleaned = 0;
    for (const slotDoc of heldSlotsQuery.docs) {
      const appointmentQuery = await db
        .collection("appointments")
        .where("slotId", "==", slotDoc.id)
        .where("paid", "==", true)
        .limit(1)
        .get();
      if (appointmentQuery.empty) {
        await slotDoc.ref.update({
          status: "free",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        cleaned++;
      }
    }
    return { cleaned };
  } catch (error) {
    v2_1.logger.error("Error in manual cleanup:", error);
    throw error;
  }
}
