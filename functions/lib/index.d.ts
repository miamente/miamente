import "./firebase-admin";
import { bookAppointment, getAppointment, cancelAppointment } from "./appointments";
import { mockApprovePayment } from "./mock-payment";
import { adminConfirmPayment, adminFailPayment } from "./admin-payments";
export declare const sendEmail: import("firebase-functions/v2/https").CallableFunction<any, Promise<import("./types").SendEmailResponse>, unknown>;
export { bookAppointment, getAppointment, cancelAppointment };
export { mockApprovePayment };
export { adminConfirmPayment, adminFailPayment };
export declare const wompiWebhook: import("firebase-functions/v2/https").HttpsFunction;
export declare const runReminders: import("firebase-functions/v2/scheduler").ScheduleFunction;
export declare const cleanupHeldSlotsJob: import("firebase-functions/v2/scheduler").ScheduleFunction;
export declare const runRemindersHttps: import("firebase-functions/v2/https").HttpsFunction;
//# sourceMappingURL=index.d.ts.map