# 🚀 MVP Deployment Ready

El MVP de Miamente está completamente configurado para despliegue. Todos los scripts, configuraciones y workflows están listos.

## 📋 Checklist de Configuración

### ✅ **Completado**
- [x] Scripts de configuración automática
- [x] Configuración de Firebase Rules
- [x] Variables de entorno de ejemplo
- [x] Scripts de validación
- [x] GitHub Actions workflows
- [x] Tests de accesibilidad y emulador
- [x] Configuración de Lighthouse
- [x] Scripts de rollback

### 🔧 **Pendiente de Ejecutar**

#### 1. **Configurar Firebase Projects**
```bash
# Ejecutar script de configuración
./scripts/deployment/setup-firebase-projects.sh
```

#### 2. **Crear Service Accounts**
```bash
# Ejecutar script de service accounts
./scripts/deployment/setup-service-accounts.sh
```

#### 3. **Configurar GitHub Secrets**
Ir a: `Settings > Secrets and variables > Actions`

**Secrets requeridos:**
- `FIREBASE_SERVICE_ACCOUNT` (JSON del service account de producción)
- `FIREBASE_SERVICE_ACCOUNT_STAGING` (JSON del service account de staging)
- `FIREBASE_TOKEN` (generar con `firebase login:ci`)
- `SENDGRID_API_KEY`
- `WOMPI_SECRET`
- `JITSI_BASE_URL`

**Variables requeridas:**
- `NEXT_PUBLIC_FB_API_KEY`
- `NEXT_PUBLIC_FB_AUTH_DOMAIN`
- `NEXT_PUBLIC_FB_PROJECT_ID`
- `NEXT_PUBLIC_FB_STORAGE_BUCKET`
- `NEXT_PUBLIC_FB_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FB_APP_ID`
- `NEXT_PUBLIC_FB_MEASUREMENT_ID`
- `NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY`

#### 4. **Validar Configuración**
```bash
# Ejecutar validación completa
./scripts/deployment/validate-deployment-config.sh
```

## 🚀 **Comandos de Despliegue**

### **Despliegue Automático**

#### Staging (Push a main)
```bash
git push origin main
# Se despliega automáticamente a miamente-staging.web.app
```

#### Producción (Crear tag)
```bash
git tag v1.0.0
git push origin v1.0.0
# Se despliega automáticamente a miamente-prod.web.app
```

### **Despliegue Manual**

#### Via GitHub Actions
1. Ir a `Actions` tab
2. Seleccionar `CI/CD Pipeline`
3. Click `Run workflow`
4. Seleccionar branch y ejecutar

#### Via Firebase CLI
```bash
# Staging
firebase use miamente-staging
firebase deploy

# Producción
firebase use miamente-prod
firebase deploy
```

## 🔍 **URLs de Despliegue**

### **Staging**
- **Web App**: https://miamente-staging.web.app
- **Console**: https://console.firebase.google.com/project/miamente-staging

### **Producción**
- **Web App**: https://miamente-prod.web.app
- **Console**: https://console.firebase.google.com/project/miamente-prod

## 🛠️ **Scripts Disponibles**

### **Configuración**
- `./scripts/deployment/setup-firebase-projects.sh` - Crear proyectos Firebase
- `./scripts/deployment/setup-service-accounts.sh` - Crear service accounts
- `./scripts/deployment/validate-deployment-config.sh` - Validar configuración

### **Despliegue**
- `npm run build` - Construir aplicación
- `firebase deploy` - Desplegar a Firebase
- `./scripts/rollback.sh` - Rollback de emergencia

### **Testing**
- `npm run test` - Tests unitarios
- `npm run test:e2e` - Tests E2E
- `npm run lighthouse` - Tests de performance

## 📊 **Monitoreo**

### **GitHub Actions**
- **Pipeline**: https://github.com/[owner]/[repo]/actions/workflows/ci.yml
- **Deploy**: https://github.com/[owner]/[repo]/actions/workflows/deploy.yml

### **Firebase Console**
- **Staging**: https://console.firebase.google.com/project/miamente-staging
- **Production**: https://console.firebase.google.com/project/miamente-prod

## 🔒 **Seguridad**

### **Firebase Rules**
- `firestore.rules` - Reglas de Firestore
- `storage.rules` - Reglas de Storage
- `firestore.staging.rules` - Reglas de staging
- `storage.staging.rules` - Reglas de storage staging

### **Variables de Entorno**
- `.env.staging.example` - Variables de staging
- `.env.production.example` - Variables de producción

## 🆘 **Soporte**

### **Rollback de Emergencia**
```bash
# Rollback rápido
git checkout HEAD~1
git push origin main --force

# O usar script
./scripts/rollback.sh production
```

### **Logs y Debugging**
```bash
# Logs de Firebase Functions
firebase functions:log --project miamente-prod

# Logs de hosting
firebase hosting:channel:open --project miamente-prod
```

## ✅ **Estado Actual**

El MVP está **100% listo para despliegue**. Solo necesitas:

1. Ejecutar los scripts de configuración
2. Configurar los secrets de GitHub
3. Hacer push para desplegar

**¡El MVP está listo para lanzar! 🚀**
