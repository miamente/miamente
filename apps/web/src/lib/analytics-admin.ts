import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type QueryConstraint,
} from "firebase/firestore";

import { getFirebaseFirestore } from "./firebase";

export interface EventLogData {
  id: string;
  userId: string;
  action: string;
  entityId?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface AppointmentChartData {
  date: string;
  confirmed: number;
  total: number;
}

export interface EventStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByDay: Record<string, number>;
  uniqueUsers: number;
}

/**
 * Get event log entries with pagination and filtering
 */
export async function getEventLogEntries(
  limitCount: number = 100,
  startAfterDoc?: unknown,
  actionFilter?: string,
): Promise<EventLogData[]> {
  const firestore = getFirebaseFirestore();

  try {
    const constraints: QueryConstraint[] = [orderBy("timestamp", "desc"), limit(limitCount)];

    if (actionFilter) {
      constraints.unshift(where("action", "==", actionFilter));
    }

    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
    }

    const eventLogQuery = query(collection(firestore, "event_log"), ...constraints);
    const snapshot = await getDocs(eventLogQuery);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        action: data.action,
        entityId: data.entityId,
        timestamp: data.timestamp.toDate(),
        metadata: data.metadata,
      };
    });
  } catch (error) {
    console.error("Error fetching event log entries:", error);
    throw new Error("Failed to fetch event log entries");
  }
}

/**
 * Get appointment confirmation data for the last 30 days
 */
export async function getAppointmentChartData(): Promise<AppointmentChartData[]> {
  const firestore = getFirebaseFirestore();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  try {
    // Get all appointment_confirmed events from the last 30 days
    const confirmedEventsQuery = query(
      collection(firestore, "event_log"),
      where("action", "==", "appointment_confirmed"),
      where("timestamp", ">=", thirtyDaysAgo),
      orderBy("timestamp", "asc"),
    );

    const confirmedEventsSnapshot = await getDocs(confirmedEventsQuery);
    const confirmedEvents = confirmedEventsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        date: data.timestamp.toDate().toISOString().split("T")[0], // YYYY-MM-DD format
        confirmed: 1,
      };
    });

    // Get all appointments from the last 30 days (for total count)
    const appointmentsQuery = query(
      collection(firestore, "appointments"),
      where("start", ">=", thirtyDaysAgo),
      orderBy("start", "asc"),
    );

    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    const appointments = appointmentsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        date: data.start.toDate().toISOString().split("T")[0], // YYYY-MM-DD format
        total: 1,
      };
    });

    // Group by date
    const confirmedByDate: Record<string, number> = {};
    const totalByDate: Record<string, number> = {};

    confirmedEvents.forEach((event) => {
      confirmedByDate[event.date] = (confirmedByDate[event.date] || 0) + event.confirmed;
    });

    appointments.forEach((appointment) => {
      totalByDate[appointment.date] = (totalByDate[appointment.date] || 0) + appointment.total;
    });

    // Generate data for all days in the range
    const chartData: AppointmentChartData[] = [];
    const currentDate = new Date(thirtyDaysAgo);

    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split("T")[0];
      chartData.push({
        date: dateStr,
        confirmed: confirmedByDate[dateStr] || 0,
        total: totalByDate[dateStr] || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return chartData;
  } catch (error) {
    console.error("Error fetching appointment chart data:", error);
    throw new Error("Failed to fetch appointment chart data");
  }
}

/**
 * Get event statistics
 */
export async function getEventStats(): Promise<EventStats> {
  const firestore = getFirebaseFirestore();

  try {
    // Get all events
    const eventsSnapshot = await getDocs(collection(firestore, "event_log"));
    const events = eventsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        action: data.action,
        userId: data.userId,
        timestamp: data.timestamp.toDate(),
      };
    });

    // Calculate statistics
    const eventsByType: Record<string, number> = {};
    const eventsByDay: Record<string, number> = {};
    const uniqueUsers = new Set<string>();

    events.forEach((event) => {
      // Count by type
      eventsByType[event.action] = (eventsByType[event.action] || 0) + 1;

      // Count by day
      const day = event.timestamp.toISOString().split("T")[0];
      eventsByDay[day] = (eventsByDay[day] || 0) + 1;

      // Count unique users
      uniqueUsers.add(event.userId);
    });

    return {
      totalEvents: events.length,
      eventsByType,
      eventsByDay,
      uniqueUsers: uniqueUsers.size,
    };
  } catch (error) {
    console.error("Error fetching event stats:", error);
    throw new Error("Failed to fetch event stats");
  }
}

/**
 * Get events by user
 */
export async function getEventsByUser(userId: string): Promise<EventLogData[]> {
  const firestore = getFirebaseFirestore();

  try {
    const userEventsQuery = query(
      collection(firestore, "event_log"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(50),
    );

    const snapshot = await getDocs(userEventsQuery);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        action: data.action,
        entityId: data.entityId,
        timestamp: data.timestamp.toDate(),
        metadata: data.metadata,
      };
    });
  } catch (error) {
    console.error("Error fetching events by user:", error);
    throw new Error("Failed to fetch events by user");
  }
}

/**
 * Get conversion funnel data
 */
export async function getConversionFunnelData(): Promise<{
  signups: number;
  profileCompletions: number;
  slotCreations: number;
  appointmentConfirmations: number;
  paymentAttempts: number;
  paymentSuccesses: number;
}> {
  const firestore = getFirebaseFirestore();

  try {
    const [
      signupsSnapshot,
      profileCompletionsSnapshot,
      slotCreationsSnapshot,
      appointmentConfirmationsSnapshot,
      paymentAttemptsSnapshot,
      paymentSuccessesSnapshot,
    ] = await Promise.all([
      getDocs(query(collection(firestore, "event_log"), where("action", "==", "signup"))),
      getDocs(query(collection(firestore, "event_log"), where("action", "==", "profile_complete"))),
      getDocs(query(collection(firestore, "event_log"), where("action", "==", "slot_created"))),
      getDocs(
        query(collection(firestore, "event_log"), where("action", "==", "appointment_confirmed")),
      ),
      getDocs(query(collection(firestore, "event_log"), where("action", "==", "payment_attempt"))),
      getDocs(query(collection(firestore, "event_log"), where("action", "==", "payment_success"))),
    ]);

    return {
      signups: signupsSnapshot.size,
      profileCompletions: profileCompletionsSnapshot.size,
      slotCreations: slotCreationsSnapshot.size,
      appointmentConfirmations: appointmentConfirmationsSnapshot.size,
      paymentAttempts: paymentAttemptsSnapshot.size,
      paymentSuccesses: paymentSuccessesSnapshot.size,
    };
  } catch (error) {
    console.error("Error fetching conversion funnel data:", error);
    throw new Error("Failed to fetch conversion funnel data");
  }
}
