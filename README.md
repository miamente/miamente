# Miamente Platform

[![CI/CD Pipeline](https://github.com/manueljurado/miamente_platform/actions/workflows/ci.yml/badge.svg)](https://github.com/manueljurado/miamente_platform/actions/workflows/ci.yml)

## 🎉 ¡Migración Completada!

Tu plataforma Miamente ha sido migrada exitosamente de Firebase a una arquitectura moderna con **FastAPI + PostgreSQL** para el backend y **Next.js** para el frontend.

## 📋 Estructura del Proyecto

```
miamente_platform/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Configuración
│   │   ├── models/         # Modelos de base de datos
│   │   ├── schemas/        # Esquemas Pydantic
│   │   └── services/       # Lógica de negocio
│   ├── alembic/            # Migraciones de DB
│   └── requirements.txt
├── apps/web/               # Next.js frontend
│   ├── src/
│   │   ├── lib/           # Cliente API
│   │   ├── hooks/         # React hooks
│   │   ├── contexts/      # React contexts
│   │   └── components/    # Componentes UI
│   └── package.json
```

## 🚀 Inicio Rápido

### Requisitos

- **Node.js v22** (usar `nvm use v22`)
- **Python 3.12+**
- **PostgreSQL**
- **Git**

### 1. Configuración del Backend (FastAPI + PostgreSQL)

#### Variables de Entorno

Crea un archivo `.env` en el directorio `backend/`:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/miamente

# JWT
SECRET_KEY=your-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=10080
REFRESH_TOKEN_EXPIRE_MINUTES=43200

# Email (SendGrid) - Optional for development
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@miamente.com
SENDGRID_FROM_NAME=Miamente

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000", "http://localhost:3001"]

# Server
DEBUG=true
ALLOWED_HOSTS=["localhost", "127.0.0.1"]
```

#### Configuración de Base de Datos

1. **Instala PostgreSQL** en tu sistema
2. **Crea la base de datos**:
   ```bash
   createdb miamente
   ```
3. **Ejecuta las migraciones**:
   ```bash
   cd backend
   source venv/bin/activate
   alembic upgrade head
   ```

#### Ejecutar el Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Configuración del Frontend (Next.js)

#### Variables de Entorno

Crea un archivo `.env.local` en el directorio `apps/web/`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8001

# For production, use your backend URL:
# NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

#### Ejecutar el Frontend

```bash
cd apps/web
nvm use v22
npm install
npm run dev
```

## 🌐 URLs de Desarrollo

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **Documentación API**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

## 🔧 Comandos Útiles

### Backend

```bash
# Instalar dependencias
cd backend && pip install -r requirements.txt

# Ejecutar migraciones
alembic upgrade head

# Crear nueva migración
alembic revision --autogenerate -m "Description"

# Ejecutar tests
pytest

# Formatear código
black .
isort .
```

### Frontend

```bash
# Instalar dependencias
cd apps/web && npm install

# Ejecutar tests
npm test

# Formatear código
npm run format

# Verificar tipos
npm run typecheck

# Lint
npm run lint

# Build
npm run build
```

### 3. Configuración de Tests E2E

#### Variables de Entorno para Tests

Los tests E2E utilizan la variable de entorno `E2E_TEST_PASSWORD` para las credenciales de prueba:

```bash
# Test password para tests E2E (usado para todas las cuentas de prueba)
E2E_TEST_PASSWORD=TestPassword123!

# Opcional: URL base para tests
PLAYWRIGHT_BASE_URL=http://localhost:3000

# Opcional: Modo CI (habilita reintentos, worker único)
CI=false
```

#### Ejecutar Tests E2E

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar tests con UI (modo interactivo)
npm run test:e2e:ui

# Ejecutar tests en modo headed (ver navegador)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# Ver reporte de tests
npm run test:e2e:report
```

**Nota**: Los tests E2E utilizan la variable `E2E_TEST_PASSWORD` para todas las cuentas de prueba (usuarios regulares y profesionales). Puedes personalizar esto creando un archivo `.env` en el directorio `tests/e2e/` o configurando la variable de entorno.

## 🚀 Deployment

### Backend Deployment

1. Configura tu plataforma de despliegue preferida (AWS, Google Cloud, Azure, etc.)
2. Configura las variables de entorno en tu plataforma
3. Configura la aplicación FastAPI

### Frontend Deployment

1. Configura tu plataforma de despliegue preferida (AWS S3+CloudFront, Netlify, etc.)
2. Configura la variable `NEXT_PUBLIC_API_URL` con tu URL de backend
3. Configura el build del proyecto Next.js

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

# Rollback functionality will be implemented for FastAPI/PostgreSQL architecture
# when needed for production deployments
```

## 🔒 Seguridad

### Características de Seguridad Implementadas

- **JWT Authentication**: Autenticación basada en tokens JWT
- **CORS Configuration**: Configuración de CORS para seguridad
- **Rate Limiting**: Limitación de velocidad en endpoints
- **RBAC**: Control de acceso basado en roles (user/pro/admin)
- **Input Validation**: Validación de entrada con Pydantic
- **SQL Injection Protection**: Protección con SQLAlchemy ORM

### Checklist de Seguridad Pre-Deployment

- [ ] Variables de entorno seguras configuradas
- [ ] HTTPS habilitado en producción
- [ ] CORS configurado correctamente
- [ ] Rate limiting configurado y probado
- [ ] Tests de seguridad pasando
- [ ] Base de datos con credenciales seguras

## 🆘 Solución de Problemas

### Error de Base de Datos

- Verifica que PostgreSQL esté ejecutándose
- Confirma que la URL de la base de datos sea correcta
- Asegúrate de que la base de datos `miamente` exista

### Error de CORS

- Verifica que `BACKEND_CORS_ORIGINS` incluya tu dominio frontend
- Confirma que `NEXT_PUBLIC_API_URL` apunte al backend correcto

### Error de Autenticación

- Verifica que `SECRET_KEY` esté configurado
- Confirma que los tokens JWT sean válidos

### Error de Node.js

- Asegúrate de usar Node.js v22: `nvm use v22`
- Verifica que las dependencias estén instaladas: `npm install`

## 📚 Documentación Adicional

- **Guía de migración completa**: `MIGRATION_GUIDE.md`
- **API Docs**: Disponible en `/docs` cuando ejecutes el backend
- **Script de inicio rápido**: `./start-migration.sh`
- **Setup detallado**: `SETUP_INSTRUCTIONS.md`

## 🎯 Próximos Pasos

1. **Configurar variables de entorno** según las instrucciones
2. **Ejecutar las migraciones** de base de datos
3. **Probar la aplicación** en desarrollo
4. **Configurar deployment** en tus plataformas de backend y frontend preferidas
5. **Migrar datos existentes** (si aplica) usando el script de migración

## 🤝 Contribución

- Usa la plantilla de PR en `.github/pull_request_template.md`
- CODEOWNERS en `.github/CODEOWNERS`
- Issues con plantillas en `.github/ISSUE_TEMPLATE`

---

¡Tu plataforma está lista para funcionar con la nueva arquitectura! 🚀
