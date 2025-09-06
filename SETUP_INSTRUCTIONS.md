# Instrucciones de Configuración - Miamente Platform

## 🎉 ¡Migración Completada!

Tu plataforma Miamente ha sido migrada exitosamente de Firebase a una arquitectura moderna con **FastAPI + PostgreSQL + Railway** para el backend y **Next.js + Vercel** para el frontend.

## 📋 Configuración Requerida

### 1. Backend (FastAPI + PostgreSQL)

#### Variables de Entorno

Crea un archivo `.env` en el directorio `backend/` con el siguiente contenido:

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
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Server
DEBUG=true
ALLOWED_HOSTS=localhost,127.0.0.1,*.railway.app,*.vercel.app
```

#### Configuración de Base de Datos

1. Instala PostgreSQL en tu sistema
2. Crea la base de datos:
   ```bash
   createdb miamente
   ```
3. Ejecuta las migraciones:
   ```bash
   cd backend
   source venv/bin/activate
   alembic upgrade head
   ```

#### Ejecutar el Backend

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### 2. Frontend (Next.js)

#### Variables de Entorno

Crea un archivo `.env.local` en el directorio `apps/web/` con el siguiente contenido:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# For production, use your Railway backend URL:
# NEXT_PUBLIC_API_URL=https://your-app-name.railway.app
```

#### Ejecutar el Frontend

```bash
cd apps/web
npm install
npm run dev
```

## 🚀 URLs de Desarrollo

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📁 Estructura del Proyecto

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
└── scripts/               # Scripts de migración
```

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
```

## 🌐 Deployment

### Railway (Backend)

1. Conecta tu repositorio GitHub a Railway
2. Configura las variables de entorno en Railway
3. Railway detectará automáticamente el proyecto Python

### Vercel (Frontend)

1. Conecta tu repositorio GitHub a Vercel
2. Configura la variable `NEXT_PUBLIC_API_URL` con tu URL de Railway
3. Vercel detectará automáticamente el proyecto Next.js

## 📚 Documentación

- **Guía de migración completa**: `MIGRATION_GUIDE.md`
- **API Docs**: Disponible en `/docs` cuando ejecutes el backend
- **Script de inicio rápido**: `./start-migration.sh`

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

## 🎯 Próximos Pasos

1. **Configurar variables de entorno** según las instrucciones
2. **Ejecutar las migraciones** de base de datos
3. **Probar la aplicación** en desarrollo
4. **Configurar deployment** en Railway y Vercel
5. **Migrar datos existentes** (si aplica) usando el script de migración

¡Tu plataforma está lista para funcionar con la nueva arquitectura! 🚀
