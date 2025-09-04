# Miamente Monorepo (MVP)

## Estructura

- apps/web: Next.js App Router + Tailwind + shadcn/ui + next-intl (es/en)
- functions: Firebase Functions (Node 20, TypeScript, ESM)

## Requisitos

- nvm (Node v22)
- Firebase CLI instalado

## Instalación

- Ejecuta: nvm use
- Ejecuta: npm install

## Desarrollo

- Ejecuta la web: npm run dev
- Lint: npm run lint
- Typecheck: npm run typecheck
- Build: npm run build

## Emuladores Firebase

- Inicia emuladores: npm run emulators
- Incluye: Functions (5001), Firestore (8080), Storage (9199), Auth (9099) y UI

## Entorno

- Configura variables en `apps/web/.env.local` (claves públicas)
- Secretos en CI/CD (Firebase service account y project id)

## Contribución

- Usa la plantilla de PR en `.github/pull_request_template.md`
- CODEOWNERS en `.github/CODEOWNERS`
- Issues con plantillas en `.github/ISSUE_TEMPLATE`
