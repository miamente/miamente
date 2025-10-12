# 🎯 Funcionalidades del Proyecto Miamente Platform

**Versión:** 2.0.0  
**Fecha:** 12 de Octubre de 2025  
**Confidencial:** Este documento contiene información funcional interna del proyecto

---

## 📖 Índice

1. [Visión General](#visión-general)
2. [Módulo de Autenticación](#módulo-de-autenticación)
3. [Módulo de Perfiles](#módulo-de-perfiles)
4. [Módulo de Búsqueda](#módulo-de-búsqueda)
5. [Panel de Administración](#panel-de-administración)
6. [Gestión de Catálogos](#gestión-de-catálogos)
7. [Gestión de Archivos](#gestión-de-archivos)
8. [Dashboards](#dashboards)
9. [Flujos Completos de Usuario](#flujos-completos-de-usuario)
10. [Funcionalidades por Rol](#funcionalidades-por-rol)

---

## 🎯 Visión General

### Propósito

Miamente Platform es una **plataforma de salud mental** que conecta usuarios que buscan ayuda psicológica con profesionales de la salud mental calificados. El sistema facilita:

- Registro diferenciado para usuarios y profesionales
- Búsqueda y filtrado avanzado de profesionales
- Gestión completa de perfiles
- Panel administrativo para supervisión
- Sistema de roles y permisos

### Usuarios del Sistema

1. **Usuarios (Pacientes)**
   - Buscan ayuda psicológica
   - Exploran perfiles de profesionales
   - Gestionan su información personal

2. **Profesionales (Psicólogos/Terapeutas)**
   - Ofrecen servicios de salud mental
   - Gestionan su perfil profesional
   - Configuran especialidades, enfoques y modalidades

3. **Administradores**
   - Supervisan toda la plataforma
   - Gestionan usuarios y profesionales
   - Administran catálogos del sistema

---

## 🔐 Módulo de Autenticación

### 1.1. Registro de Usuario (Paciente)

**Ruta:** `/register` → Pestaña "Usuario"

**Campos requeridos:**
- Nombre completo
- Email
- Teléfono (código país + número)
- Contraseña (mínimo 8 caracteres)
- Confirmación de contraseña
- Fecha de nacimiento
- Contacto de emergencia (nombre, relación, teléfono)

**Proceso:**
1. Usuario completa formulario
2. Sistema valida datos
3. Crea cuenta con rol "user"
4. Crea perfil de usuario asociado
5. Genera tokens JWT (access + refresh)
6. Redirige a dashboard de usuario

**Validaciones:**
- Email único en el sistema
- Formato de email válido
- Contraseña mínimo 8 caracteres
- Teléfono con formato válido
- Fecha de nacimiento (mayor de 18 años)

---

### 1.2. Registro de Profesional

**Ruta:** `/register` → Pestaña "Profesional"

**Campos requeridos:**
- Todos los campos de usuario +
- Número de licencia profesional
- Años de experiencia
- Descripción corta
- Tarifa por sesión (USD)
- Timezone
- Horario de atención
- Idiomas que maneja
- Experiencia académica (JSON)
- Experiencia laboral (JSON)
- Certificaciones (JSON)

**Proceso:**
1. Profesional completa formulario extenso
2. Sistema valida datos y licencia
3. Crea cuenta con rol "professional"
4. Crea perfil de profesional asociado
5. Genera tokens JWT
6. Redirige a dashboard de profesional

**Validaciones adicionales:**
- Número de licencia único
- Años de experiencia > 0
- Tarifa en formato correcto
- Timezone válido
- Idiomas en formato array

---

### 1.3. Login Unificado

**Ruta:** `/login`

**Campos:**
- Email
- Contraseña

**Proceso:**
1. Usuario/Profesional ingresa credenciales
2. Sistema busca cuenta por email
3. Verifica contraseña hasheada (bcrypt)
4. Valida que cuenta esté activa (`is_active = true`)
5. Actualiza `last_login`
6. Genera tokens JWT
7. Carga perfil según rol
8. Retorna respuesta unificada:
   ```json
   {
     "access_token": "jwt...",
     "refresh_token": "jwt...",
     "account": {
       "id": "uuid",
       "email": "user@example.com",
       "full_name": "John Doe",
       "role_id": "uuid",
       "is_active": true
     },
     "role": "user",
     "profile": {
       // UserProfile o ProfessionalProfile
     }
   }
   ```
9. Redirige según rol:
   - **user** → `/dashboard`
   - **professional** → `/dashboard`
   - **admin** → `/admin`

**Seguridad:**
- Contraseñas hasheadas con bcrypt (12 rounds)
- Tokens JWT firmados (HS256)
- Access token: 7 días
- Refresh token: 30 días
- Protección contra fuerza bruta (rate limiting - futuro)

---

### 1.4. Refresh Token

**Ruta:** `POST /auth/refresh`

**Proceso:**
1. Cliente envía refresh token expirado/próximo a expirar
2. Sistema valida refresh token
3. Genera nuevo access token
4. Retorna nuevo access token (opcional: nuevo refresh token)

**Uso:**
- Mantener sesión sin re-login
- Implementado en frontend automáticamente (interceptor)

---

### 1.5. Obtener Usuario Actual

**Ruta:** `GET /accounts/me`

**Autenticación:** Bearer token requerido

**Respuesta:**
```json
{
  "account": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone_country_code": "+57",
    "phone_number": "3001234567",
    "profile_picture": "url",
    "is_active": true,
    "is_verified": false,
    "last_login": "2025-10-12T10:00:00Z"
  },
  "role": "user",
  "profile": {
    // Perfil específico según rol
  }
}
```

**Uso:**
- Cargar datos de usuario al iniciar sesión
- Verificar estado de autenticación
- Obtener perfil actualizado

---

### 1.6. Logout

**Implementación:** Solo frontend

**Proceso:**
1. Eliminar tokens de localStorage
2. Limpiar estado de autenticación
3. Redirigir a página de login

**Nota:** No hay endpoint de logout en backend (JWT stateless)

---

## 👤 Módulo de Perfiles

### 2.1. Perfil de Usuario (Ver Propio)

**Ruta:** `/profile/user`

**Acceso:** Usuario autenticado (solo su propio perfil)

**Información mostrada:**
- Datos de cuenta:
  - Nombre completo
  - Email
  - Teléfono
  - Foto de perfil
- Datos de perfil:
  - Fecha de nacimiento
  - Contacto de emergencia

**Acciones:**
- Editar datos de cuenta
- Editar datos de perfil
- Cambiar foto de perfil
- Cambiar contraseña (futuro)

---

### 2.2. Perfil de Profesional (Ver Propio)

**Ruta:** `/dashboard` (sección perfil)

**Acceso:** Profesional autenticado

**Información mostrada:**
- Todos los datos de usuario +
- Datos profesionales:
  - Número de licencia
  - Años de experiencia
  - Descripción corta
  - Tarifa por sesión
  - Timezone y horario
  - Idiomas
  - Experiencia académica
  - Experiencia laboral
  - Certificaciones
- Especialidades seleccionadas
- Enfoques terapéuticos seleccionados
- Modalidades de atención configuradas

**Acciones:**
- Editar todos los campos
- Agregar/eliminar especialidades
- Agregar/eliminar enfoques
- Configurar modalidades (presencial/virtual)
- Subir/cambiar certificaciones
- Actualizar foto de perfil

---

### 2.3. Perfil Público de Profesional

**Ruta:** `/professionals/[id]`

**Acceso:** Público (no requiere autenticación)

**Información mostrada:**
- Nombre completo
- Foto de perfil
- Descripción corta
- Años de experiencia
- Tarifa desde (precio más bajo)
- Idiomas
- Especialidades (badges)
- Enfoques terapéuticos (badges)
- Modalidades disponibles (presencial/virtual)
- Experiencia académica (lista)
- Experiencia laboral (lista)
- Certificaciones (lista con imágenes)
- Horario de atención
- Timezone

**Acciones:**
- Ver información completa
- Contactar (futuro: botón de contacto/agendar)
- Compartir perfil (futuro)

**Diseño:**
- Layout atractivo con cards
- Badges visuales para especialidades
- Iconos para modalidades
- Timeline para experiencia

---

### 2.4. Actualizar Perfil

**Endpoints:**
- `PATCH /accounts/{id}` - Datos de cuenta
- `PATCH /accounts/{id}` - Datos de perfil (incluidos en account update)

**Campos editables (Usuario):**
- full_name
- phone_country_code
- phone_number
- profile_picture
- date_of_birth (profile)
- emergency_contact_* (profile)

**Campos editables (Profesional):**
- Todos los de usuario +
- license_number (no editable post-registro)
- years_experience
- rate_cents / custom_rate_cents
- short_description
- academic_experience
- work_experience
- certifications
- languages
- timezone
- working_hours

**Validaciones:**
- Email único (si se cambia)
- Teléfono con formato válido
- Tarifa > 0
- JSON válido para experiencia/certificaciones

---

## 🔍 Módulo de Búsqueda

### 3.1. Búsqueda de Profesionales

**Ruta:** `/professionals`

**Acceso:** Público

**Filtros disponibles:**
1. **Búsqueda por texto:**
   - Nombre del profesional
   - Descripción

2. **Filtros estructurados:**
   - Especialidad (multi-select)
   - Enfoque terapéutico (multi-select)
   - Modalidad (presencial/virtual)
   - Rango de tarifa (slider)
   - Idiomas (multi-select)
   - Años de experiencia (mínimo)

3. **Ordenamiento:**
   - Más recientes
   - Menor tarifa
   - Mayor experiencia
   - Alfabético (A-Z)

**Resultados mostrados:**
- Cards con información resumida:
  - Foto de perfil
  - Nombre completo
  - Especialidades principales (2-3)
  - Tarifa desde
  - Años de experiencia
  - Modalidades disponibles
  - Idiomas

**Paginación:**
- 12 profesionales por página
- Botones previo/siguiente
- Números de página

**Acciones en cada card:**
- Click en card → Ver perfil completo
- Botón "Ver perfil"
- Botón "Contactar" (futuro)

---

### 3.2. Filtrado Avanzado

**Implementación:**
- Filtros en sidebar colapsable (desktop)
- Filtros en modal (mobile)
- Aplicación de filtros en tiempo real
- Counter de resultados encontrados

**Persistencia:**
- Filtros en URL query params
- Restauración de filtros al volver

**UX:**
- Chips mostrando filtros activos
- Botón "Limpiar filtros"
- Indicador de cantidad de filtros activos

---

## 🛡️ Panel de Administración

### 4.1. Dashboard Admin

**Ruta:** `/admin`

**Acceso:** Solo rol "admin"

**Widgets mostrados:**
- Total de usuarios registrados
- Total de profesionales activos
- Registros del último mes
- Gráfico de crecimiento (futuro)

**Navegación:**
- Gestión de usuarios
- Gestión de profesionales
- Gestión de catálogos
- Reportes (futuro)

---

### 4.2. Gestión de Usuarios

**Ruta:** `/admin/users`

**Funcionalidades:**

#### Listar Usuarios
- Tabla con columnas:
  - ID (UUID truncado)
  - Nombre completo
  - Email
  - Teléfono
  - Fecha de registro
  - Último login
  - Estado (Activo/Inactivo)
  - Acciones

- **Búsqueda:**
  - Por nombre
  - Por email

- **Filtros:**
  - Estado (activo/inactivo)
  - Fecha de registro (desde/hasta)

- **Paginación:**
  - 20 usuarios por página
  - Total de registros mostrado

#### Ver Usuario
- Click en fila → Ver detalles completos
- Modal o página dedicada
- Toda la información de cuenta + perfil

#### Editar Usuario
- Botón "Editar" en cada fila
- Formulario con campos editables
- Validación en tiempo real
- Confirmación antes de guardar

#### Activar/Desactivar Usuario
- Toggle switch en columna Estado
- Confirmación antes de cambiar
- Actualiza `is_active` en BD
- Usuarios inactivos no pueden hacer login

#### Eliminar Usuario
- Botón "Eliminar" (icono de basura)
- Modal de confirmación con advertencia
- **Hard delete:** Elimina cuenta + perfil
- **Cascade:** Elimina registros relacionados

**Endpoints usados:**
- `GET /accounts/admin/all?role=user`
- `GET /accounts/{id}`
- `PATCH /accounts/{id}`
- `PATCH /accounts/{id}/status`
- `DELETE /accounts/{id}`

---

### 4.3. Gestión de Profesionales

**Ruta:** `/admin/professionals`

**Funcionalidades:**

#### Listar Profesionales
- Tabla con columnas adicionales:
  - Todas las de usuario +
  - Número de licencia
  - Años de experiencia
  - Tarifa (USD)
  - Especialidades (count)
  - Estado de verificación (futuro)

- **Búsqueda:**
  - Por nombre
  - Por email
  - Por número de licencia

- **Filtros:**
  - Estado (activo/inactivo)
  - Rango de experiencia
  - Rango de tarifa
  - Especialidad
  - Verificado/No verificado (futuro)

#### Ver Profesional
- Vista completa de perfil profesional
- Similar a vista pública pero con más detalles
- Información de auditoría (creado, actualizado)

#### Editar Profesional
- Formulario extenso con todas las secciones
- Validación de licencia
- Edición de experiencia/certificaciones
- Preview de cambios

#### Verificar Profesional (Futuro)
- Proceso de verificación de credenciales
- Cambio de estado `is_verified`
- Badge en perfil público

#### Activar/Desactivar Profesional
- Igual que usuarios
- Profesionales inactivos no aparecen en búsqueda

#### Eliminar Profesional
- Igual que usuarios
- Elimina también relaciones con catálogos

**Endpoints usados:**
- `GET /accounts/admin/all?role=professional`
- `GET /accounts/{id}`
- `PATCH /accounts/{id}`
- `PATCH /accounts/{id}/status`
- `DELETE /accounts/{id}`

---

### 4.4. Gestión de Roles

**Ruta:** `/admin/roles` (futuro, actualmente via API)

**Funcionalidades:**

#### Listar Roles
- user
- professional
- admin

#### Crear Rol (Futuro)
- Nombre único
- Descripción
- Permisos asociados

#### Editar Rol
- Cambiar nombre/descripción
- No editable si está en uso

#### Eliminar Rol
- Solo si no hay cuentas con ese rol

**Endpoints:**
- `GET /roles/`
- `GET /roles/{id}`
- `POST /roles/` (admin)
- `PATCH /roles/{id}` (admin)
- `DELETE /roles/{id}` (admin)

---

## 📚 Gestión de Catálogos

### 5.1. Especialidades

**Ruta:** `/admin/specialties` (admin) | API pública para lectura

**Funcionalidades:**

#### Listar Especialidades
- Tabla con:
  - Nombre
  - Descripción
  - Estado (activo/inactivo)
  - Uso (# profesionales)
  - Acciones

#### Crear Especialidad
- Nombre único
- Descripción opcional
- Estado por defecto: activo

#### Editar Especialidad
- Cambiar nombre/descripción
- Activar/desactivar

#### Eliminar Especialidad
- Solo si no está en uso
- O cambiar a inactivo

**Especialidades actuales (ejemplo):**
- Psicología Clínica
- Psicología Infantil
- Terapia de Pareja
- Psicología Organizacional
- Neuropsicología
- Psicología Educativa

**Endpoints:**
- `GET /specialties/` (público)
- `GET /specialties/{id}` (público)
- `POST /specialties/` (admin)
- `PATCH /specialties/{id}` (admin)
- `DELETE /specialties/{id}` (admin)

---

### 5.2. Enfoques Terapéuticos

**Ruta:** `/admin/therapeutic-approaches` (admin)

**Funcionalidades:**
- Idénticas a Especialidades

**Enfoques actuales (ejemplo):**
- Cognitivo-Conductual (CBT)
- Psicoanálisis
- Humanista
- Sistémico
- Gestalt
- Mindfulness
- EMDR

**Endpoints:**
- `GET /therapeutic-approaches/`
- `POST /therapeutic-approaches/` (admin)
- `PATCH /therapeutic-approaches/{id}` (admin)
- `DELETE /therapeutic-approaches/{id}` (admin)

---

### 5.3. Modalidades de Atención

**Ruta:** `/admin/modalities` (admin)

**Funcionalidades:**
- Idénticas a Especialidades

**Modalidades actuales:**
- Presencial
- Virtual (Videollamada)
- Teléfono
- Chat
- A domicilio

**Endpoints:**
- `GET /modalities/`
- `POST /modalities/` (admin)
- `PATCH /modalities/{id}` (admin)
- `DELETE /modalities/{id}` (admin)

---

### 5.4. Relaciones Profesional-Catálogos

**Funcionalidades:**

#### Asignar Especialidad a Profesional
- `POST /professional-specialties/`
- Body: `{ professional_id, specialty_id }`

#### Listar Especialidades de Profesional
- `GET /professional-specialties/professional/{id}`

#### Eliminar Especialidad de Profesional
- `DELETE /professional-specialties/{id}`

**Idéntico para:**
- Enfoques Terapéuticos (`/professional-therapeutic-approaches/`)
- Modalidades con precios (`/professional-modalities/`)

**Campos adicionales en Modalidades:**
- `virtual_price`: Precio para sesión virtual
- `presencial_price`: Precio para sesión presencial
- `offers_presencial`: Boolean
- `is_default`: Modalidad por defecto del profesional
- `is_active`: Estado

---

## 📁 Gestión de Archivos

### 6.1. Subida de Fotos de Perfil

**Endpoint:** `POST /files/profile-picture`

**Proceso:**
1. Usuario selecciona imagen (input file)
2. Frontend valida:
   - Formato (jpg, png, jpeg, gif, webp)
   - Tamaño máximo (5 MB)
3. Envía como multipart/form-data
4. Backend:
   - Valida archivo
   - Genera nombre único (UUID + extensión)
   - Guarda en `uploads/profile_pictures/`
   - Actualiza `account.profile_picture` con URL/path
5. Retorna URL de imagen

**Validaciones:**
- Content-Type válido
- Tamaño < 5 MB
- Solo imágenes
- Sanitización de nombre

**Storage:**
- Local: `backend/uploads/profile_pictures/`
- Futuro: S3/CloudFront

---

### 6.2. Subida de Certificaciones

**Endpoint:** `POST /files/certification`

**Proceso:**
- Similar a foto de perfil
- Soporta múltiples archivos
- Guarda en `uploads/certifications/`
- Acepta PDF, imágenes
- Tamaño máximo: 10 MB

**Campos adicionales:**
- `title`: Título del certificado
- `institution`: Institución emisora
- `date`: Fecha de obtención

**Storage:**
- Array en `professional_profile.certifications`:
  ```json
  [
    {
      "title": "Maestría en Psicología Clínica",
      "institution": "Universidad Nacional",
      "date": "2020-06",
      "file_url": "/uploads/certifications/abc123.pdf"
    }
  ]
  ```

---

### 6.3. Descarga de Archivos

**Endpoint:** `GET /files/{path}`

**Proceso:**
1. Cliente solicita archivo
2. Backend valida permisos (propio perfil o admin)
3. Verifica que archivo existe
4. Retorna archivo con headers correctos

**Seguridad:**
- Path sanitization (evitar directory traversal)
- Validación de permisos
- Rate limiting (futuro)

---

## 📊 Dashboards

### 7.1. Dashboard de Usuario

**Ruta:** `/dashboard`

**Acceso:** Usuario con rol "user"

**Secciones:**

#### Bienvenida
- Mensaje personalizado: "Hola, {nombre}"
- Resumen de cuenta

#### Información de Perfil
- Datos básicos
- Botón "Editar perfil" → `/profile/user`

#### Búsqueda Rápida
- Acceso directo a búsqueda de profesionales
- Filtros destacados

#### Actividad Reciente (Futuro)
- Profesionales vistos recientemente
- Favoritos guardados

---

### 7.2. Dashboard de Profesional

**Ruta:** `/dashboard`

**Acceso:** Usuario con rol "professional"

**Secciones:**

#### Bienvenida
- Mensaje personalizado
- Estado de perfil (completo/incompleto)

#### Resumen de Perfil
- Foto de perfil
- Descripción corta
- Especialidades (count)
- Tarifa
- Estado (activo/inactivo)

#### Completar Perfil
- Indicador de progreso (%)
- Lista de campos faltantes
- Links rápidos a edición

#### Gestión de Perfil
- Editar información básica
- Gestionar especialidades
- Configurar modalidades
- Subir certificaciones

#### Estadísticas (Futuro)
- Vistas de perfil
- Contactos recibidos
- Rating promedio

---

### 7.3. Dashboard de Admin

**Ruta:** `/admin`

**Acceso:** Usuario con rol "admin"

**Ver sección 4.1**

---

## 🔄 Flujos Completos de Usuario

### 8.1. Flujo: Usuario Busca Profesional

```
1. Usuario (sin login) → Landing page
   ↓
2. Click "Buscar profesionales" → /professionals
   ↓
3. Ve listado de profesionales
   ↓
4. Aplica filtros:
   - Especialidad: "Terapia de Pareja"
   - Modalidad: "Virtual"
   - Rango tarifa: $20-50
   ↓
5. Sistema filtra y muestra 8 resultados
   ↓
6. Usuario click en profesional
   ↓
7. Ve perfil completo: /professionals/uuid
   ↓
8. Lee experiencia, certificaciones
   ↓
9. Decide contactar (futuro: botón contactar)
```

---

### 8.2. Flujo: Profesional Se Registra

```
1. Profesional → /register
   ↓
2. Selecciona pestaña "Profesional"
   ↓
3. Completa formulario (Paso 1: Datos básicos)
   - Nombre, email, contraseña, teléfono
   ↓
4. Avanza (Paso 2: Datos profesionales)
   - Licencia, experiencia, tarifa
   ↓
5. Avanza (Paso 3: Detalles)
   - Descripción, idiomas, horario
   ↓
6. Selecciona especialidades (multi-select)
   ↓
7. Selecciona enfoques terapéuticos
   ↓
8. Configura modalidades con precios
   ↓
9. Sube certificaciones (opcional)
   ↓
10. Submit → POST /accounts/register/professional
    ↓
11. Backend:
    - Crea account con role "professional"
    - Crea professional_profile
    - Crea relaciones con catálogos
    - Genera tokens
    ↓
12. Frontend recibe response
    ↓
13. Guarda tokens
    ↓
14. Redirige a /dashboard
    ↓
15. Dashboard muestra:
    - "Perfil 100% completo" (si completó todo)
    - O "Completa tu perfil" (si faltó algo)
```

---

### 8.3. Flujo: Admin Gestiona Usuarios

```
1. Admin → Login → /admin
   ↓
2. Dashboard admin
   ↓
3. Click "Gestionar Usuarios" → /admin/users
   ↓
4. Ve tabla con 50 usuarios
   ↓
5. Busca por email: "john@"
   ↓
6. Sistema filtra, muestra 3 resultados
   ↓
7. Admin click en usuario "John Doe"
   ↓
8. Modal con detalles completos
   ↓
9. Admin nota que email es incorrecto
   ↓
10. Click "Editar"
    ↓
11. Formulario editable
    ↓
12. Cambia email → "johndoe@example.com"
    ↓
13. Submit → PATCH /accounts/{id}
    ↓
14. Backend valida email único
    ↓
15. Actualiza BD
    ↓
16. Retorna account actualizado
    ↓
17. Frontend actualiza tabla
    ↓
18. Mensaje: "Usuario actualizado exitosamente"
```

---

### 8.4. Flujo: Profesional Actualiza Tarifa

```
1. Profesional logueado → /dashboard
   ↓
2. Sección "Modalidades de Atención"
   ↓
3. Ve:
   - Virtual: $40/sesión [Editar]
   - Presencial: $50/sesión [Editar]
   ↓
4. Click "Editar" en Virtual
   ↓
5. Modal con input de tarifa
   ↓
6. Cambia $40 → $45
   ↓
7. Submit → PATCH /professional-modalities/{id}
   ↓
8. Backend actualiza `virtual_price`
   ↓
9. Frontend actualiza vista
   ↓
10. Mensaje: "Tarifa actualizada"
    ↓
11. En búsqueda pública ahora se muestra:
    "Desde $45/sesión"
```

---

## 🎭 Funcionalidades por Rol

### 9.1. Usuario (user)

**Puede:**
- ✅ Ver su propio perfil
- ✅ Editar su propio perfil
- ✅ Buscar profesionales (público)
- ✅ Ver perfiles públicos de profesionales
- ✅ Acceder a su dashboard
- ❌ No puede ver otros usuarios
- ❌ No puede acceder a admin

**Endpoints accesibles:**
```
GET /accounts/me
GET /accounts/{own_id}
PATCH /accounts/{own_id}
GET /professionals (público)
GET /professionals/{id} (público)
GET /specialties (público)
GET /therapeutic-approaches (público)
GET /modalities (público)
POST /files/profile-picture
```

---

### 9.2. Profesional (professional)

**Puede:**
- ✅ Todo lo de usuario +
- ✅ Gestionar su perfil profesional completo
- ✅ Gestionar especialidades propias
- ✅ Gestionar enfoques terapéuticos propios
- ✅ Configurar modalidades y precios
- ✅ Subir certificaciones
- ❌ No puede ver otros profesionales (perfil privado)
- ❌ No puede acceder a admin

**Endpoints adicionales:**
```
POST /professional-specialties/
GET /professional-specialties/professional/{own_id}
DELETE /professional-specialties/{id}
POST /professional-therapeutic-approaches/
GET /professional-therapeutic-approaches/professional/{own_id}
DELETE /professional-therapeutic-approaches/{id}
POST /professional-modalities/
GET /professional-modalities/professional/{own_id}
PATCH /professional-modalities/{id}
DELETE /professional-modalities/{id}
POST /files/certification
```

---

### 9.3. Administrador (admin)

**Puede:**
- ✅ Todo de usuario y profesional +
- ✅ Ver todos los usuarios
- ✅ Ver todos los profesionales
- ✅ Editar cualquier cuenta
- ✅ Activar/desactivar cuentas
- ✅ Eliminar cuentas
- ✅ Gestionar catálogos (CRUD completo)
- ✅ Ver estadísticas del sistema
- ✅ Acceder a panel de administración

**Endpoints adicionales:**
```
GET /accounts/admin/all
GET /accounts/{any_id}
PATCH /accounts/{any_id}
DELETE /accounts/{any_id}
PATCH /accounts/{any_id}/status
POST /specialties/
PATCH /specialties/{id}
DELETE /specialties/{id}
POST /therapeutic-approaches/
PATCH /therapeutic-approaches/{id}
DELETE /therapeutic-approaches/{id}
POST /modalities/
PATCH /modalities/{id}
DELETE /modalities/{id}
GET /roles/ (acceso a gestión)
POST /roles/
PATCH /roles/{id}
DELETE /roles/{id}
```

---

## 🚀 Funcionalidades Futuras (Roadmap)

### Fase 2: Comunicación

- **Mensajería interna**
  - Chat entre usuario y profesional
  - Notificaciones en tiempo real
  - Historial de conversaciones

- **Sistema de notificaciones**
  - Email notifications
  - Push notifications (PWA)
  - In-app notifications

### Fase 3: Agendamiento

- **Sistema de citas**
  - Calendario de disponibilidad del profesional
  - Reserva de citas por usuario
  - Confirmación/cancelación
  - Recordatorios automáticos

- **Videollamadas integradas**
  - Llamadas directas en plataforma
  - Integración con Zoom/Meet
  - Recording (opcional, con consentimiento)

### Fase 4: Pagos

- **Pasarela de pagos**
  - Integración Stripe/PayU
  - Pagos con tarjeta
  - Facturación automática
  - Historial de pagos

- **Suscripciones**
  - Planes para profesionales (básico/premium)
  - Comisión por cita agendada
  - Planes para usuarios (sesiones paquetes)

### Fase 5: Valoraciones

- **Sistema de reviews**
  - Usuarios valoran a profesionales
  - Rating de 1-5 estrellas
  - Comentarios
  - Moderación de reviews

- **Profesionales destacados**
  - Badge de "Top Rated"
  - Aparición prioritaria en búsqueda
  - Estadísticas públicas

### Fase 6: Contenido

- **Blog/Recursos**
  - Artículos de salud mental
  - Videos educativos
  - Podcast (futuro)

- **Directorio de recursos**
  - Líneas de ayuda
  - Recursos gratuitos
  - Enlaces a organizaciones

### Fase 7: Analytics

- **Dashboard de profesional avanzado**
  - Estadísticas de perfil
  - Métricas de conversión
  - Ingresos mensuales
  - Gráficos interactivos

- **Dashboard de admin avanzado**
  - KPIs del negocio
  - Crecimiento de usuarios
  - Revenue tracking
  - Reportes exportables (PDF, Excel)

### Fase 8: Mobile

- **App móvil nativa**
  - React Native / Flutter
  - Push notifications
  - Offline mode
  - App Store / Play Store

- **Progressive Web App (PWA)**
  - Installable
  - Offline support
  - Service Workers

### Fase 9: IA

- **Recomendaciones inteligentes**
  - ML para matching usuario-profesional
  - Sugerencias personalizadas

- **Chatbot de soporte**
  - Respuestas automáticas FAQ
  - Derivación a humano si necesario

- **Análisis de sentimiento**
  - Análisis de reviews
  - Detección de crisis (futuro sensible)

---

## 📈 Métricas de Éxito

### KPIs Actuales a Medir

**Registros:**
- Usuarios registrados/día
- Profesionales registrados/día
- Ratio usuario:profesional

**Actividad:**
- Logins diarios
- Búsquedas de profesionales/día
- Perfiles visitados/día
- Tiempo promedio en plataforma

**Calidad:**
- Perfiles profesionales completos (%)
- Usuarios con foto de perfil (%)
- Tiempo promedio para completar registro

**Técnicas:**
- Uptime (target: 99.9%)
- Response time API (target: < 500ms p95)
- Error rate (target: < 0.1%)

---

## 🎓 Glosario

**Account:** Cuenta unificada que representa a cualquier usuario del sistema (user, professional, admin).

**Profile:** Datos específicos asociados a un account según su rol (user_profile o professional_profile).

**Role:** Rol asignado a un account que determina permisos y funcionalidades.

**Catalog:** Tablas de datos configurables sin código (specialties, therapeutic_approaches, modalities).

**Junction Table:** Tabla intermedia que relaciona many-to-many (ej: professional_specialties).

**JWT:** JSON Web Token, método de autenticación stateless usado en el sistema.

**RBAC:** Role-Based Access Control, sistema de permisos basado en roles.

**Hard Delete:** Eliminación física de registro de BD (vs soft delete que solo marca como eliminado).

**Active Account:** Cuenta con `is_active = true` que puede hacer login.

**Verified Account:** Cuenta cuyas credenciales han sido verificadas por admin (solo profesionales).

---

**Documento confidencial - Solo para uso interno del equipo de desarrollo**

**Última actualización:** 12 de Octubre de 2025  
**Versión:** 2.0  
**Mantenido por:** Equipo de Desarrollo Miamente

