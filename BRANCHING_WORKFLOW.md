# 🌳 Flujo de Branching y Rollback Automático

## 📋 Estructura de Ramas Implementada

### **Ramas Principales**

#### `main` (Producción)
- **Propósito**: Código estable y listo para producción
- **Deploy**: Automático a producción cuando se hace push
- **Protección**: Requiere PR + reviews + tests passing
- **Rollback**: Automático en caso de fallos

#### `develop` (Staging/Desarrollo)
- **Propósito**: Integración de features para testing
- **Deploy**: Automático a staging cuando se hace push
- **Protección**: Requiere PR + tests passing
- **Rollback**: Automático en caso de fallos

### **Ramas de Soporte**

#### `feature/*` (Features)
- **Formato**: `feature/descripcion-corta`
- **Ejemplos**: 
  - `feature/user-authentication`
  - `feature/payment-integration`
  - `feature/appointment-booking`
- **Origen**: `develop`
- **Destino**: `develop` (via PR)

#### `release/*` (Releases)
- **Formato**: `release/v1.0.0`
- **Propósito**: Preparar nueva versión para producción
- **Origen**: `develop`
- **Destino**: `main` y `develop`

#### `hotfix/*` (Hotfixes)
- **Formato**: `hotfix/descripcion-corta`
- **Ejemplos**: `hotfix/critical-security-fix`
- **Origen**: `main`
- **Destino**: `main` y `develop`

## 🚀 Comandos de Gestión de Ramas

### **Crear Ramas**

```bash
# Crear feature branch
./scripts/deployment/branch-management.sh feature user-authentication

# Crear release branch
./scripts/deployment/branch-management.sh release v1.1.0

# Crear hotfix branch
./scripts/deployment/branch-management.sh hotfix critical-bug
```

### **Finalizar Ramas**

```bash
# Finalizar feature
./scripts/deployment/branch-management.sh finish-feature user-authentication

# Finalizar release
./scripts/deployment/branch-management.sh finish-release v1.1.0

# Finalizar hotfix
./scripts/deployment/branch-management.sh finish-hotfix critical-bug
```

### **Ver Estado**

```bash
# Ver estado de ramas
./scripts/deployment/branch-management.sh status
```

## 🔄 Sistema de Rollback Automático

### **Características del Rollback Automático**

1. **Monitoreo Continuo**: Verifica la salud de las aplicaciones cada 30 segundos
2. **Detección Inteligente**: Identifica fallos en endpoints críticos
3. **Rollback Automático**: Revierte automáticamente a la última versión estable
4. **Notificaciones**: Crea issues de GitHub y notifica al equipo
5. **Verificación**: Confirma que el rollback fue exitoso

### **Comandos de Rollback**

```bash
# Monitorear ambiente
./scripts/deployment/auto-rollback.sh monitor production
./scripts/deployment/auto-rollback.sh monitor staging

# Rollback manual
./scripts/deployment/auto-rollback.sh rollback production "Critical bug detected"
./scripts/deployment/auto-rollback.sh rollback staging "Testing rollback"

# Verificar salud
./scripts/deployment/auto-rollback.sh health
```

### **Triggers Automáticos**

1. **Fallos de Deploy**: Rollback automático cuando falla un deployment
2. **Health Checks**: Rollback automático cuando fallan los health checks
3. **Endpoints Críticos**: Rollback automático cuando fallan endpoints importantes
4. **Timeouts**: Rollback automático después de un timeout configurado

## 🏷️ Gestión de Releases

### **Crear Release**

```bash
# Crear tag de versión
git tag v1.0.0
git push origin v1.0.0

# O usar workflow manual
# Ir a Actions > Release Management > Run workflow
```

### **Proceso Automático de Release**

1. **Crear Tag**: `git tag v1.0.0 && git push origin v1.0.0`
2. **Build Automático**: Se construye la aplicación
3. **Deploy Automático**: Se despliega a producción
4. **Health Checks**: Se verifican los endpoints
5. **Monitoreo**: Se inicia el monitoreo automático
6. **Notificación**: Se notifica al equipo

## 📊 Entornos y URLs

### **Development** (`develop`)
- **URL**: https://miamente-staging.web.app
- **Base de datos**: miamente-staging
- **Deploy**: Automático en push a develop
- **Rollback**: Automático en caso de fallos

### **Production** (`main`)
- **URL**: https://miamente-prod.web.app
- **Base de datos**: miamente-prod
- **Deploy**: Automático en push a main o tag
- **Rollback**: Automático en caso de fallos

## 🛡️ Protección de Ramas

### **main**
- Requiere Pull Request
- Requiere 1+ review aprobado
- Requiere que todos los tests pasen
- No permite push directo
- Rollback automático habilitado

### **develop**
- Requiere Pull Request
- Requiere que todos los tests pasen
- No permite push directo
- Rollback automático habilitado

## 📝 Convenciones de Commits

### **Formato**: `tipo(scope): descripción`

#### **Tipos**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Formato, espacios, etc.
- `refactor`: Refactoring de código
- `test`: Tests
- `chore`: Tareas de mantenimiento

#### **Ejemplos**
```bash
git commit -m "feat(auth): add Google OAuth integration"
git commit -m "fix(payment): resolve Wompi API timeout issue"
git commit -m "docs(api): update authentication endpoints"
```

## �� Casos de Emergencia

### **Rollback Automático**
El sistema detecta automáticamente:
- Fallos de HTTP (status != 200)
- Fallos en endpoints críticos
- Timeouts de respuesta
- Errores de conectividad

### **Rollback Manual**
```bash
# Rollback inmediato
./scripts/deployment/auto-rollback.sh rollback production "Emergency rollback"

# Verificar salud
./scripts/deployment/auto-rollback.sh health
```

### **Monitoreo Continuo**
```bash
# Iniciar monitoreo
./scripts/deployment/auto-rollback.sh monitor production
```

## 📈 Métricas y Monitoreo

### **Health Checks**
- **Intervalo**: 30 segundos
- **Endpoints críticos**: /, /login, /register, /professionals
- **Timeout**: 10 segundos por endpoint
- **Umbral de fallos**: 3 fallos consecutivos

### **Rollback Metrics**
- **Tiempo de detección**: < 2 minutos
- **Tiempo de rollback**: < 5 minutos
- **Verificación**: Automática
- **Notificaciones**: Inmediatas

### **Release Metrics**
- **Tiempo de build**: < 10 minutos
- **Tiempo de deploy**: < 5 minutos
- **Health check**: < 2 minutos
- **Total**: < 20 minutos

## 🎯 Beneficios del Sistema

1. **Estabilidad**: main siempre está estable
2. **Flexibilidad**: develop permite experimentación
3. **Automatización**: Deploy y rollback automáticos
4. **Seguridad**: Protección de ramas críticas
5. **Monitoreo**: Detección proactiva de problemas
6. **Recuperación**: Rollback automático en caso de fallos
7. **Trazabilidad**: Cada cambio está documentado
8. **Escalabilidad**: Fácil de mantener con equipo creciente

## 🚀 Próximos Pasos

1. **Configurar Protección de Ramas** en GitHub
2. **Configurar Secrets** de GitHub
3. **Probar el Sistema** en staging
4. **Entrenar al Equipo** en el flujo
5. **Monitorear Métricas** de rollback

## 📞 Soporte

### **En caso de problemas:**
1. Verificar logs de rollback: `logs/rollback.log`
2. Revisar issues de GitHub con label `rollback`
3. Ejecutar health checks: `./scripts/deployment/auto-rollback.sh health`
4. Contactar al equipo de desarrollo

### **Comandos de Emergencia:**
```bash
# Verificar salud
./scripts/deployment/auto-rollback.sh health

# Rollback manual
./scripts/deployment/auto-rollback.sh rollback production "Emergency"

# Ver estado de ramas
./scripts/deployment/branch-management.sh status
```

**¡El sistema está listo para manejar el crecimiento del MVP! 🚀**
