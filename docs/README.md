# 📚 Documentación Privada - Miamente Platform

**⚠️ CONFIDENCIAL:** Esta carpeta contiene documentación técnica interna del proyecto.

---

## 📁 Contenido

### [ARQUITECTURA.md](./ARQUITECTURA.md)
Documentación completa de la arquitectura del sistema:
- Visión general del proyecto
- Arquitectura de alto nivel (Backend, Frontend, Base de Datos)
- Sistema de autenticación
- Patrones de diseño implementados
- Seguridad y escalabilidad
- Infraestructura y DevOps
- Decisiones arquitectónicas (ADRs)

### [FUNCIONALIDADES.md](./FUNCIONALIDADES.md)
Especificación detallada de todas las funcionalidades:
- Módulos del sistema (Autenticación, Perfiles, Búsqueda, Admin)
- Gestión de catálogos
- Flujos completos de usuario
- Funcionalidades por rol
- Roadmap de futuras funcionalidades
- Métricas de éxito

### [API_ENDPOINTS.md](./API_ENDPOINTS.md)
Documentación técnica de la API (tipo Swagger):
- Todos los endpoints disponibles
- Métodos HTTP, parámetros y respuestas
- Modelos de datos (schemas)
- Códigos de estado
- Ejemplos de uso con cURL
- Configuración de seguridad y CORS

---

## 🔒 Privacidad

Esta carpeta **NO está** en `.gitignore`, lo que significa que:
- ✅ Se versiona con Git
- ✅ Está disponible para el equipo de desarrollo
- ⚠️ **NO debe** compartirse públicamente
- ⚠️ **NO debe** desplegarse en producción

Los archivos `.md` en la raíz del proyecto (excepto el README.md principal) **SÍ están** ignorados por Git para mantener el repositorio limpio.

---

## 📝 Mantenimiento

**Responsable:** Equipo de Desarrollo

**Actualización:**
- Documentación debe actualizarse con cada cambio arquitectónico significativo
- Nuevos endpoints deben documentarse en API_ENDPOINTS.md
- Nuevas funcionalidades deben agregarse a FUNCIONALIDADES.md
- Decisiones arquitectónicas importantes deben registrarse en ARQUITECTURA.md (sección ADR)

**Revisión:**
- Revisión trimestral de documentos
- Actualización antes de cada release mayor

---

## 🎯 Acceso

**Documentación Swagger Interactiva:**
- Desarrollo: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

**Documentación de Producción:**
- Solo accesible internamente (no expuesto públicamente)

---

**Última actualización:** 12 de Octubre de 2025  
**Versión:** 2.0  
**Mantenido por:** Equipo de Desarrollo Miamente

