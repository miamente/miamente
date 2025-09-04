import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-8 text-sm text-neutral-600 dark:text-neutral-400">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div>
            <h3 className="mb-3 font-semibold text-neutral-900 dark:text-neutral-100">Miamente</h3>
            <p className="text-sm">
              Conectamos usuarios con profesionales de la salud mental para sesiones virtuales
              seguras y confidenciales.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-3 font-semibold text-neutral-900 dark:text-neutral-100">Servicios</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/professionals"
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Buscar Profesionales
                </Link>
              </li>
              <li>
                <Link href="/landing" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Cómo Funciona
                </Link>
              </li>
              <li>
                <Link href="/status" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Estado del Sistema
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-3 font-semibold text-neutral-900 dark:text-neutral-100">Soporte</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:soporte@miamente.com"
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  soporte@miamente.com
                </a>
              </li>
              <li>
                <a href="tel:+57123456789" className="hover:text-blue-600 dark:hover:text-blue-400">
                  +57 (1) 234-5678
                </a>
              </li>
              <li>
                <span className="text-xs">Lunes a Viernes, 8:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 font-semibold text-neutral-900 dark:text-neutral-100">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <a
                  href="mailto:legal@miamente.com"
                  className="hover:text-blue-600 dark:hover:text-blue-400"
                >
                  legal@miamente.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between border-t pt-6 md:flex-row">
          <div className="text-center md:text-left">
            © {new Date().getFullYear()} Miamente S.A.S. Todos los derechos reservados.
          </div>
          <div className="mt-4 text-center md:mt-0 md:text-right">
            <span className="text-xs">
              Cumplimiento: Ley 1581 de 2012 - Protección de Datos Personales
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
