# 🚀 Railway Deployment Setup para Miamente Platform

## 📋 Pre-requisitos

1. Cuenta en [Railway.app](https://railway.app)
2. Railway CLI instalado: `npm install -g @railway/cli`
3. Tu proyecto en GitHub

## 🛠️ Configuración paso a paso

### 1. **Conectar proyecto a Railway**

```bash
# Login a Railway
railway login

# Crear nuevo proyecto
railway init

# Conectar repositorio GitHub
railway connect
```

### 2. **Configurar servicios**

Railway detectará automáticamente:
- ✅ **Frontend** (Next.js en `/apps/web`)
- ✅ **Backend** (FastAPI en `/apps/api`) 
- ✅ **PostgreSQL** (base de datos administrada)

### 3. **Variables de entorno obligatorias**

#### **Para el Backend:**
```bash
# Copiar desde railway-env-template.txt
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=tu_jwt_secret_super_seguro
CORS_ORIGINS=https://tu-frontend.railway.app,https://tu-dominio.com
ENVIRONMENT=production
```

#### **Para el Frontend:**
```bash
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app
NEXT_PUBLIC_ENVIRONMENT=production
```

### 4. **Configurar GitHub Actions**

1. **Crear Railway Token:**
   - Ve a Railway Dashboard → Settings → Tokens
   - Crea un nuevo token
   - Cópialo

2. **Agregar secrets a GitHub:**
   ```
   RAILWAY_TOKEN=tu_railway_token
   STAGING_URL=https://tu-frontend-staging.railway.app
   PRODUCTION_URL=https://tu-frontend-prod.railway.app
   ```

### 5. **Configurar ambientes**

```bash
# Crear ambiente de staging
railway environment create staging

# Crear ambiente de production  
railway environment create production
```

## 🔄 **Workflow completo**

### **Desarrollo:**
1. Feature branch → PR a `develop` → CI se ejecuta
2. Merge a `develop` → Solo CI (sin deploy)
3. PR de `develop` a `staging` → CI se ejecuta
4. Merge a `staging` → Deploy automático a staging + **E2E tests completos**
5. PR de `staging` a `main` → CI se ejecuta  
6. Merge a `main` → Deploy automático a production + **Smoke tests rápidos**

### **Estructura de branches:**
```
main (production) ← staging (staging) ← develop ← feature/your-feature
```

## 🧪 **Testing**

### **Local:**
```bash
# E2E tests locales
cd tests/e2e
npm test

# Solo smoke tests locales
npm run test:smoke
```

### **Staging (E2E completos):**
```bash
# E2E tests completos contra staging
PLAYWRIGHT_BASE_URL=https://tu-staging.railway.app npm test
```

### **Production (Solo smoke tests):**
```bash
# Solo smoke tests contra production
PLAYWRIGHT_BASE_URL=https://tu-production.railway.app npm run test:smoke
```

## 💰 **Costos estimados**

- **Frontend**: $5/mes (hobby plan)
- **Backend**: $5/mes (hobby plan)
- **PostgreSQL**: $5/mes (hobby plan)
- **Total**: ~$15/mes

## 🚀 **Comandos útiles**

```bash
# Deploy manual
railway up

# Ver logs
railway logs

# Conectar a base de datos
railway connect Postgres

# Ver variables de entorno
railway variables

# Cambiar ambiente
railway environment set staging
```

## 🔧 **Troubleshooting**

### **Backend no inicia:**
- Verificar `DATABASE_URL` en variables de entorno
- Verificar que `uvicorn` esté en requirements

### **Frontend no conecta al backend:**
- Verificar `NEXT_PUBLIC_API_URL`
- Verificar CORS en backend

### **E2E tests fallan:**
- Verificar `PLAYWRIGHT_BASE_URL`
- Verificar que ambos servicios estén online

## 📚 **Recursos**

- [Railway Docs](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Playwright Docs](https://playwright.dev/docs)
