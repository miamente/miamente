import React from "react";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h1 className="mb-8 text-3xl font-bold">Política de Privacidad y Protección de Datos</h1>

        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Última actualización:</strong> {new Date().toLocaleDateString("es-CO")}
          </p>
          <p className="mt-2 text-sm text-blue-800 dark:text-blue-200">
            <strong>Cumplimiento:</strong> Ley 1581 de 2012 y Decreto 1377 de 2013 de Colombia
          </p>
        </div>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            1. Información del Responsable del Tratamiento
          </h2>
          <p>
            En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013, Miamente S.A.S. actúa
            como responsable del tratamiento de datos personales.
          </p>
          <ul className="mt-4 list-none">
            <li>
              <strong>Razón Social:</strong> Miamente S.A.S.
            </li>
            <li>
              <strong>NIT:</strong> 900.XXX.XXX-X
            </li>
            <li>
              <strong>Dirección:</strong> Bogotá, Colombia
            </li>
            <li>
              <strong>Email:</strong> privacidad@miamente.com
            </li>
            <li>
              <strong>Teléfono:</strong> +57 (1) XXX-XXXX
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">2. Finalidades del Tratamiento</h2>
          <p>
            Los datos personales que recopilamos son utilizados para las siguientes finalidades:
          </p>

          <h3 className="mt-6 mb-3 text-xl font-medium">2.1 Finalidades Principales</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>Facilitar la conexión entre usuarios y profesionales de la salud mental</li>
            <li>Gestionar reservas de citas y pagos</li>
            <li>Proporcionar soporte técnico y atención al cliente</li>
            <li>Verificar la identidad y certificación de profesionales</li>
            <li>Mantener la seguridad y prevenir fraudes</li>
          </ul>

          <h3 className="mt-6 mb-3 text-xl font-medium">2.2 Finalidades Secundarias</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>Mejorar nuestros servicios y desarrollar nuevas funcionalidades</li>
            <li>Realizar análisis estadísticos y de mercado</li>
            <li>Enviar comunicaciones promocionales (con su consentimiento)</li>
            <li>Cumplir con obligaciones legales y regulatorias</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">3. Datos Personales que Recopilamos</h2>

          <h3 className="mb-3 text-xl font-medium">3.1 Datos de Usuarios</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Datos de identificación:</strong> Nombre completo, email, teléfono
            </li>
            <li>
              <strong>Datos de contacto:</strong> Dirección, ciudad, país
            </li>
            <li>
              <strong>Datos de uso:</strong> Historial de citas, preferencias, calificaciones
            </li>
            <li>
              <strong>Datos de pago:</strong> Información de facturación (procesada por terceros
              seguros)
            </li>
            <li>
              <strong>Datos técnicos:</strong> Dirección IP, tipo de dispositivo, navegador
            </li>
          </ul>

          <h3 className="mt-6 mb-3 text-xl font-medium">3.2 Datos de Profesionales</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Datos profesionales:</strong> Certificaciones, especialidades, tarifas
            </li>
            <li>
              <strong>Datos de verificación:</strong> Documentos de identidad, títulos profesionales
            </li>
            <li>
              <strong>Datos financieros:</strong> Información bancaria para pagos
            </li>
            <li>
              <strong>Datos de rendimiento:</strong> Calificaciones, reseñas, estadísticas
            </li>
          </ul>

          <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <h3 className="mb-2 font-semibold text-yellow-800 dark:text-yellow-200">
              ⚠️ Datos Sensibles - Historia Clínica
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              <strong>IMPORTANTE:</strong> En esta versión MVP, Miamente NO recopila, almacena ni
              procesa historias clínicas, diagnósticos o información médica sensible. Los
              profesionales mantienen sus propios registros clínicos de acuerdo con sus protocolos
              profesionales y normativas aplicables.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">4. Base Legal del Tratamiento</h2>
          <p>El tratamiento de sus datos personales se basa en las siguientes bases legales:</p>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>
              <strong>Consentimiento:</strong> Para finalidades secundarias y comunicaciones
              promocionales
            </li>
            <li>
              <strong>Ejecución contractual:</strong> Para proporcionar los servicios solicitados
            </li>
            <li>
              <strong>Interés legítimo:</strong> Para mejorar nuestros servicios y prevenir fraudes
            </li>
            <li>
              <strong>Cumplimiento legal:</strong> Para cumplir con obligaciones regulatorias
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">5. Compartir Información con Terceros</h2>
          <p>Podemos compartir su información personal en las siguientes circunstancias:</p>

          <h3 className="mt-6 mb-3 text-xl font-medium">5.1 Proveedores de Servicios</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Procesadores de pago:</strong> Para procesar transacciones de forma segura
            </li>
            <li>
              <strong>Proveedores de videollamadas:</strong> Para facilitar las consultas virtuales
            </li>
            <li>
              <strong>Servicios de hosting:</strong> Para almacenar y procesar datos de forma segura
            </li>
            <li>
              <strong>Servicios de email:</strong> Para enviar comunicaciones
            </li>
          </ul>

          <h3 className="mt-6 mb-3 text-xl font-medium">5.2 Cumplimiento Legal</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>Cuando sea requerido por autoridades competentes</li>
            <li>Para cumplir con órdenes judiciales o procesos legales</li>
            <li>Para proteger nuestros derechos legales</li>
            <li>En caso de emergencias médicas (con autorización expresa)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">6. Transferencias Internacionales</h2>
          <p>
            Algunos de nuestros proveedores de servicios pueden estar ubicados fuera de Colombia. En
            estos casos, nos aseguramos de que:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>Los países de destino tengan niveles adecuados de protección de datos</li>
            <li>Se implementen cláusulas contractuales estándar aprobadas</li>
            <li>Se obtenga su consentimiento explícito cuando sea necesario</li>
            <li>Se mantengan las mismas garantías de protección</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">7. Seguridad de los Datos</h2>
          <p>Implementamos medidas técnicas, administrativas y físicas para proteger sus datos:</p>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>
              <strong>Encriptación:</strong> Datos en tránsito y en reposo
            </li>
            <li>
              <strong>Acceso restringido:</strong> Solo personal autorizado
            </li>
            <li>
              <strong>Monitoreo continuo:</strong> Detección de amenazas
            </li>
            <li>
              <strong>Copias de seguridad:</strong> Respaldo regular de datos
            </li>
            <li>
              <strong>Auditorías:</strong> Revisiones periódicas de seguridad
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">8. Retención de Datos</h2>
          <p>Conservamos sus datos personales durante los siguientes períodos:</p>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>
              <strong>Datos de cuenta:</strong> Mientras mantenga una cuenta activa
            </li>
            <li>
              <strong>Datos de transacciones:</strong> 5 años para fines contables y fiscales
            </li>
            <li>
              <strong>Datos de comunicación:</strong> 2 años para soporte al cliente
            </li>
            <li>
              <strong>Datos de marketing:</strong> Hasta que retire su consentimiento
            </li>
            <li>
              <strong>Datos de seguridad:</strong> Según requerimientos legales
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">9. Sus Derechos</h2>
          <p>Como titular de datos personales, usted tiene los siguientes derechos:</p>

          <h3 className="mt-6 mb-3 text-xl font-medium">9.1 Derechos Fundamentales</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Conocer:</strong> Qué datos tenemos sobre usted y cómo los usamos
            </li>
            <li>
              <strong>Actualizar:</strong> Corregir datos inexactos o incompletos
            </li>
            <li>
              <strong>Rectificar:</strong> Solicitar corrección de datos erróneos
            </li>
            <li>
              <strong>Solicitar prueba:</strong> De la autorización otorgada
            </li>
            <li>
              <strong>Revocar:</strong> Su consentimiento en cualquier momento
            </li>
            <li>
              <strong>Acceder:</strong> A sus datos personales de forma gratuita
            </li>
          </ul>

          <h3 className="mt-6 mb-3 text-xl font-medium">9.2 Cómo Ejercer Sus Derechos</h3>
          <p>Para ejercer cualquiera de estos derechos, puede contactarnos en:</p>
          <ul className="mt-4 list-none">
            <li>
              <strong>Email:</strong> privacidad@miamente.com
            </li>
            <li>
              <strong>Formulario web:</strong> Disponible en nuestra plataforma
            </li>
            <li>
              <strong>Teléfono:</strong> +57 (1) XXX-XXXX
            </li>
          </ul>
          <p className="mt-4 text-sm">
            Responderemos a su solicitud dentro de los 15 días hábiles siguientes a su recepción.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">10. Menores de Edad</h2>
          <p>
            Nuestros servicios están dirigidos a personas mayores de 18 años. Si un menor de edad
            desea utilizar nuestros servicios, debe contar con la autorización y supervisión de su
            representante legal.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">11. Cookies y Tecnologías Similares</h2>
          <p>Utilizamos cookies y tecnologías similares para:</p>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>Mantener su sesión activa</li>
            <li>Recordar sus preferencias</li>
            <li>Analizar el uso de la plataforma</li>
            <li>Mejorar la experiencia del usuario</li>
          </ul>
          <p className="mt-4">
            Puede configurar su navegador para rechazar cookies, aunque esto puede afectar la
            funcionalidad de la plataforma.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">12. Modificaciones a esta Política</h2>
          <p>
            Podemos actualizar esta política de privacidad ocasionalmente. Los cambios
            significativos serán notificados a través de:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>Notificación en la plataforma</li>
            <li>Email a la dirección registrada</li>
            <li>Actualización de la fecha de modificación</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">13. Autoridad de Control</h2>
          <p>
            Si considera que sus derechos han sido vulnerados, puede presentar una queja ante la
            Superintendencia de Industria y Comercio (SIC):
          </p>
          <ul className="mt-4 list-none">
            <li>
              <strong>Sitio web:</strong> www.sic.gov.co
            </li>
            <li>
              <strong>Teléfono:</strong> (601) 587 0000
            </li>
            <li>
              <strong>Dirección:</strong> Carrera 13 No. 27-00, Bogotá
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">14. Contacto</h2>
          <p>
            Para consultas sobre esta política de privacidad o el tratamiento de sus datos
            personales, puede contactarnos en:
          </p>
          <ul className="mt-4 list-none">
            <li>
              <strong>Email:</strong> privacidad@miamente.com
            </li>
            <li>
              <strong>Teléfono:</strong> +57 (1) XXX-XXXX
            </li>
            <li>
              <strong>Dirección:</strong> Bogotá, Colombia
            </li>
            <li>
              <strong>Horario de atención:</strong> Lunes a Viernes, 8:00 AM - 6:00 PM
            </li>
          </ul>
        </section>

        <div className="mt-12 rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Esta política de privacidad cumple con la Ley 1581 de 2012 y el Decreto 1377 de 2013 de
            Colombia. Al utilizar Miamente, usted acepta el tratamiento de sus datos personales
            según se describe en esta política.
          </p>
        </div>
      </div>
    </div>
  );
}
