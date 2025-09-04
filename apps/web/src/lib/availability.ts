import {
  collection,
  doc,
  setDoc,
  getDocs,
  query as fsQuery,
  where,
  orderBy,
  limit as fsLimit,
  startAfter as fsStartAfter,
  deleteDoc,
  writeBatch,
  type QueryDocumentSnapshot,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";

import { getFirebaseFirestore } from "./firebase";
import { bogotaToUtc, createBogotaDate, parseTimeToMinutes, minutesToTimeString } from "./timezone";

export type SlotStatus = "free" | "held" | "booked";

export interface AvailabilitySlot {
  start: Date; // UTC
  end: Date; // UTC
  status: SlotStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface SlotGenerationParams {
  startDate: Date; // Bogotá timezone
  endDate: Date; // Bogotá timezone
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  durationMinutes: number;
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
}

export interface AvailabilityQueryParams {
  proId: string;
  startDate?: Date; // UTC
  endDate?: Date; // UTC
  status?: SlotStatus;
  limit?: number;
  startAfterSnapshot?: QueryDocumentSnapshot<DocumentData> | null;
}

export interface AvailabilityQueryResult {
  slots: Array<AvailabilitySlot & { id: string }>;
  lastSnapshot: QueryDocumentSnapshot<DocumentData> | null;
}

/**
 * Generate time slots for a professional
 */
export async function generateSlots(
  proId: string,
  params: SlotGenerationParams,
): Promise<{ created: number; skipped: number }> {
  const firestore = getFirebaseFirestore();
  const slotsRef = collection(firestore, "availability", proId, "slots");

  // Convert Bogotá times to UTC
  const startTimeMinutes = parseTimeToMinutes(params.startTime);
  const endTimeMinutes = parseTimeToMinutes(params.endTime);

  // Get existing slots to check for overlaps
  const existingSlots = await getExistingSlots(proId, params.startDate, params.endDate);

  const batch = writeBatch(firestore);
  let created = 0;
  let skipped = 0;

  // Generate slots for each day in the range
  const currentDate = new Date(params.startDate);
  const endDate = new Date(params.endDate);

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();

    // Check if this day is in the allowed days
    if (params.daysOfWeek.includes(dayOfWeek)) {
      // Generate slots for this day
      let currentTimeMinutes = startTimeMinutes;

      while (currentTimeMinutes + params.durationMinutes <= endTimeMinutes) {
        const slotStart = createBogotaDate(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate(),
          Math.floor(currentTimeMinutes / 60),
          currentTimeMinutes % 60,
        );

        const slotEnd = new Date(slotStart.getTime() + params.durationMinutes * 60 * 1000);

        // Check for overlaps with existing slots
        const hasOverlap = existingSlots.some((existing) => {
          return (
            (slotStart < existing.end && slotEnd > existing.start) ||
            (existing.start < slotEnd && existing.end > slotStart)
          );
        });

        if (!hasOverlap) {
          const slotId = `${currentDate.toISOString().split("T")[0]}_${minutesToTimeString(currentTimeMinutes)}`;
          const slotRef = doc(slotsRef, slotId);

          const slot: AvailabilitySlot = {
            start: slotStart,
            end: slotEnd,
            status: "free",
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          batch.set(slotRef, {
            ...slot,
            start: slot.start,
            end: slot.end,
            createdAt: slot.createdAt,
            updatedAt: slot.updatedAt,
          });

          created++;
        } else {
          skipped++;
        }

        currentTimeMinutes += params.durationMinutes;
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  await batch.commit();
  return { created, skipped };
}

/**
 * Get existing slots for overlap checking
 */
async function getExistingSlots(
  proId: string,
  startDate: Date,
  endDate: Date,
): Promise<AvailabilitySlot[]> {
  const firestore = getFirebaseFirestore();
  const slotsRef = collection(firestore, "availability", proId, "slots");

  const startUtc = bogotaToUtc(startDate);
  const endUtc = bogotaToUtc(endDate);

  const q = fsQuery(
    slotsRef,
    where("start", ">=", startUtc),
    where("start", "<=", endUtc),
    orderBy("start", "asc"),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      start: data.start.toDate(),
      end: data.end.toDate(),
      status: data.status,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  });
}

/**
 * Query availability slots
 */
export async function queryAvailabilitySlots(
  params: AvailabilityQueryParams,
): Promise<AvailabilityQueryResult> {
  const { proId, startDate, endDate, status, limit = 50, startAfterSnapshot } = params;
  const firestore = getFirebaseFirestore();
  const slotsRef = collection(firestore, "availability", proId, "slots");

  const constraints: QueryConstraint[] = [];

  if (startDate) {
    constraints.push(where("start", ">=", startDate));
  }
  if (endDate) {
    constraints.push(where("start", "<=", endDate));
  }
  if (status) {
    constraints.push(where("status", "==", status));
  }

  constraints.push(orderBy("start", "asc"));
  constraints.push(fsLimit(limit));

  if (startAfterSnapshot) {
    constraints.push(fsStartAfter(startAfterSnapshot));
  }

  const q = fsQuery(slotsRef, ...constraints);
  const snapshot = await getDocs(q);

  const slots = snapshot.docs.map((doc) => {
    const data = doc.data() as DocumentData;
    return {
      id: doc.id,
      start: data.start.toDate(),
      end: data.end.toDate(),
      status: data.status as SlotStatus,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    };
  });

  const lastSnapshot = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
  return { slots, lastSnapshot };
}

/**
 * Get next 14 days of free slots for a professional
 */
export async function getNext14DaysFreeSlots(
  proId: string,
): Promise<Array<AvailabilitySlot & { id: string }>> {
  const now = new Date();
  const endDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

  const result = await queryAvailabilitySlots({
    proId,
    startDate: now,
    endDate,
    status: "free",
    limit: 100, // Should be enough for 14 days
  });

  return result.slots;
}

/**
 * Update slot status
 */
export async function updateSlotStatus(
  proId: string,
  slotId: string,
  status: SlotStatus,
): Promise<void> {
  const firestore = getFirebaseFirestore();
  const slotRef = doc(firestore, "availability", proId, "slots", slotId);

  await setDoc(
    slotRef,
    {
      status,
      updatedAt: new Date(),
    },
    { merge: true },
  );
}

/**
 * Delete a slot
 */
export async function deleteSlot(proId: string, slotId: string): Promise<void> {
  const firestore = getFirebaseFirestore();
  const slotRef = doc(firestore, "availability", proId, "slots", slotId);
  await deleteDoc(slotRef);
}
