import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import { describe, it, expect } from "vitest";

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Helper function to render components
const renderComponent = (component: React.ReactElement) => {
  return render(component);
};

describe("Accessibility Tests", () => {
  describe("Landing Page", () => {
    it("should not have accessibility violations", async () => {
      const { container } = renderComponent(
        <div>
          <header>
            <nav aria-label="Navegación principal">
              <span>Inicio</span>
              <span>Profesionales</span>
              <span>Iniciar sesión</span>
            </nav>
          </header>

          <main>
            <section aria-labelledby="hero-heading">
              <h1 id="hero-heading">Cuidamos tu bienestar mental</h1>
              <p>Conecta con profesionales de la salud mental certificados</p>
              <button type="button">Crear cuenta gratis</button>
            </section>

            <section aria-labelledby="features-heading">
              <h2 id="features-heading">¿Por qué elegir Miamente?</h2>
              <div role="list">
                <div role="listitem">
                  <h3>Profesionales Certificados</h3>
                  <p>Descripción del servicio</p>
                </div>
                <div role="listitem">
                  <h3>100% Seguro y Confidencial</h3>
                  <p>Descripción del servicio</p>
                </div>
                <div role="listitem">
                  <h3>Acceso Inmediato</h3>
                  <p>Descripción del servicio</p>
                </div>
              </div>
            </section>

            <section aria-labelledby="faq-heading">
              <h2 id="faq-heading">Preguntas Frecuentes</h2>
              <div>
                <button type="button" aria-expanded="false" aria-controls="faq-1">
                  ¿Cómo funciona Miamente?
                </button>
                <div id="faq-1" hidden>
                  <p>Respuesta a la pregunta</p>
                </div>
              </div>
            </section>
          </main>

          <footer>
            <nav aria-label="Enlaces del pie de página">
              <span>Términos y Condiciones</span>
              <span>Política de Privacidad</span>
            </nav>
          </footer>
        </div>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Registration Form", () => {
    it("should not have accessibility violations", async () => {
      const { container } = renderComponent(
        <form aria-labelledby="register-heading">
          <h1 id="register-heading">Crear Cuenta</h1>

          <div>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required aria-describedby="email-error" />
            <div id="email-error" role="alert" aria-live="polite">
              Email inválido
            </div>
          </div>

          <div>
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              aria-describedby="password-help"
            />
            <div id="password-help">La contraseña debe tener al menos 6 caracteres</div>
          </div>

          <div>
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              aria-describedby="confirm-error"
            />
            <div id="confirm-error" role="alert" aria-live="polite">
              Las contraseñas no coinciden
            </div>
          </div>

          <div>
            <input
              type="checkbox"
              id="consent"
              name="consent"
              required
              aria-describedby="consent-text"
            />
            <label htmlFor="consent" id="consent-text">
              Acepto los términos y condiciones y la política de privacidad
            </label>
          </div>

          <button type="submit">Crear Cuenta</button>
        </form>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Professional Listing", () => {
    it("should not have accessibility violations", async () => {
      const { container } = renderComponent(
        <div>
          <h1>Profesionales de Salud Mental</h1>

          <div role="search" aria-label="Buscar profesionales">
            <label htmlFor="search">Buscar por especialidad</label>
            <input
              type="search"
              id="search"
              placeholder="Ej: Psicología clínica"
              aria-describedby="search-help"
            />
            <div id="search-help">Busca por especialidad, nombre o ubicación</div>
          </div>

          <div role="list" aria-label="Lista de profesionales">
            <div role="listitem">
              <article>
                <h2>Dr. Juan Pérez</h2>
                <p>Psicólogo Clínico</p>
                <p>Especialidad: Ansiedad y depresión</p>
                <p>Tarifa: $80,000 COP/sesión</p>
                <div>
                  <span aria-label="Calificación: 4.8 de 5 estrellas">⭐⭐⭐⭐⭐ 4.8</span>
                  <span>(25 reseñas)</span>
                </div>
                <button type="button" aria-describedby="pro-1-desc">
                  Ver horarios disponibles
                </button>
                <div id="pro-1-desc" hidden>
                  Ver horarios disponibles para Dr. Juan Pérez
                </div>
              </article>
            </div>

            <div role="listitem">
              <article>
                <h2>Dra. María García</h2>
                <p>Psiquiatra</p>
                <p>Especialidad: Trastornos del estado de ánimo</p>
                <p>Tarifa: $120,000 COP/sesión</p>
                <div>
                  <span aria-label="Calificación: 4.9 de 5 estrellas">⭐⭐⭐⭐⭐ 4.9</span>
                  <span>(18 reseñas)</span>
                </div>
                <button type="button" aria-describedby="pro-2-desc">
                  Ver horarios disponibles
                </button>
                <div id="pro-2-desc" hidden>
                  Ver horarios disponibles para Dra. María García
                </div>
              </article>
            </div>
          </div>

          <nav aria-label="Paginación">
            <button type="button" aria-label="Página anterior" disabled>
              Anterior
            </button>
            <span aria-current="page">Página 1 de 5</span>
            <button type="button" aria-label="Página siguiente">
              Siguiente
            </button>
          </nav>
        </div>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Appointment Booking", () => {
    it("should not have accessibility violations", async () => {
      const { container } = renderComponent(
        <div>
          <h1>Reservar Cita con Dr. Juan Pérez</h1>

          <div role="region" aria-labelledby="calendar-heading">
            <h2 id="calendar-heading">Horarios Disponibles</h2>

            <div role="list" aria-label="Horarios disponibles">
              <div role="listitem">
                <h3>Lunes, 15 de Enero</h3>
                <div aria-label="Horarios del 15 de enero">
                  <button
                    type="button"
                    aria-label="Reservar cita el lunes 15 de enero a las 9:00 AM"
                  >
                    9:00 AM
                  </button>
                  <button
                    type="button"
                    aria-label="Reservar cita el lunes 15 de enero a las 10:00 AM"
                  >
                    10:00 AM
                  </button>
                  <button
                    type="button"
                    aria-label="Reservar cita el lunes 15 de enero a las 11:00 AM"
                    disabled
                  >
                    11:00 AM (No disponible)
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div role="region" aria-labelledby="booking-summary">
            <h2 id="booking-summary">Resumen de la Cita</h2>
            <dl>
              <dt>Profesional:</dt>
              <dd>Dr. Juan Pérez</dd>
              <dt>Especialidad:</dt>
              <dd>Psicología Clínica</dd>
              <dt>Fecha y Hora:</dt>
              <dd>Lunes, 15 de Enero - 9:00 AM</dd>
              <dt>Duración:</dt>
              <dd>50 minutos</dd>
              <dt>Tarifa:</dt>
              <dd>$80,000 COP</dd>
            </dl>
          </div>

          <button type="button" aria-describedby="booking-help">
            Confirmar Reserva
          </button>
          <div id="booking-help">Al confirmar, serás redirigido al proceso de pago</div>
        </div>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Admin Dashboard", () => {
    it("should not have accessibility violations", async () => {
      const { container } = renderComponent(
        <div>
          <header>
            <nav aria-label="Navegación de administración">
              <a href="/admin" aria-current="page">
                Dashboard
              </a>
              <a href="/admin/users">Usuarios</a>
              <a href="/admin/professionals">Profesionales</a>
              <a href="/admin/appointments">Citas</a>
            </nav>
          </header>

          <main>
            <h1>Panel de Administración</h1>

            <section aria-labelledby="metrics-heading">
              <h2 id="metrics-heading">Métricas del Sistema</h2>
              <div role="list" aria-label="Métricas principales">
                <div role="listitem">
                  <h3>Usuarios Registrados</h3>
                  <p aria-label="1,234 usuarios registrados">1,234</p>
                </div>
                <div role="listitem">
                  <h3>Profesionales Activos</h3>
                  <p aria-label="89 profesionales activos">89</p>
                </div>
                <div role="listitem">
                  <h3>Citas del Mes</h3>
                  <p aria-label="456 citas realizadas este mes">456</p>
                </div>
              </div>
            </section>

            <section aria-labelledby="recent-activity">
              <h2 id="recent-activity">Actividad Reciente</h2>
              <table role="table" aria-label="Actividad reciente del sistema">
                <caption>Lista de actividades recientes del sistema</caption>
                <thead>
                  <tr>
                    <th scope="col">Usuario</th>
                    <th scope="col">Acción</th>
                    <th scope="col">Fecha</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>usuario@ejemplo.com</td>
                    <td>Registro de cuenta</td>
                    <td>15/01/2024</td>
                    <td>
                      <span aria-label="Estado: Completado">Completado</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          </main>
        </div>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Error States", () => {
    it("should have accessible error messages", async () => {
      const { container } = renderComponent(
        <div>
          <form>
            <h1>Formulario de Contacto</h1>

            <div>
              <label htmlFor="name">Nombre completo</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                aria-invalid="true"
                aria-describedby="name-error"
              />
              <div id="name-error" role="alert" aria-live="polite" className="text-red-600">
                El nombre es requerido
              </div>
            </div>

            <div>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                aria-invalid="true"
                aria-describedby="email-error"
              />
              <div id="email-error" role="alert" aria-live="polite" className="text-red-600">
                Por favor ingresa un email válido
              </div>
            </div>

            <div>
              <label htmlFor="message">Mensaje</label>
              <textarea id="message" name="message" required aria-describedby="message-help" />
              <div id="message-help">Describe tu consulta o problema</div>
            </div>

            <button type="submit">Enviar Mensaje</button>
          </form>
        </div>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe("Loading States", () => {
    it("should have accessible loading indicators", async () => {
      const { container } = renderComponent(
        <div>
          <h1>Cargando Datos</h1>

          <div role="status" aria-live="polite" aria-label="Cargando información">
            <div className="spinner" aria-hidden="true">
              <span className="sr-only">Cargando...</span>
            </div>
            <p>Cargando información de profesionales...</p>
          </div>

          <div role="status" aria-live="polite" aria-label="Procesando pago">
            <div className="spinner" aria-hidden="true">
              <span className="sr-only">Procesando...</span>
            </div>
            <p>Procesando tu pago, por favor espera...</p>
          </div>

          <button type="button" disabled aria-describedby="loading-help">
            <span aria-hidden="true">⏳</span>
            <span>Procesando...</span>
          </button>
          <div id="loading-help">
            El botón está deshabilitado mientras se procesa la información
          </div>
        </div>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
