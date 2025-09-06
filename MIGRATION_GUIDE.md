# Guía de Migración: Firebase a FastAPI + Railway + Vercel

Esta guía te ayudará a migrar tu plataforma Miamente de Firebase a una arquitectura moderna con FastAPI en Railway y Next.js en Vercel.

## 🏗️ Nueva Arquitectura

### Backend (FastAPI + Railway)

- **Framework**: FastAPI con Python 3.11+
- **Base de datos**: PostgreSQL
- **Cache**: Redis (opcional)
- **Autenticación**: JWT tokens
- **Email**: SendGrid
- **Deployment**: Railway

### Frontend (Next.js + Vercel)

- **Framework**: Next.js 15.5.2
- **Autenticación**: JWT tokens (sin Firebase Auth)
- **API Client**: Cliente personalizado para FastAPI
- **Deployment**: Vercel

## 📋 Pasos de Migración

### 1. Configurar el Backend (FastAPI)

#### 1.1 Instalar dependencias

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 1.2 Configurar variables de entorno

```bash
cp env.example .env
# Editar .env con tus configuraciones
```

#### 1.3 Configurar base de datos

```bash
# Crear base de datos PostgreSQL
createdb miamente

# Ejecutar migraciones
alembic upgrade head
```

#### 1.4 Ejecutar el servidor

```bash
uvicorn app.main:app --reload
```

### 2. Configurar el Frontend (Next.js)

#### 2.1 Instalar dependencias

```bash
cd apps/web
npm install
```

#### 2.2 Configurar variables de entorno

```bash
cp env.example .env.local
# Editar .env.local con tu URL de API
```

#### 2.3 Ejecutar el servidor de desarrollo

```bash
npm run dev
```

### 3. Migrar Datos (Opcional)

Si tienes datos existentes en Firebase, puedes usar el script de migración:

```bash
cd scripts
python migrate_firebase_to_postgres.py
```

**Nota**: Necesitarás configurar las credenciales de Firebase y ajustar el script según tu estructura de datos.

### 4. Deployment

#### 4.1 Backend en Railway

1. Conecta tu repositorio GitHub a Railway
2. Configura las variables de entorno en Railway:
   - `DATABASE_URL`
   - `SECRET_KEY`
   - `SENDGRID_API_KEY`
   - `BACKEND_CORS_ORIGINS`

3. Railway detectará automáticamente el proyecto Python y lo desplegará

#### 4.2 Frontend en Vercel

1. Conecta tu repositorio GitHub a Vercel
2. Configura las variables de entorno:
   - `NEXT_PUBLIC_API_URL` (URL de tu backend en Railway)

3. Vercel detectará automáticamente el proyecto Next.js y lo desplegará

## 🔄 Cambios Principales

### Autenticación

- **Antes**: Firebase Auth
- **Ahora**: JWT tokens con FastAPI

### Base de datos

- **Antes**: Firestore (NoSQL)
- **Ahora**: PostgreSQL (SQL)

### API

- **Antes**: Firebase Functions
- **Ahora**: FastAPI endpoints

### Frontend

- **Antes**: Firebase SDK
- **Ahora**: Cliente API personalizado

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

## 🚀 Endpoints de la API

### Autenticación

- `POST /api/v1/auth/register/user` - Registrar usuario
- `POST /api/v1/auth/register/professional` - Registrar profesional
- `POST /api/v1/auth/login/user` - Login usuario
- `POST /api/v1/auth/login/professional` - Login profesional
- `POST /api/v1/auth/refresh` - Renovar token

### Citas

- `POST /api/v1/appointments/book` - Reservar cita
- `GET /api/v1/appointments/` - Obtener citas del usuario
- `GET /api/v1/appointments/{id}` - Obtener cita específica
- `PUT /api/v1/appointments/{id}` - Actualizar cita
- `DELETE /api/v1/appointments/{id}` - Cancelar cita

### Profesionales

- `GET /api/v1/professionals/` - Listar profesionales
- `GET /api/v1/professionals/{id}` - Obtener profesional

### Disponibilidad

- `GET /api/v1/availability/professional/{id}` - Obtener disponibilidad
- `POST /api/v1/availability/` - Crear disponibilidad
- `POST /api/v1/availability/bulk` - Crear disponibilidad masiva

### Pagos

- `POST /api/v1/payments/intent` - Crear intención de pago
- `POST /api/v1/payments/confirm/{id}` - Confirmar pago

## 🔧 Configuración de Desarrollo

### Variables de Entorno Backend

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/miamente
SECRET_KEY=your-secret-key-here
SENDGRID_API_KEY=your-sendgrid-api-key
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Variables de Entorno Frontend

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🧪 Testing

### Backend

```bash
cd backend
pytest
```

### Frontend

```bash
cd apps/web
npm test
```

## 📚 Documentación

- **API Docs**: `http://localhost:8000/docs` (Swagger UI)
- **ReDoc**: `http://localhost:8000/redoc`

## 🆘 Solución de Problemas

### Error de CORS

Asegúrate de que `BACKEND_CORS_ORIGINS` incluya tu dominio frontend.

### Error de Base de Datos

Verifica que la URL de la base de datos sea correcta y que PostgreSQL esté ejecutándose.

### Error de Autenticación

Verifica que `SECRET_KEY` esté configurado y sea consistente.

## 🎯 Próximos Pasos

1. **Migrar datos existentes** (si aplica)
2. **Configurar dominio personalizado**
3. **Implementar monitoreo y logs**
4. **Configurar CI/CD**
5. **Optimizar rendimiento**

## 📞 Soporte

Si encuentras problemas durante la migración, revisa:

1. Los logs del backend en Railway
2. Los logs del frontend en Vercel
3. La documentación de la API en `/docs`
4. Los archivos de configuración de entorno
