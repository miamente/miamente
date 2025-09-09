# Rama: Professional Profile Update

## 🎯 Objetivo

Esta rama se enfoca en mejorar y expandir la funcionalidad de actualización de perfiles profesionales en la plataforma Miamente.

## 📋 Funcionalidades Planificadas

### 1. Mejoras en la Vista de Edición de Perfil

- [ ] Interfaz más intuitiva y moderna
- [ ] Validación en tiempo real de formularios
- [ ] Mejor manejo de errores y mensajes de feedback
- [ ] Preview de cambios antes de guardar

### 2. Nuevas Características de Perfil

- [ ] Subida de fotos de perfil
- [ ] Gestión de certificaciones
- [ ] Configuración de disponibilidad avanzada
- [ ] Integración con calendario

### 3. Mejoras en la Experiencia de Usuario

- [ ] Navegación mejorada entre secciones
- [ ] Autoguardado de cambios
- [ ] Historial de cambios
- [ ] Exportación de perfil

### 4. Validaciones y Seguridad

- [ ] Validación de datos más robusta
- [ ] Sanitización de inputs
- [ ] Verificación de permisos mejorada
- [ ] Auditoría de cambios

## 🗂️ Archivos Principales

### Backend

- `app/api/v1/endpoints/professionals.py` - Endpoints de profesionales
- `app/schemas/professional.py` - Esquemas de validación
- `app/models/professional.py` - Modelo de datos
- `app/services/professional_service.py` - Lógica de negocio

### Frontend

- `apps/web/src/app/professionals/edit/page.tsx` - Página de edición
- `apps/web/src/components/` - Componentes de UI
- `apps/web/src/lib/profiles.ts` - Funciones de API
- `apps/web/src/hooks/useAuth.ts` - Hook de autenticación

## 🧪 Testing

### Usuarios de Prueba Disponibles

- **Psicóloga:** `psicologo@miamente.com` / `psicologo123`
- **Psiquiatra:** `psiquiatra@miamente.com` / `psiquiatra123`
- **Terapeuta:** `terapeuta@miamente.com` / `terapeuta123`

### Casos de Prueba

1. **Login como profesional**
2. **Acceso a perfil propio**
3. **Edición de información básica**
4. **Gestión de experiencia académica**
5. **Gestión de experiencia laboral**
6. **Validación de permisos**
7. **Manejo de errores**

## 🚀 Cómo Usar

### 1. Iniciar el Backend

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### 2. Iniciar el Frontend

```bash
cd apps/web
nvm use v22
npm run dev
```

### 3. Probar la Funcionalidad

1. Ir a `http://localhost:3000/login`
2. Usar credenciales de profesional
3. Navegar a `/professionals` y hacer clic en "Editar Perfil"
4. Probar todas las funcionalidades de edición

## 📝 Notas de Desarrollo

### Estructura de Datos

- Los perfiles profesionales incluyen experiencia académica y laboral
- Los datos se almacenan como JSON en la base de datos
- Se requiere validación tanto en frontend como backend

### Consideraciones de Seguridad

- Solo el profesional propietario puede editar su perfil
- Validación de permisos en cada endpoint
- Sanitización de datos de entrada

### Mejoras Futuras

- Integración con servicios de terceros
- Notificaciones en tiempo real
- Análisis de datos de perfil
- Recomendaciones automáticas

## 🔄 Estado Actual

- ✅ Base de datos configurada con usuarios de prueba
- ✅ Endpoints básicos de profesionales implementados
- ✅ Página de edición de perfil funcional
- ✅ Autenticación y autorización implementadas
- ✅ Componentes de UI básicos creados

## 📚 Documentación Relacionada

- `DATABASE_USERS.md` - Información completa de usuarios
- `TEST_PROFESSIONAL_INFO.md` - Detalles del profesional de prueba
- `README.md` - Documentación general del proyecto

---

_Última actualización: $(date)_
_Rama: feature/professional-profile-update_
