"use client";
import Link from "next/link";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalytics } from "@/hooks/useAnalytics";

export default function LandingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const { trackCTAClick } = useAnalytics();

  const handleCTAClick = (ctaType: string) => {
    trackCTAClick(ctaType, {
      page: "landing",
      timestamp: new Date().toISOString(),
    });
  };

  const faqs = [
    {
      id: 1,
      question: "¿Cómo funciona Miamente?",
      answer:
        "Miamente conecta usuarios con profesionales de la salud mental certificados para sesiones virtuales. Simplemente busca un profesional, reserva tu cita y conéctate desde la comodidad de tu hogar.",
    },
    {
      id: 2,
      question: "¿Los profesionales están certificados?",
      answer:
        "Sí, todos nuestros profesionales están debidamente certificados y colegiados en Colombia. Verificamos sus credenciales antes de permitirles ofrecer servicios en la plataforma.",
    },
    {
      id: 3,
      question: "¿Es seguro y confidencial?",
      answer:
        "Absolutamente. Utilizamos tecnología de videollamadas segura y encriptada. Los profesionales mantienen sus propios registros clínicos según sus protocolos profesionales.",
    },
    {
      id: 4,
      question: "¿Cuánto cuesta una sesión?",
      answer:
        "Los precios varían según el profesional y tipo de sesión. Cada profesional establece sus propias tarifas, que puedes ver antes de reservar tu cita.",
    },
    {
      id: 5,
      question: "¿Puedo cancelar o reprogramar mi cita?",
      answer:
        "Sí, puedes cancelar o reprogramar tu cita según las políticas de cada profesional. Estas políticas se muestran claramente antes de confirmar tu reserva.",
    },
    {
      id: 6,
      question: "¿Qué necesito para una sesión?",
      answer:
        "Solo necesitas una conexión a internet estable, un dispositivo con cámara y micrófono (computador, tablet o smartphone) y un espacio privado para tu sesión.",
    },
  ];

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-5xl font-bold text-gray-900 md:text-6xl dark:text-white">
            Cuidamos tu
            <span className="text-blue-600 dark:text-blue-400"> bienestar mental</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            Conecta con profesionales de la salud mental certificados para sesiones virtuales
            seguras y confidenciales desde la comodidad de tu hogar.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => handleCTAClick("hero_register")}
              >
                Crear cuenta gratis
              </Button>
            </Link>
            <Link href="/professionals">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => handleCTAClick("hero_browse")}
              >
                Ver profesionales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="bg-white py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
              ¿Por qué elegir Miamente?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Ofrecemos una plataforma segura, confiable y fácil de usar para tu bienestar mental
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <svg
                    className="h-8 w-8 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <CardTitle>Profesionales Certificados</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Todos nuestros profesionales están debidamente certificados y colegiados en
                  Colombia, con especialidades en diferentes áreas de la salud mental.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <svg
                    className="h-8 w-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <CardTitle>100% Seguro y Confidencial</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Utilizamos tecnología de videollamadas encriptada y cumplimos con todas las
                  normativas de protección de datos personales.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                  <svg
                    className="h-8 w-8 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <CardTitle>Acceso Inmediato</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Reserva tu cita en minutos y conéctate desde cualquier lugar. Sin desplazamientos,
                  sin esperas, solo atención de calidad.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
              ¿Cómo funciona?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              En solo 3 pasos puedes comenzar tu camino hacia el bienestar mental
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Crea tu cuenta
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Regístrate de forma gratuita y completa tu perfil. El proceso toma menos de 2
                minutos.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Encuentra tu profesional
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Explora nuestra red de profesionales certificados, lee sus perfiles y elige el que
                mejor se adapte a tus necesidades.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Reserva y conéctate
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Selecciona el horario que prefieras, realiza el pago de forma segura y conéctate a
                tu sesión virtual.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="bg-blue-600 py-16 dark:bg-blue-700">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 text-center text-white md:grid-cols-4">
            <div>
              <div className="mb-2 text-4xl font-bold">500+</div>
              <div className="text-blue-100">Profesionales certificados</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">10,000+</div>
              <div className="text-blue-100">Sesiones realizadas</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">4.8/5</div>
              <div className="text-blue-100">Calificación promedio</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold">24/7</div>
              <div className="text-blue-100">Disponibilidad</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
              Preguntas Frecuentes
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Resolvemos las dudas más comunes sobre nuestros servicios
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            {faqs.map((faq) => (
              <div key={faq.id} className="mb-4">
                <button
                  className="w-full rounded-lg bg-gray-50 p-6 text-left transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={expandedFaq === faq.id}
                  aria-controls={`faq-answer-${faq.id}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {faq.question}
                    </h3>
                    <svg
                      className={`h-5 w-5 text-gray-500 transition-transform ${
                        expandedFaq === faq.id ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>
                {expandedFaq === faq.id && (
                  <div
                    id={`faq-answer-${faq.id}`}
                    className="border-t border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900"
                  >
                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            ¿Listo para comenzar tu bienestar mental?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">
            Únete a miles de personas que ya están cuidando su salud mental con Miamente
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => handleCTAClick("final_register")}
              >
                Crear cuenta gratis
              </Button>
            </Link>
            <Link href="/professionals">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white text-white hover:bg-white hover:text-blue-600 sm:w-auto"
                onClick={() => handleCTAClick("final_browse")}
              >
                Explorar profesionales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
