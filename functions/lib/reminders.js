"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendConfirmationEmail = sendConfirmationEmail;
exports.sendReminderEmails = sendReminderEmails;
exports.sendPostSessionEmails = sendPostSessionEmails;
require("./firebase-admin"); // Initialize Firebase Admin first
const admin = __importStar(require("firebase-admin"));
const v2_1 = require("firebase-functions/v2");
const email_1 = require("./email");
const email_2 = require("./email");
const utils_1 = require("./utils");
const db = admin.firestore();
/**
 * Send appointment confirmation email when payment is confirmed
 */
async function sendConfirmationEmail(appointmentId) {
    try {
        const appointment = await getAppointment(appointmentId);
        if (!appointment) {
            v2_1.logger.error(`Appointment ${appointmentId} not found`);
            return;
        }
        // Get user and professional data
        const [userDoc, proDoc] = await Promise.all([
            db.collection("users").doc(appointment.userId).get(),
            db.collection("professionals").doc(appointment.proId).get(),
        ]);
        const userData = userDoc.data();
        const proData = proDoc.data();
        const appointmentData = appointment;
        if (!userData?.email || !appointmentData.jitsiUrl) {
            v2_1.logger.error(`Missing email or Jitsi URL for appointment ${appointmentId}`);
            return;
        }
        const subject = (0, utils_1.generateConfirmationSubject)(appointmentData.start.toDate());
        const html = (0, email_2.generateConfirmationEmailHtml)(appointmentData.start.toDate(), appointmentData.jitsiUrl, proData?.fullName);
        const result = await (0, email_1.sendEmailHandler)(userData.email, subject, html);
        if (result.success) {
            v2_1.logger.info(`Confirmation email sent for appointment ${appointmentId}`);
        }
        else {
            v2_1.logger.error(`Failed to send confirmation email for appointment ${appointmentId}:`, result.error);
        }
    }
    catch (error) {
        v2_1.logger.error(`Error sending confirmation email for appointment ${appointmentId}:`, error);
    }
}
/**
 * Send reminder emails (24h and 1h before appointment)
 */
async function sendReminderEmails() {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    try {
        // Get appointments that need 24h reminders
        const appointments24h = await db
            .collection("appointments")
            .where("status", "in", ["paid", "confirmed"])
            .where("start", ">=", now)
            .where("start", "<=", twentyFourHoursFromNow)
            .get();
        // Get appointments that need 1h reminders
        const appointments1h = await db
            .collection("appointments")
            .where("status", "in", ["paid", "confirmed"])
            .where("start", ">=", now)
            .where("start", "<=", oneHourFromNow)
            .get();
        // Send 24h reminders
        for (const appointmentDoc of appointments24h.docs) {
            const appointment = appointmentDoc.data();
            await sendReminderEmail(appointmentDoc.id, appointment, 24);
        }
        // Send 1h reminders
        for (const appointmentDoc of appointments1h.docs) {
            const appointment = appointmentDoc.data();
            await sendReminderEmail(appointmentDoc.id, appointment, 1);
        }
        v2_1.logger.info(`Sent ${appointments24h.docs.length} 24h reminders and ${appointments1h.docs.length} 1h reminders`);
    }
    catch (error) {
        v2_1.logger.error("Error sending reminder emails:", error);
    }
}
/**
 * Send post-session email after appointment completion
 */
async function sendPostSessionEmails() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    try {
        // Get completed appointments from the last hour
        const completedAppointments = await db
            .collection("appointments")
            .where("status", "==", "completed")
            .where("end", ">=", oneHourAgo)
            .where("end", "<=", now)
            .get();
        for (const appointmentDoc of completedAppointments.docs) {
            const appointment = appointmentDoc.data();
            await sendPostSessionEmail(appointmentDoc.id, appointment);
        }
        v2_1.logger.info(`Sent ${completedAppointments.docs.length} post-session emails`);
    }
    catch (error) {
        v2_1.logger.error("Error sending post-session emails:", error);
    }
}
/**
 * Helper function to send reminder email
 */
async function sendReminderEmail(appointmentId, appointment, hoursUntil) {
    try {
        const appointmentData = appointment;
        if (!appointmentData.jitsiUrl) {
            v2_1.logger.error(`No Jitsi URL for appointment ${appointmentId}`);
            return;
        }
        // Get user and professional data
        const [userDoc, proDoc] = await Promise.all([
            db.collection("users").doc(appointmentData.userId).get(),
            db.collection("professionals").doc(appointmentData.proId).get(),
        ]);
        const userData = userDoc.data();
        const proData = proDoc.data();
        if (!userData?.email) {
            v2_1.logger.error(`No email for user ${appointmentData.userId}`);
            return;
        }
        const appointmentDate = appointmentData.start.toDate();
        const subject = (0, utils_1.generateReminderSubject)(appointmentDate, hoursUntil);
        const html = (0, email_2.generateReminderEmailHtml)(appointmentDate, appointmentData.jitsiUrl, hoursUntil, proData?.fullName);
        const result = await (0, email_1.sendEmailHandler)(userData.email, subject, html);
        if (result.success) {
            v2_1.logger.info(`Reminder email sent for appointment ${appointmentId} (${hoursUntil}h)`);
        }
        else {
            v2_1.logger.error(`Failed to send reminder email for appointment ${appointmentId}:`, result.error);
        }
    }
    catch (error) {
        v2_1.logger.error(`Error sending reminder email for appointment ${appointmentId}:`, error);
    }
}
/**
 * Helper function to send post-session email
 */
async function sendPostSessionEmail(appointmentId, appointment) {
    try {
        const appointmentData = appointment;
        // Get user and professional data
        const [userDoc, proDoc] = await Promise.all([
            db.collection("users").doc(appointmentData.userId).get(),
            db.collection("professionals").doc(appointmentData.proId).get(),
        ]);
        const userData = userDoc.data();
        const proData = proDoc.data();
        if (!userData?.email) {
            v2_1.logger.error(`No email for user ${appointmentData.userId}`);
            return;
        }
        const subject = "Gracias por tu sesión - Miamente";
        const html = (0, email_2.generatePostSessionEmailHtml)(proData?.fullName);
        const result = await (0, email_1.sendEmailHandler)(userData.email, subject, html);
        if (result.success) {
            v2_1.logger.info(`Post-session email sent for appointment ${appointmentId}`);
        }
        else {
            v2_1.logger.error(`Failed to send post-session email for appointment ${appointmentId}:`, result.error);
        }
    }
    catch (error) {
        v2_1.logger.error(`Error sending post-session email for appointment ${appointmentId}:`, error);
    }
}
/**
 * Helper function to get appointment data
 */
async function getAppointment(appointmentId) {
    const appointmentDoc = await db.collection("appointments").doc(appointmentId).get();
    return appointmentDoc.exists ? appointmentDoc.data() : null;
}
