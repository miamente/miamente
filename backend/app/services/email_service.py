"""
Email service using SendGrid.
"""
import os
from typing import Optional
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from app.core.config import settings


class EmailService:
    """Email service using SendGrid."""
    
    def __init__(self):
        self.sg = SendGridAPIClient(api_key=settings.SENDGRID_API_KEY) if settings.SENDGRID_API_KEY else None
    
    def send_email(
        self, 
        to_email: str, 
        subject: str, 
        html_content: str,
        from_email: Optional[str] = None,
        from_name: Optional[str] = None
    ) -> bool:
        """Send email using SendGrid."""
        if not self.sg:
            print(f"Email not sent - SendGrid not configured. To: {to_email}, Subject: {subject}")
            return False
        
        try:
            message = Mail(
                from_email=from_email or settings.SENDGRID_FROM_EMAIL,
                from_name=from_name or settings.SENDGRID_FROM_NAME,
                to_emails=to_email,
                subject=subject,
                html_content=html_content
            )
            
            response = self.sg.send(message)
            return response.status_code in [200, 201, 202]
            
        except Exception as e:
            print(f"Error sending email: {e}")
            return False
    
    def send_appointment_confirmation(
        self, 
        to_email: str, 
        appointment_date: str, 
        jitsi_url: str,
        professional_name: Optional[str] = None
    ) -> bool:
        """Send appointment confirmation email."""
        subject = f"Confirmación de Cita - {appointment_date}"
        html_content = self._generate_confirmation_email_html(
            appointment_date, jitsi_url, professional_name
        )
        return self.send_email(to_email, subject, html_content)
    
    def send_appointment_reminder(
        self, 
        to_email: str, 
        appointment_date: str, 
        jitsi_url: str,
        hours_until: int,
        professional_name: Optional[str] = None
    ) -> bool:
        """Send appointment reminder email."""
        time_message = f"en {hours_until} horas" if hours_until > 1 else "en 1 hora"
        subject = f"Recordatorio de Cita - {time_message}"
        html_content = self._generate_reminder_email_html(
            appointment_date, jitsi_url, hours_until, professional_name
        )
        return self.send_email(to_email, subject, html_content)
    
    def send_post_session_email(
        self, 
        to_email: str,
        professional_name: Optional[str] = None
    ) -> bool:
        """Send post-session email."""
        subject = "Gracias por tu sesión - Miamente"
        html_content = self._generate_post_session_email_html(professional_name)
        return self.send_email(to_email, subject, html_content)
    
    def _generate_confirmation_email_html(
        self, 
        appointment_date: str, 
        jitsi_url: str,
        professional_name: Optional[str] = None
    ) -> str:
        """Generate appointment confirmation email HTML."""
        professional_info = f" con {professional_name}" if professional_name else ""
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmación de Cita</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .appointment-details {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }}
                .cta-button {{ display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
                .logo {{ font-size: 24px; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">🧠 Miamente</div>
                <h1>¡Cita Confirmada!</h1>
            </div>
            
            <div class="content">
                <p>Hola,</p>
                <p>Tu cita de salud mental{professional_info} ha sido confirmada exitosamente.</p>
                
                <div class="appointment-details">
                    <h3>📅 Detalles de la Cita</h3>
                    <p><strong>Fecha y Hora:</strong> {appointment_date}</p>
                    <p><strong>Modalidad:</strong> Videollamada</p>
                </div>
                
                <p>Para unirte a la sesión, haz clic en el botón a continuación:</p>
                <a href="{jitsi_url}" class="cta-button">🎥 Unirme a la Sesión</a>
                
                <p><strong>Instrucciones importantes:</strong></p>
                <ul>
                    <li>Asegúrate de tener una conexión estable a internet</li>
                    <li>Usa auriculares para mejor calidad de audio</li>
                    <li>Busca un lugar privado y tranquilo</li>
                    <li>La sesión comenzará puntualmente</li>
                </ul>
                
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
        """
    
    def _generate_reminder_email_html(
        self, 
        appointment_date: str, 
        jitsi_url: str,
        hours_until: int,
        professional_name: Optional[str] = None
    ) -> str:
        """Generate appointment reminder email HTML."""
        professional_info = f" con {professional_name}" if professional_name else ""
        time_message = f"en {hours_until} horas" if hours_until > 1 else "en 1 hora"
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Recordatorio de Cita</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .appointment-details {{ background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f093fb; }}
                .cta-button {{ display: inline-block; background: #f093fb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
                .logo {{ font-size: 24px; font-weight: bold; }}
                .reminder-badge {{ background: #ff6b6b; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">🧠 Miamente</div>
                <h1>Recordatorio de Cita</h1>
                <span class="reminder-badge">{time_message}</span>
            </div>
            
            <div class="content">
                <p>Hola,</p>
                <p>Te recordamos que tienes una cita de salud mental{professional_info} {time_message}.</p>
                
                <div class="appointment-details">
                    <h3>📅 Detalles de la Cita</h3>
                    <p><strong>Fecha y Hora:</strong> {appointment_date}</p>
                    <p><strong>Modalidad:</strong> Videollamada</p>
                </div>
                
                <p>Para unirte a la sesión, haz clic en el botón a continuación:</p>
                <a href="{jitsi_url}" class="cta-button">🎥 Unirme a la Sesión</a>
                
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
        """
    
    def _generate_post_session_email_html(self, professional_name: Optional[str] = None) -> str:
        """Generate post-session email HTML."""
        professional_info = f" con {professional_name}" if professional_name else ""
        
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Gracias por tu Sesión</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                .cta-button {{ display: inline-block; background: #4facfe; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
                .logo {{ font-size: 24px; font-weight: bold; }}
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">🧠 Miamente</div>
                <h1>¡Gracias por tu Sesión!</h1>
            </div>
            
            <div class="content">
                <p>Hola,</p>
                <p>Esperamos que tu sesión{professional_info} haya sido útil y enriquecedora.</p>
                
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
        """
