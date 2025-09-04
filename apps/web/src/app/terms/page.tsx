import React from "react";

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h1 className="mb-8 text-3xl font-bold">Términos y Condiciones de Uso</h1>

        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Última actualización:</strong> {new Date().toLocaleDateString("es-CO")}
          </p>
        </div>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">1. Información General</h2>
          <p>
            Bienvenido a Miamente, una plataforma digital que conecta usuarios con profesionales de
            la salud mental para sesiones de consulta virtual. Al acceder y utilizar nuestros
            servicios, usted acepta estar sujeto a estos Términos y Condiciones de Uso.
          </p>
          <p>
            <strong>Empresa:</strong> Miamente S.A.S.
            <br />
            <strong>NIT:</strong> 900.XXX.XXX-X
            <br />
            <strong>Dirección:</strong> Bogotá, Colombia
            <br />
            <strong>Email:</strong> legal@miamente.com
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">2. Definiciones</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>&quot;Plataforma&quot;</strong>: El sitio web y aplicaciones de Miamente
            </li>
            <li>
              <strong>&quot;Usuario&quot;</strong>: Persona que utiliza la plataforma para buscar
              servicios de salud mental
            </li>
            <li>
              <strong>&quot;Profesional&quot;</strong>: Psicólogo, psiquiatra o terapeuta registrado
              en la plataforma
            </li>
            <li>
              <strong>&quot;Servicios&quot;</strong>: Las consultas virtuales y herramientas de la
              plataforma
            </li>
            <li>
              <strong>&quot;Sesión&quot;</strong>: Consulta individual entre usuario y profesional
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">3. Servicios Ofrecidos</h2>
          <p>
            Miamente facilita la conexión entre usuarios y profesionales de la salud mental para
            realizar consultas virtuales. Nuestros servicios incluyen:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>Búsqueda y selección de profesionales certificados</li>
            <li>Reserva de citas virtuales</li>
            <li>Plataforma de videollamadas segura</li>
            <li>Sistema de pagos integrado</li>
            <li>Calificación y reseñas de profesionales</li>
          </ul>

          <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <h3 className="mb-2 font-semibold text-yellow-800 dark:text-yellow-200">
              ⚠️ Importante - No es Historia Clínica
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              En esta versión MVP, Miamente NO almacena ni gestiona historias clínicas. Los
              profesionales mantienen sus propios registros clínicos de acuerdo con sus protocolos y
              normativas profesionales.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">4. Registro y Cuentas</h2>
          <h3 className="mb-3 text-xl font-medium">4.1 Requisitos para Usuarios</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>Ser mayor de 18 años o tener autorización de un tutor legal</li>
            <li>Proporcionar información veraz y actualizada</li>
            <li>Mantener la confidencialidad de su cuenta</li>
            <li>Notificar inmediatamente cualquier uso no autorizado</li>
          </ul>

          <h3 className="mt-6 mb-3 text-xl font-medium">4.2 Requisitos para Profesionales</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>Estar debidamente certificado y colegiado en Colombia</li>
            <li>Presentar documentación que acredite su formación profesional</li>
            <li>Cumplir con los estándares éticos de su profesión</li>
            <li>Mantener seguros de responsabilidad profesional vigentes</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">5. Uso Aceptable</h2>
          <h3 className="mb-3 text-xl font-medium">5.1 Conductas Permitidas</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>Utilizar la plataforma para fines legítimos de salud mental</li>
            <li>Respetar la confidencialidad de las sesiones</li>
            <li>Proporcionar información veraz sobre su identidad</li>
            <li>Pagar los servicios contratados según los términos acordados</li>
          </ul>

          <h3 className="mt-6 mb-3 text-xl font-medium">5.2 Conductas Prohibidas</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>Usar la plataforma para actividades ilegales o no autorizadas</li>
            <li>Compartir credenciales de acceso con terceros</li>
            <li>Intentar acceder a cuentas de otros usuarios</li>
            <li>Publicar contenido ofensivo, difamatorio o inapropiado</li>
            <li>Interferir con el funcionamiento de la plataforma</li>
            <li>Realizar reservas falsas o fraudulentas</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">6. Tarifas y Pagos</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>Las tarifas de los servicios son establecidas por cada profesional</li>
            <li>Miamente cobra una comisión por facilitar la conexión</li>
            <li>Los pagos se procesan de forma segura a través de proveedores certificados</li>
            <li>Las cancelaciones están sujetas a las políticas de cada profesional</li>
            <li>Los reembolsos se procesan según las políticas de cancelación</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">7. Responsabilidades y Limitaciones</h2>
          <h3 className="mb-3 text-xl font-medium">7.1 Responsabilidades de Miamente</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>Proporcionar una plataforma segura y funcional</li>
            <li>Verificar la certificación de los profesionales</li>
            <li>Proteger la información personal de los usuarios</li>
            <li>Mantener la disponibilidad del servicio en la medida de lo posible</li>
          </ul>

          <h3 className="mt-6 mb-3 text-xl font-medium">7.2 Limitaciones de Responsabilidad</h3>
          <ul className="list-disc space-y-2 pl-6">
            <li>Miamente no proporciona servicios de salud mental directamente</li>
            <li>No garantizamos resultados específicos de las consultas</li>
            <li>No somos responsables por la calidad del servicio de los profesionales</li>
            <li>No garantizamos la disponibilidad continua del servicio</li>
            <li>Nuestra responsabilidad se limita al valor de los servicios pagados</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">8. Propiedad Intelectual</h2>
          <p>
            Todos los contenidos, marcas, logos y software de Miamente están protegidos por derechos
            de propiedad intelectual. Los usuarios no pueden:
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>Copiar, modificar o distribuir el contenido sin autorización</li>
            <li>Usar nuestras marcas o logos sin permiso</li>
            <li>Realizar ingeniería inversa del software</li>
            <li>Crear productos derivados basados en nuestra plataforma</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">9. Terminación</h2>
          <p>
            Cualquiera de las partes puede terminar el uso de la plataforma en cualquier momento.
            Miamente se reserva el derecho de suspender o terminar cuentas que violen estos
            términos.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">10. Modificaciones</h2>
          <p>
            Miamente puede modificar estos términos en cualquier momento. Los cambios serán
            notificados a través de la plataforma y entrarán en vigor inmediatamente después de su
            publicación.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">11. Ley Aplicable y Jurisdicción</h2>
          <p>
            Estos términos se rigen por las leyes de la República de Colombia. Cualquier disputa
            será resuelta por los tribunales competentes de Bogotá, Colombia.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">12. Contacto</h2>
          <p>Para consultas sobre estos términos y condiciones, puede contactarnos en:</p>
          <ul className="mt-4 list-none">
            <li>
              <strong>Email:</strong> legal@miamente.com
            </li>
            <li>
              <strong>Teléfono:</strong> +57 (1) XXX-XXXX
            </li>
            <li>
              <strong>Dirección:</strong> Bogotá, Colombia
            </li>
          </ul>
        </section>

        <div className="mt-12 rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Al utilizar Miamente, usted confirma que ha leído, entendido y acepta estos Términos y
            Condiciones de Uso.
          </p>
        </div>
      </div>
    </div>
  );
}
