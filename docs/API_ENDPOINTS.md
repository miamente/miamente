# 🔌 API Endpoints - Miamente Platform

**Versión API:** v1  
**Base URL:** `http://localhost:8000/api/v1` (desarrollo)  
**Base URL:** `https://api.miamente.com/api/v1` (producción)  
**Fecha:** 12 de Octubre de 2025  
**Confidencial:** Este documento contiene información técnica interna

---

## 📖 Índice

1. [Información General](#información-general)
2. [Autenticación](#autenticación)
3. [Accounts](#accounts)
4. [Roles](#roles)
5. [Specialties](#specialties)
6. [Therapeutic Approaches](#therapeutic-approaches)
7. [Modalities](#modalities)
8. [Professional Specialties](#professional-specialties)
9. [Professional Therapeutic Approaches](#professional-therapeutic-approaches)
10. [Professional Modalities](#professional-modalities)
11. [Files](#files)
12. [Códigos de Estado](#códigos-de-estado)
13. [Modelos de Datos](#modelos-de-datos)

---

## 📋 Información General

### Formato de Respuesta

Todas las respuestas siguen el formato JSON:

```json
{
  "data": {...},
  "message": "Success",
  "status": 200
}
```

### Formato de Error

```json
{
  "detail": "Error message",
  "status": 400
}
```

### Autenticación

La mayoría de endpoints requieren autenticación mediante JWT token en el header:

```
Authorization: Bearer {access_token}
```

### Paginación

Endpoints que retornan listas soportan paginación:

**Query Parameters:**
- `skip`: Número de registros a saltar (default: 0)
- `limit`: Número máximo de registros (default: 100, max: 1000)

**Respuesta paginada:**
```json
{
  "items": [...],
  "total": 150,
  "skip": 0,
  "limit": 20
}
```

---

## 🔐 Autenticación

### POST `/accounts/login`

**Descripción:** Login unificado para todos los roles

**Autenticación:** No requerida

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "account": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone_country_code": "+57",
    "phone_number": "3001234567",
    "profile_picture": null,
    "is_active": true,
    "is_verified": false,
    "last_login": "2025-10-12T10:00:00Z",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-10-12T10:00:00Z",
    "role_id": "role-uuid"
  },
  "role": "user",
  "profile": {
    // UserProfile o ProfessionalProfile según rol
  }
}
```

**Errores:**
- `401 Unauthorized`: Credenciales inválidas
- `403 Forbidden`: Cuenta inactiva
- `422 Unprocessable Entity`: Datos inválidos

---

### POST `/accounts/register/user`

**Descripción:** Registro de nuevo usuario (paciente)

**Autenticación:** No requerida

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securepass123",
  "full_name": "Jane Smith",
  "phone_country_code": "+1",
  "phone_number": "5551234567",
  "date_of_birth": "1990-05-15",
  "emergency_contact_name": "John Smith",
  "emergency_contact_relationship": "Spouse",
  "emergency_contact_phone": "+15559876543"
}
```

**Response:** `201 Created`
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer",
  "account": {...},
  "role": "user",
  "profile": {
    "account_id": "uuid",
    "date_of_birth": "1990-05-15",
    "emergency_contact_name": "John Smith",
    "emergency_contact_relationship": "Spouse",
    "emergency_contact_phone": "+15559876543"
  }
}
```

**Errores:**
- `400 Bad Request`: Email ya existe
- `422 Unprocessable Entity`: Datos inválidos

---

### POST `/accounts/register/professional`

**Descripción:** Registro de nuevo profesional

**Autenticación:** No requerida

**Request Body:**
```json
{
  "email": "doctor@example.com",
  "password": "securepass123",
  "full_name": "Dr. Sarah Johnson",
  "phone_country_code": "+57",
  "phone_number": "3009876543",
  "date_of_birth": "1985-03-20",
  "emergency_contact_name": "Emergency Contact",
  "emergency_contact_relationship": "Sibling",
  "emergency_contact_phone": "+573001234567",
  "license_number": "PSY-12345",
  "years_experience": 8,
  "rate_cents": 5000,
  "currency": "USD",
  "short_description": "Experienced clinical psychologist specializing in CBT",
  "academic_experience": [
    {
      "degree": "PhD in Clinical Psychology",
      "institution": "Stanford University",
      "year": 2015
    }
  ],
  "work_experience": [
    {
      "position": "Clinical Psychologist",
      "organization": "Mental Health Clinic",
      "years": "2015-2023"
    }
  ],
  "certifications": [
    {
      "title": "Certified CBT Therapist",
      "institution": "CBT Academy",
      "date": "2016-08"
    }
  ],
  "languages": ["English", "Spanish"],
  "timezone": "America/Bogota",
  "working_hours": {
    "monday": "09:00-17:00",
    "tuesday": "09:00-17:00",
    "wednesday": "09:00-17:00",
    "thursday": "09:00-17:00",
    "friday": "09:00-17:00"
  }
}
```

**Response:** `201 Created`
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer",
  "account": {...},
  "role": "professional",
  "profile": {
    "account_id": "uuid",
    "license_number": "PSY-12345",
    "years_experience": 8,
    "rate_cents": 5000,
    "custom_rate_cents": null,
    "currency": "USD",
    "short_description": "...",
    "academic_experience": "[...]",
    "work_experience": "[...]",
    "certifications": "[...]",
    "languages": ["English", "Spanish"],
    "timezone": "America/Bogota",
    "working_hours": "{...}",
    "emergency_contact_name": "...",
    "emergency_contact_relationship": "...",
    "emergency_contact_phone": "..."
  }
}
```

**Errores:**
- `400 Bad Request`: Email o licencia ya existe
- `422 Unprocessable Entity`: Datos inválidos

---

### POST `/auth/refresh`

**Descripción:** Renovar access token usando refresh token

**Autenticación:** No requerida (usa refresh token)

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "access_token": "new-access-token...",
  "token_type": "bearer"
}
```

**Errores:**
- `401 Unauthorized`: Refresh token inválido o expirado

---

## 👤 Accounts

### GET `/accounts/me`

**Descripción:** Obtener cuenta y perfil del usuario autenticado

**Autenticación:** Requerida

**Response:** `200 OK`
```json
{
  "account": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "phone_country_code": "+57",
    "phone_number": "3001234567",
    "profile_picture": "https://...",
    "is_active": true,
    "is_verified": false,
    "last_login": "2025-10-12T10:00:00Z",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-10-12T10:00:00Z",
    "role_id": "role-uuid"
  },
  "role": "user",
  "profile": {
    // UserProfile o ProfessionalProfile según rol
  }
}
```

**Errores:**
- `401 Unauthorized`: Token inválido

---

### GET `/accounts/admin/all`

**Descripción:** Listar todas las cuentas (admin)

**Autenticación:** Requerida (Admin)

**Query Parameters:**
- `skip` (int, default: 0): Paginación
- `limit` (int, default: 100): Registros por página
- `role` (string, optional): Filtrar por rol ("user", "professional", "admin")
- `search` (string, optional): Buscar por nombre o email
- `is_active` (bool, optional): Filtrar por estado activo

**Response:** `200 OK`
```json
{
  "items": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": {
        "id": "role-uuid",
        "name": "user",
        "description": "Regular user"
      },
      "is_active": true,
      "is_verified": false,
      "created_at": "2025-01-01T00:00:00Z",
      "last_login": "2025-10-12T10:00:00Z"
    }
  ],
  "total": 150,
  "skip": 0,
  "limit": 20
}
```

**Errores:**
- `403 Forbidden`: No es admin

---

### GET `/accounts/{account_id}`

**Descripción:** Obtener cuenta específica por ID

**Autenticación:** Requerida (Propia cuenta o Admin)

**Path Parameters:**
- `account_id` (UUID): ID de la cuenta

**Response:** `200 OK`
```json
{
  "account": {...},
  "role": "user",
  "profile": {...}
}
```

**Errores:**
- `403 Forbidden`: No tiene permisos
- `404 Not Found`: Cuenta no existe

---

### PATCH `/accounts/{account_id}`

**Descripción:** Actualizar cuenta y perfil

**Autenticación:** Requerida (Propia cuenta o Admin)

**Path Parameters:**
- `account_id` (UUID): ID de la cuenta

**Request Body** (todos los campos opcionales):
```json
{
  "full_name": "John Updated Doe",
  "phone_country_code": "+1",
  "phone_number": "5551234567",
  "profile_picture": "https://new-image.jpg",
  "date_of_birth": "1990-06-15",
  "emergency_contact_name": "New Contact",
  "short_description": "Updated bio",
  "years_experience": 10,
  "rate_cents": 6000
  // ... más campos según tipo de perfil
}
```

**Response:** `200 OK`
```json
{
  "account": {...},
  "role": "user",
  "profile": {...}
}
```

**Errores:**
- `403 Forbidden`: No tiene permisos
- `404 Not Found`: Cuenta no existe
- `422 Unprocessable Entity`: Datos inválidos

---

### DELETE `/accounts/{account_id}`

**Descripción:** Eliminar cuenta (hard delete)

**Autenticación:** Requerida (Admin)

**Path Parameters:**
- `account_id` (UUID): ID de la cuenta

**Response:** `204 No Content`

**Errores:**
- `403 Forbidden`: No es admin
- `404 Not Found`: Cuenta no existe

---

### PATCH `/accounts/{account_id}/status`

**Descripción:** Activar/desactivar cuenta

**Autenticación:** Requerida (Admin)

**Path Parameters:**
- `account_id` (UUID): ID de la cuenta

**Request Body:**
```json
{
  "is_active": false
}
```

**Response:** `200 OK`
```json
{
  "account": {...},
  "role": "user",
  "profile": {...}
}
```

**Errores:**
- `403 Forbidden`: No es admin
- `404 Not Found`: Cuenta no existe

---

## 🎭 Roles

### GET `/roles/`

**Descripción:** Listar todos los roles

**Autenticación:** No requerida

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "user",
    "description": "Regular user account",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  },
  {
    "id": "uuid",
    "name": "professional",
    "description": "Mental health professional",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  },
  {
    "id": "uuid",
    "name": "admin",
    "description": "System administrator",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

---

### GET `/roles/{role_id}`

**Descripción:** Obtener rol específico

**Autenticación:** No requerida

**Path Parameters:**
- `role_id` (UUID): ID del rol

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "user",
  "description": "Regular user account",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

**Errores:**
- `404 Not Found`: Rol no existe

---

### POST `/roles/`

**Descripción:** Crear nuevo rol (Admin)

**Autenticación:** Requerida (Admin)

**Request Body:**
```json
{
  "name": "moderator",
  "description": "Content moderator"
}
```

**Response:** `201 Created`
```json
{
  "id": "new-uuid",
  "name": "moderator",
  "description": "Content moderator",
  "created_at": "2025-10-12T10:00:00Z",
  "updated_at": "2025-10-12T10:00:00Z"
}
```

**Errores:**
- `400 Bad Request`: Nombre ya existe
- `403 Forbidden`: No es admin

---

### PATCH `/roles/{role_id}`

**Descripción:** Actualizar rol (Admin)

**Autenticación:** Requerida (Admin)

**Path Parameters:**
- `role_id` (UUID): ID del rol

**Request Body:**
```json
{
  "name": "super_admin",
  "description": "Super administrator with all permissions"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "super_admin",
  "description": "Super administrator with all permissions",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-10-12T10:00:00Z"
}
```

**Errores:**
- `403 Forbidden`: No es admin
- `404 Not Found`: Rol no existe

---

### DELETE `/roles/{role_id}`

**Descripción:** Eliminar rol (Admin)

**Autenticación:** Requerida (Admin)

**Path Parameters:**
- `role_id` (UUID): ID del rol

**Response:** `204 No Content`

**Errores:**
- `400 Bad Request`: Rol está en uso
- `403 Forbidden`: No es admin
- `404 Not Found`: Rol no existe

---

## 🎓 Specialties

### GET `/specialties/`

**Descripción:** Listar todas las especialidades

**Autenticación:** No requerida

**Query Parameters:**
- `skip` (int, default: 0)
- `limit` (int, default: 100)
- `is_active` (bool, optional): Filtrar activos

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Clinical Psychology",
    "description": "Assessment and treatment of mental disorders",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  },
  {
    "id": "uuid",
    "name": "Child Psychology",
    "description": "Mental health care for children and adolescents",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

---

### GET `/specialties/{specialty_id}`

**Descripción:** Obtener especialidad específica

**Autenticación:** No requerida

**Path Parameters:**
- `specialty_id` (UUID): ID de la especialidad

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Clinical Psychology",
  "description": "Assessment and treatment of mental disorders",
  "is_active": true,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

**Errores:**
- `404 Not Found`: Especialidad no existe

---

### POST `/specialties/`

**Descripción:** Crear nueva especialidad (Admin)

**Autenticación:** Requerida (Admin)

**Request Body:**
```json
{
  "name": "Neuropsychology",
  "description": "Study of brain-behavior relationships",
  "is_active": true
}
```

**Response:** `201 Created`
```json
{
  "id": "new-uuid",
  "name": "Neuropsychology",
  "description": "Study of brain-behavior relationships",
  "is_active": true,
  "created_at": "2025-10-12T10:00:00Z",
  "updated_at": "2025-10-12T10:00:00Z"
}
```

**Errores:**
- `400 Bad Request`: Nombre ya existe
- `403 Forbidden`: No es admin

---

### PATCH `/specialties/{specialty_id}`

**Descripción:** Actualizar especialidad (Admin)

**Autenticación:** Requerida (Admin)

**Path Parameters:**
- `specialty_id` (UUID): ID de la especialidad

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "is_active": false
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Updated Name",
  "description": "Updated description",
  "is_active": false,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-10-12T10:00:00Z"
}
```

**Errores:**
- `403 Forbidden`: No es admin
- `404 Not Found`: Especialidad no existe

---

### DELETE `/specialties/{specialty_id}`

**Descripción:** Eliminar especialidad (Admin)

**Autenticación:** Requerida (Admin)

**Path Parameters:**
- `specialty_id` (UUID): ID de la especialidad

**Response:** `204 No Content`

**Errores:**
- `400 Bad Request`: Especialidad está en uso
- `403 Forbidden`: No es admin
- `404 Not Found`: Especialidad no existe

---

## 💭 Therapeutic Approaches

**Endpoints idénticos a Specialties, reemplazando `/specialties/` con `/therapeutic-approaches/`**

### GET `/therapeutic-approaches/`
### GET `/therapeutic-approaches/{id}`
### POST `/therapeutic-approaches/` (Admin)
### PATCH `/therapeutic-approaches/{id}` (Admin)
### DELETE `/therapeutic-approaches/{id}` (Admin)

**Ejemplo de datos:**
```json
{
  "id": "uuid",
  "name": "Cognitive Behavioral Therapy",
  "description": "CBT focuses on changing negative thought patterns",
  "is_active": true,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

---

## 🏥 Modalities

**Endpoints idénticos a Specialties, reemplazando `/specialties/` con `/modalities/`**

### GET `/modalities/`
### GET `/modalities/{id}`
### POST `/modalities/` (Admin)
### PATCH `/modalities/{id}` (Admin)
### DELETE `/modalities/{id}` (Admin)

**Ejemplo de datos:**
```json
{
  "id": "uuid",
  "name": "Virtual Session",
  "description": "Online video call sessions",
  "is_active": true,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

---

## 🔗 Professional Specialties

### GET `/professional-specialties/professional/{professional_id}`

**Descripción:** Obtener especialidades de un profesional

**Autenticación:** No requerida (pública)

**Path Parameters:**
- `professional_id` (UUID): ID del profesional

**Response:** `200 OK`
```json
[
  {
    "id": "relation-uuid",
    "professional_id": "professional-uuid",
    "specialty_id": "specialty-uuid",
    "specialty": {
      "id": "specialty-uuid",
      "name": "Clinical Psychology",
      "description": "...",
      "is_active": true
    },
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

**Errores:**
- `404 Not Found`: Profesional no existe

---

### POST `/professional-specialties/`

**Descripción:** Asignar especialidad a profesional

**Autenticación:** Requerida (Profesional propio o Admin)

**Request Body:**
```json
{
  "professional_id": "professional-uuid",
  "specialty_id": "specialty-uuid"
}
```

**Response:** `201 Created`
```json
{
  "id": "new-relation-uuid",
  "professional_id": "professional-uuid",
  "specialty_id": "specialty-uuid",
  "specialty": {...},
  "created_at": "2025-10-12T10:00:00Z"
}
```

**Errores:**
- `400 Bad Request`: Relación ya existe
- `403 Forbidden`: No autorizado
- `404 Not Found`: Professional o Specialty no existe

---

### DELETE `/professional-specialties/{relation_id}`

**Descripción:** Eliminar especialidad de profesional

**Autenticación:** Requerida (Profesional propio o Admin)

**Path Parameters:**
- `relation_id` (UUID): ID de la relación

**Response:** `204 No Content`

**Errores:**
- `403 Forbidden`: No autorizado
- `404 Not Found`: Relación no existe

---

## 🧠 Professional Therapeutic Approaches

**Endpoints idénticos a Professional Specialties**

### GET `/professional-therapeutic-approaches/professional/{professional_id}`
### POST `/professional-therapeutic-approaches/`
### DELETE `/professional-therapeutic-approaches/{relation_id}`

**Estructura de datos idéntica, reemplazando `specialty` con `therapeutic_approach`**

---

## 📍 Professional Modalities

### GET `/professional-modalities/professional/{professional_id}`

**Descripción:** Obtener modalidades de un profesional

**Autenticación:** No requerida

**Path Parameters:**
- `professional_id` (UUID): ID del profesional

**Response:** `200 OK`
```json
[
  {
    "id": "relation-uuid",
    "professional_id": "professional-uuid",
    "modality_id": "modality-uuid",
    "modality": {
      "id": "modality-uuid",
      "name": "Virtual Session",
      "description": "...",
      "is_active": true
    },
    "virtual_price": 4000,
    "presencial_price": 5000,
    "offers_presencial": true,
    "is_default": true,
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

---

### POST `/professional-modalities/`

**Descripción:** Asignar modalidad a profesional con precios

**Autenticación:** Requerida (Profesional propio o Admin)

**Request Body:**
```json
{
  "professional_id": "professional-uuid",
  "modality_id": "modality-uuid",
  "virtual_price": 4000,
  "presencial_price": 5000,
  "offers_presencial": true,
  "is_default": false,
  "is_active": true
}
```

**Response:** `201 Created`
```json
{
  "id": "new-relation-uuid",
  "professional_id": "professional-uuid",
  "modality_id": "modality-uuid",
  "modality": {...},
  "virtual_price": 4000,
  "presencial_price": 5000,
  "offers_presencial": true,
  "is_default": false,
  "is_active": true,
  "created_at": "2025-10-12T10:00:00Z",
  "updated_at": "2025-10-12T10:00:00Z"
}
```

**Errores:**
- `400 Bad Request`: Relación ya existe
- `403 Forbidden`: No autorizado
- `404 Not Found`: Professional o Modality no existe

---

### PATCH `/professional-modalities/{relation_id}`

**Descripción:** Actualizar modalidad de profesional

**Autenticación:** Requerida (Profesional propio o Admin)

**Path Parameters:**
- `relation_id` (UUID): ID de la relación

**Request Body:**
```json
{
  "virtual_price": 4500,
  "presencial_price": 5500,
  "is_default": true,
  "is_active": true
}
```

**Response:** `200 OK`
```json
{
  "id": "relation-uuid",
  "professional_id": "professional-uuid",
  "modality_id": "modality-uuid",
  "modality": {...},
  "virtual_price": 4500,
  "presencial_price": 5500,
  "offers_presencial": true,
  "is_default": true,
  "is_active": true,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-10-12T10:00:00Z"
}
```

**Errores:**
- `403 Forbidden`: No autorizado
- `404 Not Found`: Relación no existe

---

### DELETE `/professional-modalities/{relation_id}`

**Descripción:** Eliminar modalidad de profesional

**Autenticación:** Requerida (Profesional propio o Admin)

**Path Parameters:**
- `relation_id` (UUID): ID de la relación

**Response:** `204 No Content`

**Errores:**
- `403 Forbidden`: No autorizado
- `404 Not Found`: Relación no existe

---

## 📁 Files

### POST `/files/profile-picture`

**Descripción:** Subir foto de perfil

**Autenticación:** Requerida

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (File): Imagen (jpg, png, jpeg, gif, webp)
- `account_id` (UUID): ID de la cuenta

**Response:** `200 OK`
```json
{
  "filename": "550e8400-e29b-41d4-a716-446655440000.jpg",
  "url": "/uploads/profile_pictures/550e8400-e29b-41d4-a716-446655440000.jpg",
  "size": 245678,
  "content_type": "image/jpeg"
}
```

**Validaciones:**
- Tamaño máximo: 5 MB
- Formatos permitidos: jpg, png, jpeg, gif, webp
- Solo el propietario o admin puede subir

**Errores:**
- `400 Bad Request`: Archivo inválido
- `403 Forbidden`: No autorizado
- `413 Payload Too Large`: Archivo muy grande

---

### POST `/files/certification`

**Descripción:** Subir certificación profesional

**Autenticación:** Requerida (Profesional)

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (File): PDF o imagen
- `professional_id` (UUID): ID del profesional
- `title` (string): Título del certificado
- `institution` (string): Institución emisora
- `date` (string): Fecha (YYYY-MM)

**Response:** `200 OK`
```json
{
  "filename": "uuid.pdf",
  "url": "/uploads/certifications/uuid.pdf",
  "size": 1234567,
  "content_type": "application/pdf",
  "metadata": {
    "title": "Master's Degree in Clinical Psychology",
    "institution": "Stanford University",
    "date": "2015-06"
  }
}
```

**Validaciones:**
- Tamaño máximo: 10 MB
- Formatos: pdf, jpg, png, jpeg
- Solo el profesional propietario o admin

**Errores:**
- `400 Bad Request`: Archivo inválido
- `403 Forbidden`: No es profesional o no autorizado
- `413 Payload Too Large`: Archivo muy grande

---

### GET `/files/{path}`

**Descripción:** Descargar archivo

**Autenticación:** Depende del tipo de archivo
- Profile pictures: Público
- Certifications: Propietario o admin

**Path Parameters:**
- `path` (string): Ruta relativa del archivo (ej: `profile_pictures/uuid.jpg`)

**Response:** `200 OK`
- Body: Contenido del archivo
- Headers:
  - `Content-Type`: Tipo MIME del archivo
  - `Content-Disposition`: inline o attachment
  - `Content-Length`: Tamaño en bytes

**Errores:**
- `403 Forbidden`: No autorizado
- `404 Not Found`: Archivo no existe

---

## 📊 Códigos de Estado

### Éxito (2xx)

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Operación exitosa (GET, PATCH) |
| 201 | Created | Recurso creado (POST) |
| 204 | No Content | Eliminación exitosa (DELETE) |

### Errores del Cliente (4xx)

| Código | Significado | Uso |
|--------|-------------|-----|
| 400 | Bad Request | Datos inválidos, regla de negocio violada |
| 401 | Unauthorized | Token ausente o inválido |
| 403 | Forbidden | No tiene permisos para la operación |
| 404 | Not Found | Recurso no existe |
| 422 | Unprocessable Entity | Validación de Pydantic falló |
| 413 | Payload Too Large | Archivo muy grande |

### Errores del Servidor (5xx)

| Código | Significado | Uso |
|--------|-------------|-----|
| 500 | Internal Server Error | Error no manejado del servidor |
| 503 | Service Unavailable | Servicio temporalmente no disponible |

---

## 📦 Modelos de Datos

### Account

```typescript
{
  id: string (UUID)
  email: string
  full_name: string
  phone_country_code: string | null
  phone_number: string | null
  profile_picture: string | null
  is_active: boolean
  is_verified: boolean
  last_login: string (ISO 8601) | null
  created_at: string (ISO 8601)
  updated_at: string (ISO 8601)
  role_id: string (UUID)
}
```

### Role

```typescript
{
  id: string (UUID)
  name: string  // "user" | "professional" | "admin"
  description: string
  created_at: string (ISO 8601)
  updated_at: string (ISO 8601)
}
```

### UserProfile

```typescript
{
  account_id: string (UUID)
  date_of_birth: string (YYYY-MM-DD)
  emergency_contact_name: string
  emergency_contact_relationship: string
  emergency_contact_phone: string
}
```

### ProfessionalProfile

```typescript
{
  account_id: string (UUID)
  license_number: string
  years_experience: number
  rate_cents: number
  custom_rate_cents: number | null
  currency: string  // "USD"
  short_description: string
  academic_experience: string  // JSON string
  work_experience: string  // JSON string
  certifications: string  // JSON string
  languages: string[]
  timezone: string
  working_hours: string  // JSON string
  emergency_contact_name: string
  emergency_contact_relationship: string
  emergency_contact_phone: string
}
```

### Specialty

```typescript
{
  id: string (UUID)
  name: string
  description: string | null
  is_active: boolean
  created_at: string (ISO 8601)
  updated_at: string (ISO 8601)
}
```

### TherapeuticApproach

```typescript
{
  id: string (UUID)
  name: string
  description: string | null
  is_active: boolean
  created_at: string (ISO 8601)
  updated_at: string (ISO 8601)
}
```

### Modality

```typescript
{
  id: string (UUID)
  name: string
  description: string | null
  is_active: boolean
  created_at: string (ISO 8601)
  updated_at: string (ISO 8601)
}
```

### ProfessionalSpecialty

```typescript
{
  id: string (UUID)
  professional_id: string (UUID)
  specialty_id: string (UUID)
  specialty: Specialty
  created_at: string (ISO 8601)
}
```

### ProfessionalTherapeuticApproach

```typescript
{
  id: string (UUID)
  professional_id: string (UUID)
  therapeutic_approach_id: string (UUID)
  therapeutic_approach: TherapeuticApproach
  created_at: string (ISO 8601)
}
```

### ProfessionalModality

```typescript
{
  id: string (UUID)
  professional_id: string (UUID)
  modality_id: string (UUID)
  modality: Modality
  virtual_price: number | null
  presencial_price: number | null
  offers_presencial: boolean
  is_default: boolean
  is_active: boolean
  created_at: string (ISO 8601)
  updated_at: string (ISO 8601)
}
```

### AccountWithProfile (Response Type)

```typescript
{
  account: Account
  role: string  // "user" | "professional" | "admin"
  profile: UserProfile | ProfessionalProfile | null
}
```

### AccountWithRole (Admin Response Type)

```typescript
{
  id: string (UUID)
  email: string
  full_name: string
  role: Role
  is_active: boolean
  is_verified: boolean
  created_at: string (ISO 8601)
  last_login: string (ISO 8601) | null
}
```

### PaginatedResponse<T>

```typescript
{
  items: T[]
  total: number
  skip: number
  limit: number
}
```

### UnifiedAuthResponse

```typescript
{
  access_token: string
  refresh_token: string
  token_type: "bearer"
  account: Account
  role: string
  profile: UserProfile | ProfessionalProfile | null
}
```

---

## 🔍 Ejemplos de Uso

### Ejemplo 1: Login y obtener perfil

```bash
# 1. Login
curl -X POST http://localhost:8000/api/v1/accounts/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Response:
# {
#   "access_token": "eyJ...",
#   "refresh_token": "eyJ...",
#   "account": {...},
#   "role": "user",
#   "profile": {...}
# }

# 2. Obtener perfil actual
curl -X GET http://localhost:8000/api/v1/accounts/me \
  -H "Authorization: Bearer eyJ..."

# Response:
# {
#   "account": {...},
#   "role": "user",
#   "profile": {...}
# }
```

---

### Ejemplo 2: Buscar profesionales (Admin)

```bash
# Obtener todos los profesionales con paginación
curl -X GET "http://localhost:8000/api/v1/accounts/admin/all?role=professional&skip=0&limit=20" \
  -H "Authorization: Bearer {admin_token}"

# Response:
# {
#   "items": [
#     {
#       "id": "uuid",
#       "email": "doctor@example.com",
#       "full_name": "Dr. Sarah Johnson",
#       "role": {
#         "name": "professional"
#       },
#       "is_active": true
#     }
#   ],
#   "total": 45,
#   "skip": 0,
#   "limit": 20
# }
```

---

### Ejemplo 3: Profesional agrega especialidad

```bash
# 1. Obtener especialidades disponibles
curl -X GET http://localhost:8000/api/v1/specialties/

# Response: [{ "id": "specialty-uuid", "name": "Clinical Psychology" }]

# 2. Asignar especialidad
curl -X POST http://localhost:8000/api/v1/professional-specialties/ \
  -H "Authorization: Bearer {professional_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "professional_id": "my-uuid",
    "specialty_id": "specialty-uuid"
  }'

# Response:
# {
#   "id": "relation-uuid",
#   "professional_id": "my-uuid",
#   "specialty_id": "specialty-uuid",
#   "specialty": {
#     "id": "specialty-uuid",
#     "name": "Clinical Psychology"
#   }
# }
```

---

### Ejemplo 4: Subir foto de perfil

```bash
curl -X POST http://localhost:8000/api/v1/files/profile-picture \
  -H "Authorization: Bearer {token}" \
  -F "file=@/path/to/photo.jpg" \
  -F "account_id=my-uuid"

# Response:
# {
#   "filename": "uuid.jpg",
#   "url": "/uploads/profile_pictures/uuid.jpg",
#   "size": 245678,
#   "content_type": "image/jpeg"
# }
```

---

## 🔐 Seguridad

### Rate Limiting (Futuro)

```
Login: 5 intentos / 5 minutos
Registration: 3 intentos / hora
File Upload: 10 archivos / minuto
General API: 100 requests / minuto
```

### Headers de Seguridad

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### CORS

```
Allowed Origins: http://localhost:3000 (dev), https://miamente.com (prod)
Allowed Methods: GET, POST, PATCH, DELETE
Allowed Headers: *, Authorization
Allow Credentials: true
```

---

## 📝 Notas Adicionales

### Timestamps

Todos los timestamps están en formato ISO 8601 (UTC):
```
2025-10-12T10:00:00Z
```

### UUIDs

Todos los IDs son UUIDs v4:
```
550e8400-e29b-41d4-a716-446655440000
```

### JSON Fields

Algunos campos almacenan JSON como string y deben ser parseados:
- `academic_experience`
- `work_experience`
- `certifications`
- `working_hours`

### Precios

Los precios se almacenan en centavos (cents) para evitar errores de redondeo:
```
$50.00 = 5000 cents
```

---

## 📞 Soporte

Para consultas técnicas sobre esta API:
- **Email interno:** dev@miamente.com
- **Documentación Swagger:** http://localhost:8000/docs (desarrollo)
- **ReDoc:** http://localhost:8000/redoc (desarrollo)

---

**Documento confidencial - Solo para uso interno del equipo de desarrollo**

**Última actualización:** 12 de Octubre de 2025  
**Versión API:** v1  
**Mantenido por:** Equipo de Desarrollo Miamente

