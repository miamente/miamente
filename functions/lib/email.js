"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailHandler = sendEmailHandler;
exports.generateConfirmationEmailHtml = generateConfirmationEmailHtml;
exports.generateReminderEmailHtml = generateReminderEmailHtml;
exports.generatePostSessionEmailHtml = generatePostSessionEmailHtml;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const v2_1 = require("firebase-functions/v2");
const utils_1 = require("./utils");
// Initialize SendGrid
const sendGridApiKey = process.env.SENDGRID_API_KEY;
if (sendGridApiKey) {
    mail_1.default.setApiKey(sendGridApiKey);
}
else {
    v2_1.logger.warn("SENDGRID_API_KEY not configured. Email functionality will be disabled.");
}
/**
 * Send email using SendGrid
 */
async function sendEmailHandler(to, subject, html) {
    // Check if SendGrid is configured
    if (!sendGridApiKey) {
        v2_1.logger.warn(`Email not sent - SendGrid not configured. To: ${to}, Subject: ${subject}`);
        return {
            success: false,
            error: "SendGrid not configured",
        };
    }
    try {
        const msg = {
            to,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL || "noreply@miamente.com",
                name: "Miamente",
            },
            subject,
            html,
        };
        const response = await mail_1.default.send(msg);
        const messageId = response[0].headers["x-message-id"];
        return {
            success: true,
            messageId,
        };
    }
    catch (error) {
        v2_1.logger.error("Error sending email:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
/**
 * Generate appointment confirmation email HTML
 */
function generateConfirmationEmailHtml(appointmentDate, jitsiUrl, professionalName) {
    const formattedDate = (0, utils_1.formatEmailDate)(appointmentDate);
    const professionalInfo = professionalName ? ` con ${professionalName}` : "";
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Cita</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .logo { font-size: 24px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🧠 Miamente</div>
        <h1>¡Cita Confirmada!</h1>
      </div>
      
      <div class="content">
        <p>Hola,</p>
        <p>Tu cita de salud mental${professionalInfo} ha sido confirmada exitosamente.</p>
        
        <div class="appointment-details">
          <h3>📅 Detalles de la Cita</h3>
          <p><strong>Fecha y Hora:</strong> ${formattedDate}</p>
          <p><strong>Modalidad:</strong> Videollamada</p>
        </div>
        
        <p>Para unirte a la sesión, haz clic en el botón a continuación:</p>
        <a href="${jitsiUrl}" class="cta-button">🎥 Unirme a la Sesión</a>
        
        <p><strong>Instrucciones importantes:</strong></p>
        <ul>
          <li>Asegúrate de tener una conexión estable a internet</li>
          <li>Usa auriculares para mejor calidad de audio</li>
          <li>Busca un lugar privado y tranquilo</li>
          <li>La sesión comenzará puntualmente</li>
        </ul>
        
        <div class="appointment-details">
          <h3>📋 Política de Cancelación</h3>
          <p><strong>Cancelaciones:</strong> Puedes cancelar tu cita hasta 24 horas antes sin costo.</p>
          <p><strong>Reprogramaciones:</strong> Las reprogramaciones están disponibles hasta 12 horas antes de la cita.</p>
          <p><strong>No-show:</strong> Si no te presentas a la cita, se aplicará el costo completo.</p>
          <p><strong>Emergencias:</strong> Para situaciones de emergencia, contáctanos inmediatamente.</p>
        </div>
        
        <p>Si tienes alguna pregunta o necesitas reprogramar tu cita, no dudes en contactarnos.</p>
        
        <p>¡Esperamos verte pronto!</p>
        <p>El equipo de Miamente</p>
      </div>
      
      <div class="footer">
        <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
        <p>© 2024 Miamente - Cuidando tu bienestar mental</p>
      </div>
    </body>
    </html>
  `;
}
/**
 * Generate reminder email HTML
 */
function generateReminderEmailHtml(appointmentDate, jitsiUrl, hoursUntil, professionalName) {
    const formattedDate = (0, utils_1.formatEmailDate)(appointmentDate);
    const professionalInfo = professionalName ? ` con ${professionalName}` : "";
    const timeMessage = hoursUntil === 1 ? "en 1 hora" : `en ${hoursUntil} horas`;
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recordatorio de Cita</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f093fb; }
        .cta-button { display: inline-block; background: #f093fb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .logo { font-size: 24px; font-weight: bold; }
        .reminder-badge { background: #ff6b6b; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🧠 Miamente</div>
        <h1>Recordatorio de Cita</h1>
        <span class="reminder-badge">${timeMessage}</span>
      </div>
      
      <div class="content">
        <p>Hola,</p>
        <p>Te recordamos que tienes una cita de salud mental${professionalInfo} ${timeMessage}.</p>
        
        <div class="appointment-details">
          <h3>📅 Detalles de la Cita</h3>
          <p><strong>Fecha y Hora:</strong> ${formattedDate}</p>
          <p><strong>Modalidad:</strong> Videollamada</p>
        </div>
        
        <p>Para unirte a la sesión, haz clic en el botón a continuación:</p>
        <a href="${jitsiUrl}" class="cta-button">🎥 Unirme a la Sesión</a>
        
        <p><strong>Preparación para la sesión:</strong></p>
        <ul>
          <li>Verifica tu conexión a internet</li>
          <li>Prepara tus auriculares</li>
          <li>Busca un lugar privado y sin interrupciones</li>
          <li>Ten a mano agua y papel para notas</li>
        </ul>
        
        <p>Si necesitas reprogramar o cancelar tu cita, contáctanos lo antes posible.</p>
        
        <p>¡Nos vemos pronto!</p>
        <p>El equipo de Miamente</p>
      </div>
      
      <div class="footer">
        <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
        <p>© 2024 Miamente - Cuidando tu bienestar mental</p>
      </div>
    </body>
    </html>
  `;
}
/**
 * Generate post-session email HTML
 */
function generatePostSessionEmailHtml(professionalName) {
    const professionalInfo = professionalName ? ` con ${professionalName}` : "";
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Gracias por tu Sesión</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .cta-button { display: inline-block; background: #4facfe; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .logo { font-size: 24px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">🧠 Miamente</div>
        <h1>¡Gracias por tu Sesión!</h1>
      </div>
      
      <div class="content">
        <p>Hola,</p>
        <p>Esperamos que tu sesión${professionalInfo} haya sido útil y enriquecedora.</p>
        
        <p><strong>Tu bienestar mental es importante para nosotros.</strong></p>
        
        <p>Si necesitas agendar una nueva cita o tienes alguna pregunta, no dudes en contactarnos.</p>
        
        <a href="https://miamente.com/professionals" class="cta-button">📅 Agendar Nueva Cita</a>
        
        <p><strong>Recuerda:</strong></p>
        <ul>
          <li>Practica las técnicas discutidas en la sesión</li>
          <li>Mantén una rutina saludable</li>
          <li>No dudes en buscar ayuda cuando la necesites</li>
        </ul>
        
        <p>¡Gracias por confiar en Miamente para tu cuidado mental!</p>
        <p>El equipo de Miamente</p>
      </div>
      
      <div class="footer">
        <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
        <p>© 2024 Miamente - Cuidando tu bienestar mental</p>
      </div>
    </body>
    </html>
  `;
}
