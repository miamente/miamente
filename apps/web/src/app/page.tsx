import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold text-balance sm:text-5xl">
          Bienestar mental al alcance de todos
        </h1>
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
          Plataforma diseñada para transformar tu bienestar emocional.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/signup">
            <Button size="lg">Crear cuenta</Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Conecta</CardTitle>
          </CardHeader>
          <CardContent>
            Accede a especialistas en psicología, psiquiatría y neuropsicología.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Aprende</CardTitle>
          </CardHeader>
          <CardContent>Herramientas prácticas basadas en evidencia científica.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Apóyate</CardTitle>
          </CardHeader>
          <CardContent>Un acompañante emocional (IA) que te escucha y orienta.</CardContent>
        </Card>
      </section>
    </div>
  );
}
