# 🏥 Miamente Platform

[![CI/CD Pipeline](https://github.com/manueljurado/miamente_platform/actions/workflows/ci.yml/badge.svg)](https://github.com/manueljurado/miamente_platform/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](https://github.com/manueljurado/miamente_platform)
[![Python](https://img.shields.io/badge/python-3.13.7-blue)](https://www.python.org/)
[![Node](https://img.shields.io/badge/node-v22-brightgreen)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> Plataforma moderna de salud mental que conecta pacientes con profesionales de la salud mental.

---

## 🎯 Acerca del Proyecto

**Miamente** es una plataforma integral diseñada para facilitar el acceso a servicios de salud mental, conectando a personas que buscan ayuda psicológica con profesionales certificados.

### Para Usuarios

- 🔍 **Búsqueda avanzada** de profesionales por especialidad y enfoque terapéutico
- 👁️ **Perfiles completos** con información detallada de cada profesional
- 🛡️ **Confidencialidad** y seguridad en el manejo de datos
- 📱 **Acceso multiplataforma** (web responsive)

### Para Profesionales

- 📋 **Gestión de perfil profesional** completo y personalizado
- 🎓 **Exhibición de credenciales** y experiencia
- ⏰ **Configuración de disponibilidad** y tarifas
- 💼 **Visibilidad** ante potenciales pacientes

### Para Administradores

- 📊 **Panel de control** completo de la plataforma
- 👥 **Gestión de usuarios** y profesionales
- 🔧 **Configuración de catálogos** del sistema

---

## ✨ Características Principales

- ✅ **Sistema de autenticación** seguro con roles diferenciados
- ✅ **Búsqueda y filtrado avanzado** de profesionales
- ✅ **Perfiles profesionales** completos y detallados
- ✅ **Panel administrativo** para gestión del sistema
- ✅ **Gestión de especialidades** y enfoques terapéuticos
- ✅ **Responsive design** para todos los dispositivos
- ✅ **API RESTful** documentada

---

## 🚀 Tecnologías

### Frontend
- Next.js 15 con React 19
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend
- FastAPI (Python 3.13)
- PostgreSQL
- SQLAlchemy
- JWT Authentication

### DevOps
- Docker
- GitHub Actions (CI/CD)
- Railway (Hosting)

---

## 🏁 Inicio Rápido

### Requisitos Previos

- Node.js v22
- Python 3.13.7
- PostgreSQL 16+
- Docker (opcional)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/manueljurado/miamente_platform.git
cd miamente_platform

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend (en otra terminal)
cd apps/web
npm install
npm run dev
```

### Acceso

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Documentación API:** http://localhost:8000/docs

---

## 📚 Documentación

### Para el Equipo de Desarrollo

La documentación técnica completa está disponible en la carpeta `docs/` (acceso interno):

- **Arquitectura del Sistema:** `docs/ARQUITECTURA.md`
- **Funcionalidades:** `docs/FUNCIONALIDADES.md`
- **API Endpoints:** `docs/API_ENDPOINTS.md`

### Documentación Interactiva

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 🧪 Tests

El proyecto cuenta con una cobertura completa de tests:

```bash
# Tests Backend
cd backend
pytest

# Tests Frontend
cd apps/web
npm test

# Tests E2E
cd tests/e2e
npm test
```

---

## 🔒 Seguridad

- Autenticación mediante JWT tokens
- Contraseñas hasheadas con bcrypt
- Control de acceso basado en roles (RBAC)
- Validación de datos con Pydantic
- CORS configurado
- Rate limiting (en desarrollo)

---

## 📝 Estrategia de Branches

El proyecto utiliza GitFlow:

- `main` - Producción
- `develop` - Desarrollo estable
- `feature/*` - Nuevas características
- `hotfix/*` - Correcciones urgentes

Consultar `BRANCH_STRATEGY.md` para más detalles.

---

## 🗺️ Roadmap

### Próximas Funcionalidades

- [ ] Sistema de mensajería entre usuario y profesional
- [ ] Agendamiento de citas
- [ ] Pasarela de pagos integrada
- [ ] Sistema de valoraciones y reseñas
- [ ] Videollamadas integradas
- [ ] Aplicación móvil nativa
- [ ] Notificaciones push

---

## 🤝 Contribuir

Este es un proyecto privado. Si eres parte del equipo de desarrollo:

1. Crear una rama `feature/nombre-feature` desde `develop`
2. Realizar los cambios siguiendo las convenciones del proyecto
3. Ejecutar tests y linting
4. Crear Pull Request hacia `develop`
5. Solicitar revisión de código

**Importante:** Nunca hacer commit con `--no-verify`. Los hooks de pre-commit deben ejecutarse siempre.

---

## 📄 Licencia

Este proyecto es propiedad privada de Miamente. Todos los derechos reservados.

---

## 📧 Contacto

**Equipo de Desarrollo:** dev@miamente.com

---

## 🙏 Agradecimientos

- Equipo de desarrollo
- Profesionales de la salud mental que colaboraron con feedback
- Usuarios beta testers

---

**Última actualización:** 12 de Octubre de 2025  
**Versión:** 2.0.0  
**Estado:** MVP - Listo para Producción
