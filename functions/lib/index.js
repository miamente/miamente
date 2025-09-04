"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runRemindersHttps = exports.cleanupHeldSlotsJob = exports.runReminders = exports.wompiWebhook = exports.adminFailPayment = exports.adminConfirmPayment = exports.mockApprovePayment = exports.cancelAppointment = exports.getAppointment = exports.bookAppointment = exports.sendEmail = void 0;
require("./firebase-admin"); // Initialize Firebase Admin first
const https_1 = require("firebase-functions/v2/https");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const https_2 = require("firebase-functions/v2/https");
const v2_1 = require("firebase-functions/v2");
const appointments_1 = require("./appointments");
Object.defineProperty(exports, "bookAppointment", { enumerable: true, get: function () { return appointments_1.bookAppointment; } });
Object.defineProperty(exports, "getAppointment", { enumerable: true, get: function () { return appointments_1.getAppointment; } });
Object.defineProperty(exports, "cancelAppointment", { enumerable: true, get: function () { return appointments_1.cancelAppointment; } });
const mock_payment_1 = require("./mock-payment");
Object.defineProperty(exports, "mockApprovePayment", { enumerable: true, get: function () { return mock_payment_1.mockApprovePayment; } });
const admin_payments_1 = require("./admin-payments");
Object.defineProperty(exports, "adminConfirmPayment", { enumerable: true, get: function () { return admin_payments_1.adminConfirmPayment; } });
Object.defineProperty(exports, "adminFailPayment", { enumerable: true, get: function () { return admin_payments_1.adminFailPayment; } });
const cleanup_1 = require("./cleanup");
const email_1 = require("./email");
const reminders_1 = require("./reminders");
const reminders_https_1 = require("./reminders-https");
exports.sendEmail = (0, https_1.onCall)(async (request) => {
    const { data, auth } = request;
    if (!auth) {
        throw new https_2.HttpsError("unauthenticated", "Auth required");
    }
    const { to, subject, html } = data;
    if (!to || !subject || !html) {
        throw new https_2.HttpsError("invalid-argument", "to, subject, and html are required");
    }
    return await (0, email_1.sendEmailHandler)(to, subject, html);
});
// Export reminders HTTPS function
exports.wompiWebhook = (0, https_1.onRequest)(async (req, res) => {
    res.status(200).send("ok");
});
exports.runReminders = (0, scheduler_1.onSchedule)("every 1 hours", async () => {
    await (0, reminders_1.sendReminderEmails)();
    await (0, reminders_1.sendPostSessionEmails)();
});
// Cleanup job to release held slots without payment
exports.cleanupHeldSlotsJob = (0, scheduler_1.onSchedule)("every 5 minutes", async () => {
    await (0, cleanup_1.cleanupHeldSlots)();
});
// HTTPS function for running reminders (called by GitHub Actions)
exports.runRemindersHttps = (0, https_1.onRequest)(async (req, res) => {
    // Set CORS headers
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    // Handle preflight requests
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }
    // Only allow GET requests
    if (req.method !== "GET") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    // Verify authorization token
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.REMINDERS_AUTH_TOKEN;
    if (!expectedToken) {
        v2_1.logger.error("REMINDERS_AUTH_TOKEN not configured");
        res.status(500).json({ error: "Server configuration error" });
        return;
    }
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
        v2_1.logger.warn("Unauthorized reminder request");
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    try {
        const result = await (0, reminders_https_1.runReminders)(req, res);
        res.status(200).json(result);
    }
    catch (error) {
        v2_1.logger.error("Error in runReminders HTTPS function:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
