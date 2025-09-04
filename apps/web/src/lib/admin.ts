import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type QueryConstraint,
} from "firebase/firestore";

import { getFirebaseFirestore } from "./firebase";

export interface AdminMetrics {
  totalUsers: number;
  newUsers7Days: number;
  newUsers30Days: number;
  verifiedProfessionals: number;
  totalProfessionals: number;
  confirmedAppointmentsToday: number;
  totalAppointmentsToday: number;
  paymentConversionRate: number;
}

export interface EventLogEntry {
  id: string;
  eventType: string;
  data: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
}

export interface ProfessionalSummary {
  id: string;
  fullName: string;
  email: string;
  specialty: string;
  isVerified: boolean;
  createdAt: Date;
  appointmentCount: number;
  averageRating: number;
}

export interface AppointmentSummary {
  id: string;
  userId: string;
  proId: string;
  start: Date;
  end: Date;
  status: string;
  paid: boolean;
  userFullName?: string;
  proFullName?: string;
  proSpecialty?: string;
}

/**
 * Get admin dashboard metrics
 */
export async function getAdminMetrics(): Promise<AdminMetrics> {
  const firestore = getFirebaseFirestore();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  try {
    // Get user counts
    const usersSnapshot = await getDocs(collection(firestore, "users"));
    const totalUsers = usersSnapshot.size;

    const newUsers7DaysQuery = query(
      collection(firestore, "users"),
      where("createdAt", ">=", sevenDaysAgo),
    );
    const newUsers7DaysSnapshot = await getDocs(newUsers7DaysQuery);
    const newUsers7Days = newUsers7DaysSnapshot.size;

    const newUsers30DaysQuery = query(
      collection(firestore, "users"),
      where("createdAt", ">=", thirtyDaysAgo),
    );
    const newUsers30DaysSnapshot = await getDocs(newUsers30DaysQuery);
    const newUsers30Days = newUsers30DaysSnapshot.size;

    // Get professional counts
    const professionalsQuery = query(collection(firestore, "users"), where("role", "==", "pro"));
    const professionalsSnapshot = await getDocs(professionalsQuery);
    const totalProfessionals = professionalsSnapshot.size;

    const verifiedProfessionalsQuery = query(
      collection(firestore, "users"),
      where("role", "==", "pro"),
      where("isVerified", "==", true),
    );
    const verifiedProfessionalsSnapshot = await getDocs(verifiedProfessionalsQuery);
    const verifiedProfessionals = verifiedProfessionalsSnapshot.size;

    // Get appointment counts for today
    const appointmentsTodayQuery = query(
      collection(firestore, "appointments"),
      where("start", ">=", todayStart),
      where("start", "<", todayEnd),
    );
    const appointmentsTodaySnapshot = await getDocs(appointmentsTodayQuery);
    const totalAppointmentsToday = appointmentsTodaySnapshot.size;

    const confirmedAppointmentsTodayQuery = query(
      collection(firestore, "appointments"),
      where("start", ">=", todayStart),
      where("start", "<", todayEnd),
      where("status", "in", ["paid", "confirmed"]),
    );
    const confirmedAppointmentsTodaySnapshot = await getDocs(confirmedAppointmentsTodayQuery);
    const confirmedAppointmentsToday = confirmedAppointmentsTodaySnapshot.size;

    // Calculate payment conversion rate
    const paymentConversionRate =
      totalAppointmentsToday > 0 ? (confirmedAppointmentsToday / totalAppointmentsToday) * 100 : 0;

    return {
      totalUsers,
      newUsers7Days,
      newUsers30Days,
      verifiedProfessionals,
      totalProfessionals,
      confirmedAppointmentsToday,
      totalAppointmentsToday,
      paymentConversionRate: Math.round(paymentConversionRate * 10) / 10,
    };
  } catch (error) {
    console.error("Error fetching admin metrics:", error);
    throw new Error("Failed to fetch admin metrics");
  }
}

/**
 * Get event log entries with pagination
 */
export async function getEventLogEntries(
  limitCount: number = 50,
  startAfterDoc?: unknown,
): Promise<EventLogEntry[]> {
  const firestore = getFirebaseFirestore();

  try {
    const constraints: QueryConstraint[] = [orderBy("timestamp", "desc"), limit(limitCount)];

    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
    }

    const eventLogQuery = query(collection(firestore, "event_log"), ...constraints);
    const snapshot = await getDocs(eventLogQuery);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        eventType: data.eventType,
        data: data.data,
        timestamp: data.timestamp.toDate(),
        userId: data.userId,
      };
    });
  } catch (error) {
    console.error("Error fetching event log entries:", error);
    throw new Error("Failed to fetch event log entries");
  }
}

/**
 * Get professionals summary for admin management
 */
export async function getProfessionalsSummary(): Promise<ProfessionalSummary[]> {
  const firestore = getFirebaseFirestore();

  try {
    const professionalsQuery = query(
      collection(firestore, "users"),
      where("role", "==", "pro"),
      orderBy("createdAt", "desc"),
    );
    const professionalsSnapshot = await getDocs(professionalsQuery);

    const professionals: ProfessionalSummary[] = [];

    for (const doc of professionalsSnapshot.docs) {
      const data = doc.data();

      // Get appointment count
      const appointmentsQuery = query(
        collection(firestore, "appointments"),
        where("proId", "==", doc.id),
      );
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointmentCount = appointmentsSnapshot.size;

      // Get average rating
      const reviewsQuery = query(collection(firestore, "reviews"), where("proId", "==", doc.id));
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviews = reviewsSnapshot.docs.map((doc) => doc.data().rating);
      const averageRating =
        reviews.length > 0 ? reviews.reduce((sum, rating) => sum + rating, 0) / reviews.length : 0;

      professionals.push({
        id: doc.id,
        fullName: data.fullName || "Sin nombre",
        email: data.email || "Sin email",
        specialty: data.specialty || "Sin especialidad",
        isVerified: data.isVerified || false,
        createdAt: data.createdAt?.toDate() || new Date(),
        appointmentCount,
        averageRating: Math.round(averageRating * 10) / 10,
      });
    }

    return professionals;
  } catch (error) {
    console.error("Error fetching professionals summary:", error);
    throw new Error("Failed to fetch professionals summary");
  }
}

/**
 * Update professional verification status
 */
export async function updateProfessionalVerification(
  userId: string,
  isVerified: boolean,
): Promise<{ success: boolean; error?: string }> {
  const firestore = getFirebaseFirestore();

  try {
    await updateDoc(doc(firestore, "users", userId), {
      isVerified,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating professional verification:", error);
    return {
      success: false,
      error: "Failed to update verification status",
    };
  }
}

/**
 * Get appointments summary for admin management
 */
export async function getAppointmentsSummary(
  limitCount: number = 50,
  startAfterDoc?: unknown,
): Promise<AppointmentSummary[]> {
  const firestore = getFirebaseFirestore();

  try {
    const constraints: QueryConstraint[] = [orderBy("start", "desc"), limit(limitCount)];

    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
    }

    const appointmentsQuery = query(collection(firestore, "appointments"), ...constraints);
    const appointmentsSnapshot = await getDocs(appointmentsQuery);

    const appointments: AppointmentSummary[] = [];

    for (const appointmentDoc of appointmentsSnapshot.docs) {
      const data = appointmentDoc.data();

      // Get user and professional names
      const [userDoc, proDoc] = await Promise.all([
        getDoc(doc(firestore, "users", data.userId)),
        getDoc(doc(firestore, "users", data.proId)),
      ]);

      appointments.push({
        id: appointmentDoc.id,
        userId: data.userId,
        proId: data.proId,
        start: data.start.toDate(),
        end: data.end.toDate(),
        status: data.status,
        paid: data.paid,
        userFullName: userDoc.data()?.fullName || "Usuario desconocido",
        proFullName: proDoc.data()?.fullName || "Profesional desconocido",
        proSpecialty: proDoc.data()?.specialty || "Sin especialidad",
      });
    }

    return appointments;
  } catch (error) {
    console.error("Error fetching appointments summary:", error);
    throw new Error("Failed to fetch appointments summary");
  }
}
