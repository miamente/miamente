# 🚀 Railway Development Environment Setup

## 📋 Configuración de Ambientes de Desarrollo

### 🎯 Ambientes Configurados

| Ambiente | Branch | URL | Propósito |
|----------|--------|-----|-----------|
| **Development** | `develop` | `https://miamente-dev.railway.app` | Testing de features |
| **Staging** | `staging` | `https://miamente-staging.railway.app` | Testing completo + E2E |
| **Production** | `main` | `https://miamente.railway.app` | Producción |

## 🛠️ Configuración Paso a Paso

### 1. **Configurar Railway CLI**

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login a Railway
railway login

# Crear proyecto
railway init
```

### 2. **Configurar Ambientes**

```bash
# Crear ambientes
railway environment create development
railway environment create staging  
railway environment create production

# Cambiar a ambiente de desarrollo
railway environment set development
```

### 3. **Configurar Variables de Entorno**

#### **Para Development:**
```bash
# Database
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Security
SECRET_KEY=dev-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
REFRESH_TOKEN_EXPIRE_MINUTES=43200

# CORS (Development - Allow all)
BACKEND_CORS_ORIGINS=*
ALLOWED_HOSTS=*

# Application
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=DEBUG

# Frontend
NEXT_PUBLIC_API_URL=https://miamente-backend-dev.railway.app
NEXT_PUBLIC_ENVIRONMENT=development

# Server
SERVER_NAME=miamente-dev.railway.app
SERVER_HOST=https://miamente-dev.railway.app
```

#### **Para Staging:**
```bash
# Database
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Security
SECRET_KEY=staging-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
REFRESH_TOKEN_EXPIRE_MINUTES=43200

# CORS (Staging - Specific URLs)
BACKEND_CORS_ORIGINS=https://miamente-staging.railway.app,https://miamente-frontend-staging.railway.app
ALLOWED_HOSTS=miamente-staging.railway.app,miamente-backend-staging.railway.app

# Application
ENVIRONMENT=staging
DEBUG=false
LOG_LEVEL=INFO

# Frontend
NEXT_PUBLIC_API_URL=https://miamente-backend-staging.railway.app
NEXT_PUBLIC_ENVIRONMENT=staging

# Server
SERVER_NAME=miamente-staging.railway.app
SERVER_HOST=https://miamente-staging.railway.app
```

#### **Para Production:**
```bash
# Database
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Security
SECRET_KEY=production-secret-key-super-secure
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
REFRESH_TOKEN_EXPIRE_MINUTES=43200

# CORS (Production - Specific URLs)
BACKEND_CORS_ORIGINS=https://miamente.com,https://www.miamente.com
ALLOWED_HOSTS=miamente.com,www.miamente.com,miamente-backend.railway.app

# Application
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=WARNING

# Frontend
NEXT_PUBLIC_API_URL=https://miamente-backend.railway.app
NEXT_PUBLIC_ENVIRONMENT=production

# Server
SERVER_NAME=miamente.com
SERVER_HOST=https://miamente.com
```

## 🔄 Workflow de Desarrollo

### **1. Desarrollo Local**
```bash
# Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Frontend
cd apps/web
nvm use v22
npm run dev
```

### **2. Deploy a Development**
```bash
# Cambiar a ambiente development
railway environment set development

# Deploy manual
railway up

# Ver logs
railway logs
```

### **3. Deploy a Staging**
```bash
# Merge a staging branch
git checkout staging
git merge develop
git push origin staging

# Railway automáticamente deploya a staging
# + E2E tests completos se ejecutan
```

### **4. Deploy a Production**
```bash
# Merge a main branch
git checkout main
git merge staging
git push origin main

# Railway automáticamente deploya a production
# + Smoke tests se ejecutan
```

## 🧪 Testing por Ambiente

### **Development:**
- ✅ Unit tests
- ✅ Integration tests
- ✅ Lint, format, type check
- ❌ NO E2E (no hay ambiente estable)

### **Staging:**
- ✅ E2E tests COMPLETOS (10-20 min)
- ✅ Tests de flujos críticos
- ✅ Tests de regresión
- ✅ Tests de integración frontend-backend

### **Production:**
- ✅ Smoke tests RÁPIDOS (2-3 min)
- ✅ Health checks
- ✅ Login básico
- ✅ Páginas críticas cargan

## 🔧 Comandos Útiles

```bash
# Ver estado de servicios
railway status

# Ver logs en tiempo real
railway logs --follow

# Conectar a base de datos
railway connect Postgres

# Ver variables de entorno
railway variables

# Cambiar ambiente
railway environment set development

# Deploy manual
railway up

# Ver métricas
railway metrics
```

## 🚨 Troubleshooting

### **Backend no inicia:**
- Verificar `DATABASE_URL` en variables de entorno
- Verificar que `uvicorn` esté en requirements
- Revisar logs: `railway logs --service miamente-backend`

### **Frontend no conecta al backend:**
- Verificar `NEXT_PUBLIC_API_URL`
- Verificar CORS en backend
- Verificar que ambos servicios estén online

### **Base de datos no conecta:**
- Verificar `DATABASE_URL`
- Verificar que PostgreSQL esté ejecutándose
- Revisar logs: `railway logs --service miamente-database`

## 📊 Costos Estimados

- **Development**: $5/mes (hobby plan)
- **Staging**: $5/mes (hobby plan)  
- **Production**: $5/mes (hobby plan)
- **PostgreSQL**: $5/mes (hobby plan)
- **Total**: ~$20/mes

## 🎯 URLs de Desarrollo

- **Development Frontend**: `https://miamente-frontend-dev.railway.app`
- **Development Backend**: `https://miamente-backend-dev.railway.app`
- **Staging Frontend**: `https://miamente-frontend-staging.railway.app`
- **Staging Backend**: `https://miamente-backend-staging.railway.app`
- **Production Frontend**: `https://miamente.com`
- **Production Backend**: `https://miamente-backend.railway.app`
