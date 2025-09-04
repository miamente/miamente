import { Timestamp } from "firebase-admin/firestore";

export interface AppointmentData {
  userId: string;
  proId: string;
  slotId: string;
  start: Timestamp;
  end: Timestamp;
  status: string;
  paid: boolean;
  jitsiUrl?: string;
  sent24h?: boolean;
  sent1h?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
