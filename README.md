# Miamente Monorepo (MVP)

[![CI/CD Pipeline](https://github.com/manueljurado/miamente_platform/actions/workflows/ci.yml/badge.svg)](https://github.com/manueljurado/miamente_platform/actions/workflows/ci.yml)

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

### Variables de Seguridad Requeridas

```bash
# App Check con reCAPTCHA Enterprise
NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY=your_site_key

# Firebase Configuration
NEXT_PUBLIC_FB_API_KEY=your_api_key
NEXT_PUBLIC_FB_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FB_PROJECT_ID=your_project_id
NEXT_PUBLIC_FB_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FB_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FB_APP_ID=your_app_id
NEXT_PUBLIC_FB_MEASUREMENT_ID=your_measurement_id
```

## Seguridad

### Características de Seguridad Implementadas

- **App Check**: Integración con reCAPTCHA Enterprise para prevenir abuso
- **Reglas de Seguridad**: Firestore y Storage con control de acceso granular
- **Rate Limiting**: Limitación de velocidad en Functions HTTPS
- **RBAC**: Control de acceso basado en roles (user/pro/admin)
- **Pruebas de Seguridad**: Tests negativos para validar restricciones
- **Logging**: Registro completo de eventos de seguridad

### Documentación de Seguridad

- [SECURITY.md](./SECURITY.md) - Documentación completa de seguridad
- [APP_CHECK_SETUP.md](./docs/APP_CHECK_SETUP.md) - Guía de configuración de App Check
- [Tests de Seguridad](./apps/web/src/app/__tests__/security-negative.test.tsx) - Pruebas negativas

### Checklist de Seguridad Pre-Deployment

- [ ] App Check configurado con reCAPTCHA Enterprise
- [ ] Reglas de Firestore desplegadas y probadas
- [ ] Reglas de Storage desplegadas y probadas
- [ ] Rate limiting configurado y probado
- [ ] Tests de seguridad pasando
- [ ] Variables de entorno seguras
- [ ] HTTPS habilitado
- [ ] CORS configurado correctamente

## 🚀 Deployment

### Environments

- **Staging**: `miamente-staging` - Auto-deploy on push to `dev` branch
- **Production**: `miamente-prod` - Auto-deploy on release tags `v*`

### Manual Deployment

```bash
# Go to Actions tab in GitHub
# Click "Deploy to Firebase" workflow
# Click "Run workflow"
# Select environment and run
```

### Emergency Rollback

```bash
# Using GitHub Actions (Recommended)
# Go to Actions > Emergency Rollback
# Select environment and version
# Type "ROLLBACK" to confirm

# Using local script
./scripts/rollback.sh staging
./scripts/rollback.sh production v1.0.0
```

### Setup Documentation

📖 **[Complete Deployment Setup Guide](docs/DEPLOYMENT_SETUP.md)**

## Contribución

- Usa la plantilla de PR en `.github/pull_request_template.md`
- CODEOWNERS en `.github/CODEOWNERS`
- Issues con plantillas en `.github/ISSUE_TEMPLATE`
